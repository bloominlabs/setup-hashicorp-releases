import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as fs from "fs";
import * as os from "os";
import * as io from "@actions/io";
import * as path from "path";
import { getVersionObject } from "./lib/get-version";
import got from "got/dist/source";
import * as types from "./lib/types";

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

    if (!(runnerPlatform in nodePlatformToReleasePlatform)) {
      throw new Error(
        `Unsupported operating system - ${pkgName} is only released for ${Object.keys(
          nodePlatformToReleasePlatform
        ).join(", ")}`
      );
    }

    const result = await got<Record<string, unknown>>(
      "https://releases.hashicorp.com/index.json",
      {
        responseType: "json",
      }
    );
    const root = result.body[pkgName];
    if (!root) {
      throw new Error(
        `Could not find package - ${pkgName}. Check https://releases.hashicorp.com/index.json for valid keys.`
      );
    }

    const index = types.IndexRt.check(root);
    const releasePlatform = nodePlatformToReleasePlatform[runnerPlatform];
    const releaseArch = nodeArchToReleaseArch[os.arch()];

    const range = core.getInput("version");
    core.info(`Configured range: ${range}`);
    const { version, builds } = await getVersionObject(index, range);

    core.info(`Matched version: ${version}`);

    const destination = path.join(os.homedir(), `.${pkgName}`);
    core.info(`Install destination is ${destination}`);

    await io
      .rmRF(path.join(destination, "bin"))
      .catch()
      .then(() => {
        core.info(
          `Successfully deleted pre-existing ${path.join(destination, "bin")}`
        );
      });

    const build = builds.find((b) => {
      return b.os == releasePlatform && b.arch == releaseArch;
    });

    if (!build) {
      throw new Error(
        `Could not find build with requested architecture, os, and version. arch: ${releaseArch}, os: ${releasePlatform}, version: ${version}`
      );
    }

    const downloaded = await tc.downloadTool(build.url);
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

    const cachedPath = await tc.cacheDir(
      path.join(destination, "bin"),
      pkgName,
      version
    );
    core.addPath(cachedPath);
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(String(error));
    }
  }
}

run();
