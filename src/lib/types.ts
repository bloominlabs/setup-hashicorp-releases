import * as rt from "runtypes";

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
  rt.Literal("386"),
  rt.Literal("mips"),
  rt.Literal("mips64"),
  rt.Literal("mipsle"),
  rt.Literal("s390x"),
  rt.Literal("ppc64le"),
  rt.Literal("amd64-lxc"),
  rt.Literal("arm5"),
  rt.Literal("arm6"),
  rt.Literal("arm7")
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

export const IndexRt = rt.Record({
  name: rt.String,
  versions: rt.Dictionary(VersionRt),
});

export type Index = rt.Static<typeof IndexRt>;
export type Version = rt.Static<typeof VersionRt>;
