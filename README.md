# Setup GitHub Action

This repository contains an action for use with GitHub Actions, which installs a specified version of the `envconsul`.

`envconsul` is installed into `/home/runner/.envconsul` (or equivalent on Windows) and the `bin` subdirectory is added to the PATH.

## Usage

Install the latest version of the envconsul:

```yaml
- name: Install envconsul
  uses: bloominlabs/setup-envconsul@v1
```

Install a specific version of the envconsul:

```yaml
- name: Install envconsul
  uses: bloominlabs/setup-envconsul@v1
  with:
    envconsul-version: 3.3.0
```

Install a version that adheres to a semver range

```yaml
- name: Install envconsul
  uses: bloominlabs/setup-envconsul@v1
  with:
    envconsul-version: ^3.0.0
```

## Configuration

The action can be configured with the following arguments:

- `envconsul-version` (optional) - The version of the envconsul to install. Default is `latest`. Accepts semver style values.
