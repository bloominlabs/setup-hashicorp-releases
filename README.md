# Setup Hashicorp Releases - GitHub Action

This repository contains an action for use with GitHub Actions, which installs a a package from `releases.hashicorp.com` with a semver-compatible version.

The package is installed into `/home/runner/.{package}` (or equivalent on Windows) and the `bin` subdirectory is added to the PATH.

## Usage

Install the latest version of the envconsul:

```yaml
- name: Install envconsul
  uses: bloominlabs/setup-hashicorp-releases@v2
  with:
    package: envconsul
```

Install the latest (potentially prerelease) version of envconsul

```yaml
- name: Install envconsul
  uses: bloominlabs/setup-hashicorp-releases@v2
  with:
    package: envconsul
    include_prerelease: true
```

Install a specific version of the envconsul:

```yaml
- name: Install envconsul
  uses: bloominlabs/setup-hashicorp-releases@v2
  with:
    package: envconsul
    version: 0.12.1
```

Install a specific prerelease version of nomad:

```yaml
- name: Install nomad
  uses: bloominlabs/setup-hashicorp-releases@v2
  with:
    package: nomad
    version: 1.5.0-beta.1
    include_prerelease: true
```

Install a version that adheres to a semver range

```yaml
- name: Install envconsul
  uses: bloominlabs/setup-hashicorp-releases@v2
  with:
    package: envconsul
    version: ^0.12.0
```

### Testing

You can test this action locally using [act](https://github.com/nektos/act). See the repo for more instructions.

## Configuration

The action can be configured with the following arguments:

- `package` - The package to install. See <https://releases.hashicorp.com/index.json> for all available packages.
- `version` (optional) - The version of the package to install. Default is `latest`. Accepts semver style values.
- `license_class` (optional) - The type of license required for the package. Either `enterprise` or `oss` (default).
- `include_prerelease` (optional) - Should prerelease versions be considered when finding the semver match. Default is `false`.
