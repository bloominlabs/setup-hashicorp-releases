import * as core from "@actions/core";
import got from "got";
import * as rt from "runtypes";
import { maxSatisfying, gte } from "semver";
const fetch = require("node-fetch");

const OsRt = rt.Union(
  rt.Literal("darwin"),
  rt.Literal("dragonfly"),
  rt.Literal("freebsd"),
  rt.Literal("linux"),
  rt.Literal("netbsd"),
  rt.Literal("openbsd"),
  rt.Literal("solaris"),
  rt.Literal("windows")
);

const ArchRt = rt.Union(
  rt.Literal("arm"),
  rt.Literal("arm64"),
  rt.Literal("amd64"),
  rt.Literal("386")
);

const BuildRt = rt.Record({
  name: rt.String,
  version: rt.String,
  os: OsRt,
  arch: ArchRt,
  filename: rt.String,
  url: rt.String,
});

const VersionRt = rt.Record({
  name: rt.String,
  version: rt.String,
  shasums: rt.String,
  shasums_signature: rt.String,
  shasums_signatures: rt.Array(rt.String),
  builds: rt.Array(BuildRt),
});

const IndexRt = rt.Record({
  name: rt.String,
  versions: rt.Dictionary(VersionRt),
});

export type Version = rt.Static<typeof VersionRt>;

export async function getVersionObject(range: string): Promise<Version> {
  const result = await got(
    "https://releases.hashicorp.com/envconsul/index.json",
    { responseType: "json" }
  );

  const index = IndexRt.check(result.body);
  const versions = index.versions;
  if (range == "latest") {
    const latest = Object.keys(versions).reduce((prev, cur) => {
      return gte(cur, prev) ? cur : prev;
    });
    invariant(latest, "expect a latest version to exists");
    return versions[latest];
  }

  const resp = maxSatisfying(Object.keys(versions), range);
  console.log(resp);
  if (resp === null) {
    throw new Error(
      "Could not find a version that satisfied the version range"
    );
  }

  const ver = versions[resp];
  if (!ver) {
    throw new Error(
      "Could not find a version that satisfied the version range"
    );
  }

  return ver;
}

/* eslint @typescript-eslint/explicit-module-boundary-types: 0 */
export function invariant(
  condition: unknown,
  message?: string
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
