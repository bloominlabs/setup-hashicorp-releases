# Setup Hashicorp Releases - GitHub Action

This repository contains an action for use with GitHub Actions, which installs a a package from `releases.hashicorp.com` with a semver-compatible version.

The package is installed into `/home/runner/.{package}` (or equivalent on Windows) and the `bin` subdirectory is added to the PATH.

## Usage

Install the latest version of the envconsul:

```yaml
- name: Install envconsul
  uses: bloominlabs/setup-hashicorp-releases@v1
  with:
    package: envconsul
```

Install a specific version of the envconsul:

```yaml
- name: Install envconsul
  uses: bloominlabs/setup-hashicorp-releases@v1
  with:
    package: envconsul
    version: 0.12.1
```

Install a version that adheres to a semver range

```yaml
- name: Install envconsul
  uses: bloominlabs/setup-hashicorp-releases@v1
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
- `license_class` (optional) - The type of license required for the package. Either `enterprise` or `oss`.
