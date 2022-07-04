import got from "got";
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
        { headers: { Accept: "application/json" } }
      ).json();

      const v = await getVersionObject(types.IndexRt.check(result), ver);
      expect(v.version).toMatchSnapshot();
    });
  });

  describe("range versions - packer", () => {
    it.each(["latest"] as const)("should match %s versions", async (ver) => {
      const result = await got(
        "https://releases.hashicorp.com/packer/index.json",
        { headers: { Accept: "application/json" } }
      ).json();

      const v = await getVersionObject(types.IndexRt.check(result), ver);
      expect(v.version).toMatchSnapshot();
    });
  });

  describe("range versions - nomad", () => {
    it.each(["latest", "v1.2"] as const)(
      "should match %s versions",
      async (ver) => {
        const result = await got(
          "https://releases.hashicorp.com/nomad/index.json",
          { headers: { Accept: "application/json" } }
        ).json();

        const v = await getVersionObject(types.IndexRt.check(result), ver);
        expect(v.version).toMatchSnapshot();
      }
    );
  });

  describe("range versions - consul", () => {
    it.each(["v1.2"] as const)("should match %s versions", async (ver) => {
      const result = await got(
        "https://releases.hashicorp.com/consul/index.json",
        { headers: { Accept: "application/json" } }
      ).json();

      const v = await getVersionObject(types.IndexRt.check(result), ver);
      expect(v.version).toMatchSnapshot();
    });
  });

  describe("range versions - vault", () => {
    it.each(["v1.2"] as const)("should match %s versions", async (ver) => {
      const result = await got(
        "https://releases.hashicorp.com/vault/index.json",
        { headers: { Accept: "application/json" } }
      ).json();

      const v = await getVersionObject(types.IndexRt.check(result), ver);
      expect(v.version).toMatchSnapshot();
    });
  });
});
