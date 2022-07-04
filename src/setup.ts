import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import * as io from "@actions/io";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import got from "got";

import { getVersionObject, getVersionData } from "./lib/get-version";
import { restoreCache } from "./cache-restore";
import * as types from "./lib/types";

const IS_WINDOWS = process.platform === "win32";

async function run() {
  try {
    const nodeArchToReleaseArch = {
      x64: "amd64",
      arm: "arm",
    };
    const nodePlatformToReleasePlatform = {
      darwin: "darwin",
      freebsd: "freebsd",
      linux: "linux",
      openbsd: "openbsd",
      win32: "windows",
    };
    const runnerPlatform = os.platform();
    const pkgName = core.getInput("package");
    const license_class = core.getInput("licenseClass");

    if (!(runnerPlatform in nodePlatformToReleasePlatform)) {
      throw new Error(
        `Unsupported operating system - ${pkgName} is only released for ${Object.keys(
          nodePlatformToReleasePlatform
        ).join(", ")}`
      );
    }

    let result: types.Index | undefined;
    try {
      result = await getVersionData(
        pkgName,
        license_class as "enterprise" | "oss"
      );
    } catch (e: unknown) {
      if (e instanceof got.RequestError && e.response?.statusCode == 404) {
        throw new Error(
          `Could not find package - ${pkgName}. Check https://releases.hashicorp.com/index.json for valid keys.`
        );
      }
      throw e;
    }

    const root = result;
    const index = types.IndexRt.check(root);
    const releasePlatform = nodePlatformToReleasePlatform[runnerPlatform];
    const releaseArch = nodeArchToReleaseArch[os.arch()];

    const range = core.getInput("version");
    core.info(`Configured range: ${range}`);
    const { version, builds } = await getVersionObject(index, range);

    core.info(`Matched version: ${version}`);

    const destination = path.join(os.homedir(), `.${pkgName}`);
    core.info(`Install destination is ${destination}`);

    const installationDir = path.join(destination, "bin");
    const installationPath = path.join(
      installationDir,
      `${pkgName}${IS_WINDOWS ? ".exe" : ""}`
    );
    core.info(`Matched version: ${version}`);

    // first see if package is in the toolcache (installed locally)
    const toolcacheDir = tc.find(pkgName, version, os.arch());

    if (toolcacheDir) {
      core.addPath(toolcacheDir);
      core.info(`using earthly from toolcache (${toolcacheDir})`);
      return;
    }

    // then try to restore package from the github action cache
    core.addPath(installationDir);
    const restored = await restoreCache(pkgName, installationPath, version);
    if (restored) {
      await fs.promises.chmod(installationPath, 0o755);
      return;
    }

    // finally, dowload release binary
    await io
      .rmRF(installationDir)
      .catch()
      .then(() => {
        core.info(`Successfully deleted pre-existing ${installationDir}`);
      });

    const build = builds.find((b) => {
      return b.os == releasePlatform && b.arch == releaseArch;
    });

    if (!build) {
      throw new Error(
        `Could not find build with requested architecture, os, and version. arch: ${releaseArch}, os: ${releasePlatform}, version: ${version}`
      );
    }

    const downloaded = await tc.downloadTool(build.url, installationPath);
    core.debug(`successfully downloaded ${build.name}@${build.version}`);

    await io.mkdirP(destination);
    core.info(`Successfully created ${destination}`);

    let extractedPath: string;
    switch (path.extname(build.url)) {
      case ".zip":
        extractedPath = await tc.extractZip(downloaded, destination);
        break;
      default:
        extractedPath = await tc.extractTar(downloaded, destination);
        break;
    }

    core.info(`Successfully extracted ${downloaded} to ${extractedPath}`);
    const oldPath = path.join(destination, pkgName);
    const newPath = path.join(destination, "bin", pkgName);
    await io.mv(oldPath, newPath);
    core.info(`Successfully renamed ${oldPath} to ${newPath}`);

    await tc.cacheDir(
      path.join(destination, "bin"),
      pkgName,
      version,
      os.arch()
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(String(error));
    }
  }
}

run();
