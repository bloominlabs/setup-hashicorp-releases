import { maxSatisfying, gte } from "semver";
import got from "got";
import { ValidationError } from 'runtypes';

import * as types from "./types";

export async function getVersionData(
  service: string,
  licenseClass: "enterprise" | "oss",
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

          // used for debugging runtypes errors
          // JSON.parse(response.body as any).forEach((element: any) => {
          //   try {
          //     types.VersionRt.check(element)
          //   } catch (e) {
          //     if (e instanceof ValidationError) {
          //       console.log(element.version)
          //       console.log(e.details)
          //       throw (e)
          //     } else
          //       throw (e)
          //   }
          // })

          return types.IndexRt.check(JSON.parse(response.body as string));
        },
      },
    }
  );
}

export async function getVersionObject(
  index: types.Index,
  range: string,
  include_prerelease = false,
): Promise<types.Version> {
  if (range == "latest") {
    const latest = index.filter((value) => {
      if (include_prerelease) {
        return true
      } else {
        return value.is_prerelease === false;
      }
    }).reduce((prev, cur) => {
      return gte(cur.version, prev.version) ? cur : prev;
    });
    invariant(latest, "expect a latest version to exists. if you only have a prerelease version, make sure 'include_prerelease' option is specified");
    return latest;
  }

  const versions = index.map((version) => version.version);
  const maxSatisfyingSemverVersion = maxSatisfying(versions, range, {
    includePrerelease: include_prerelease
  });
  if (maxSatisfyingSemverVersion === null) {
    throw new Error(
      "Could not find a version that satisfied the version range. if you're trying to find a prerelease version, be sure you specified the 'include_prerelease' option"
    );
  }

  const ver = index.filter(
    (version) => version.version == maxSatisfyingSemverVersion
  )[0];
  if (!ver) {
    throw new Error(
      "Could not find a version that satisfied the version range after finding the version match. this indicates a bug in the action. please file an issue with a minimum viable reproduction"
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
