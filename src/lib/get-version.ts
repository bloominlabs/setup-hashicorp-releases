import { maxSatisfying, gte } from "semver";
import * as types from "./types";
import got from "got";

export async function getVersionData(
  service: string,
  licenseClass: "enterprise" | "oss"
): Promise<types.Index> {
  let previousLastTime = new Date().toISOString();
  return await got.paginate.all<types.Version>(
    `https://api.releases.hashicorp.com/v1/releases/${service}`,
    {
      headers: { Accept: "application/json" },
      http2: true,
      searchParams: { limit: 20, license_class: licenseClass },
      pagination: {
        paginate: (_, currentItems) => {
          if (currentItems.length <= 0) {
            return false;
          }
          const lastItem = currentItems[currentItems.length - 1];
          if (previousLastTime === lastItem.timestamp_created) {
            return false;
          }

          previousLastTime = lastItem.timestamp_created;
          return {
            searchParams: {
              after: lastItem.timestamp_created,
            },
          };
        },
        requestLimit: 1000,
        transform: (response) => {
          if (response.request.options.responseType === "json") {
            return types.IndexRt.check(response.body);
          }
          return types.IndexRt.check(JSON.parse(response.body as string));
        },
      },
    }
  );
}

export async function getVersionObject(
  index: types.Index,
  range: string
): Promise<types.Version> {
  if (range == "latest") {
    const latest = index.reduce((prev, cur) => {
      return gte(cur.version, prev.version) ? cur : prev;
    });
    invariant(latest, "expect a latest version to exists");
    return latest;
  }

  const versions = index.map((version) => version.version);
  const maxSatisfyingSemverVersion = maxSatisfying(versions, range);
  if (maxSatisfyingSemverVersion === null) {
    throw new Error(
      "Could not find a version that satisfied the version range"
    );
  }

  const ver = index.filter(
    (version) => version.version == maxSatisfyingSemverVersion
  )[0];
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
