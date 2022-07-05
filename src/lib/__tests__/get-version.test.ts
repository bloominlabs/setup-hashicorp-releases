import * as playback from "jest-playback";
import * as types from "../types";
import { getVersionData, getVersionObject } from "../get-version";
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
      const result = await getVersionData("envconsul", "oss");
      const v = await getVersionObject(types.IndexRt.check(result), ver);
      expect(v.version).toMatchSnapshot();
    });
  });

  describe("range versions - packer", () => {
    it.each(["latest"] as const)("should match %s versions", async (ver) => {
      const result = await getVersionData("packer", "oss");
      const v = await getVersionObject(types.IndexRt.check(result), ver);
      expect(v.version).toMatchSnapshot();
    });
  });

  describe("range versions - nomad", () => {
    it.each(["latest", "v1.2"] as const)(
      "should match %s versions",
      async (ver) => {
        const result = await getVersionData("nomad", "oss");
        console.log(result);
        const v = await getVersionObject(types.IndexRt.check(result), ver);
        expect(v.version).toMatchSnapshot();
      }
    );
  });

  describe("range versions - consul", () => {
    it.each(["v1.2"] as const)("should match %s versions", async (ver) => {
      const result = await getVersionData("consul", "oss");
      const v = await getVersionObject(types.IndexRt.check(result), ver);
      expect(v.version).toMatchSnapshot();
    });
  });

  describe("range versions - vault", () => {
    it.each(["v1.2"] as const)("should match %s versions", async (ver) => {
      const result = await getVersionData("vault", "oss");
      const v = await getVersionObject(types.IndexRt.check(result), ver);
      expect(v.version).toMatchSnapshot();
    });
  });
});
