import { maxSatisfying, gte } from "semver";
import * as types from "./types";

export async function getVersionObject(
  index: types.Index,
  range: string
): Promise<types.Version> {
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
