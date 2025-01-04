import * as rt from "runtypes";

const OsRt = rt.Union(
  rt.Literal("darwin"),
  rt.Literal("dragonfly"),
  rt.Literal("freebsd"),
  rt.Literal("linux"),
  rt.Literal("netbsd"),
  rt.Literal("openbsd"),
  rt.Literal("solaris"),
  rt.Literal("windows"),
  rt.Literal("web"),
  rt.Literal("plan9"),
);

const ArchRt = rt.Union(
  rt.Literal("arm"),
  rt.Literal("arm64"),
  rt.Literal("amd64"),
  rt.Literal("386"),
  rt.Literal("mips"),
  rt.Literal("mips64"),
  rt.Literal("mipsle"),
  rt.Literal("s390x"),
  rt.Literal("ppc64le"),
  rt.Literal("amd64-lxc"),
  rt.Literal("arm5"),
  rt.Literal("arm6"),
  rt.Literal("arm7"),
  rt.Literal("armhfv6"),
  rt.Literal("armelv5"),
  rt.Literal("ui")
);

const BuildRt = rt.Record({
  os: OsRt,
  arch: ArchRt,
  url: rt.String,
});

export const VersionRt = rt.Record({
  name: rt.String,
  version: rt.String,
  is_prerelease: rt.Boolean,
  timestamp_created: rt.String,
  builds: rt.Union(rt.Array(BuildRt), rt.Null),
});

export const IndexRt = rt.Array(VersionRt);

export type Index = rt.Static<typeof IndexRt>;
export type Version = rt.Static<typeof VersionRt>;
