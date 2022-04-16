import got from "got/dist/source";
import * as playback from "jest-playback";
import * as types from "../types";
import { getVersionObject } from "../get-version";
playback.setup(__dirname);

describe("get-version", () => {
  process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || "my-token";
  describe("range versions - envconsul", () => {
    it.each([
      "latest",
      "^0",
      "0.*.*",
      "0.2.*",
      "v0.*.*",
      "v0.12.*",
      "0.12.1",
      "v0.12.0",
      "0.12.1",
    ] as const)("should match %s versions", async (ver) => {
      const result = await got(
        "https://releases.hashicorp.com/envconsul/index.json",
        {
          responseType: "json",
        }
      );

      const v = await getVersionObject(types.IndexRt.check(result.body), ver);
      expect(v.version).toMatchSnapshot();
    });
  });

  describe("range versions - packer", () => {
    it.each(["latest"] as const)("should match %s versions", async (ver) => {
      const result = await got(
        "https://releases.hashicorp.com/packer/index.json",
        {
          responseType: "json",
        }
      );

      const v = await getVersionObject(types.IndexRt.check(result.body), ver);
      expect(v.version).toMatchSnapshot();
    });
  });
});
