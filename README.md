# Supportal

Jira Service Management portal P2 plugin. Local development runs in Podman containers on Linux, Windows and macOS, including Apple Silicon. The host needs Git, Podman, podman-compose and IntelliJ IDEA Ultimate. Java, Node, npm and the Atlassian SDK run inside the development image.

## Contents

- [Start](#start)
- [IntelliJ](#intellij)
- [Develop](#develop)
- [Licences](#licences)
- [Storage](#storage)
- [Configuration and verification](#configuration-and-verification)

## Start

On Windows/macOS, create a Podman Machine once, then start it:

```sh
podman machine init --cpus 4 --memory 12288 --disk-size 60
podman machine start
```

Linux uses rootless Podman directly. An existing Podman Machine can be used; allow memory for Jira and the IDE backend. The Compose user namespace maps the host user to container UID/GID 1000 for source-directory access.

From the repository root, on all three platforms:

```sh
podman-compose up -d --build
podman-compose logs -f jira
```

First startup downloads the SDK, Maven dependencies and Jira distributions and builds Supportal, including its frontend. Later starts reuse persistent caches. Open **http://localhost:2990/jira** when Jira is ready.

This is a fresh Jira database. Complete the setup wizard, create a local admin, and use only the supplied timebomb test keys. Set Jira's base URL to `http://localhost:2990/jira`. There is no company database dump, AD or SSO setup. Supportal business flows require local JSM projects, request types, fields and Assets schemas matching the plugin's expectations; this change provisions the development infrastructure, not those business fixtures.

Services:

| Service | Purpose | Host endpoint |
|---|---|---|
| `postgres` | PostgreSQL 17, database `jira`, schema `jiradb` | Internal network only |
| `jira` | AMPS 9.9.1 starts Jira/JSM 11.3.12 with Supportal | `localhost:2990/jira` |
| `dev` | IntelliJ SSH backend; Java 21, SDK 9.1.1, Node 22 | `localhost:2222` |

## IntelliJ

Create a dedicated SSH key using the host's OpenSSH client, for example:

```sh
ssh-keygen -t ed25519 -f ./dev_key
```

Copy `.env.example` to `.env` using your editor. Set `DEV_SSH_PUBLIC_KEY` to the complete line from `dev_key.pub`; the private key remains on your host. Recreate the SSH service after changing `.env`:

```sh
podman-compose up -d dev
ssh -p 2222 -i ./dev_key developer@127.0.0.1
```

In IntelliJ: **Remote Development -> SSH -> New Connection**:

- Host `127.0.0.1`, port `2222`, user `developer`.
- Select the private key, then an approved IntelliJ backend version.
- Open `/workspace/supportal` and import `pom.xml`.
- Project JDK: `/opt/java/openjdk`.
- Maven home: `/opt/atlassian-plugin-sdk/apache-maven-3.9.8`.
- Activate Maven profile `container-development`.

IDE installation/indexing, Java tooling and dependencies run inside the container. The source checkout remains on the host and is shared with both services. Backend installation needs JetBrains network access or a company-provided backend distribution. An empty SSH key setting permits Jira startup but provides no SSH login.

## Develop

In IntelliJ's remote terminal:

```sh
atlas-mvn -B -Pcontainer-development package
```

AMPS QuickReload is enabled and watches the generated plugin artifact in the shared `target` volume. Jira startup runs the initial build automatically. Logs:

```sh
podman-compose logs -f jira
```

Stop and resume:

```sh
podman-compose stop
podman-compose start
```

For changed container tooling, rebuild and recreate:

```sh
podman-compose up -d --build
```

ScriptRunner is a subsequent addition: install a compatible version in this local Jira, apply its accepted timebomb app key, then add matching Groovy/ScriptRunner API dependencies and a script root. The current change prepares Supportal plugin development; it does not yet install ScriptRunner or supply Groovy autocomplete.

## Licences

**Timebomb licences only.** Public Atlassian three-hour Data Center test keys are in `containers/licenses/`; these are not production licences.

The `container-development` Maven profile explicitly supplies the Jira Software key through AMPS `productLicense`. If Jira setup requests a key, paste `containers/licenses/jira-software.txt`. Add the JSM key from `jira-service-management.txt` under **Administration -> Applications -> Versions & licenses**. The generic Data Center app key is available for app testing, subject to acceptance by the installed app version.

The published keys' acceptance on Jira 11.3.12 still needs runtime verification. A rejected key requires an updated Atlassian timebomb key. Persistent PostgreSQL retains licensing state; a container restart is not a guaranteed renewal. See [licence details](containers/licenses/README.md).

Sources:

- [Atlassian timebomb licences](https://developer.atlassian.com/platform/marketplace/timebomb-licenses-for-testing-server-apps/)
- [AMPS licence configuration](https://developer.atlassian.com/server/framework/atlassian-sdk/clustering-jira/#configuring-the-license)
- [Adaptavist development workflow](https://docs.adaptavist.com/sr4js/latest/best-practices/write-code/set-up-a-dev-environment/)

## Storage

Named volumes hold PostgreSQL data, Jira/build output (`target`), the developer home (Maven cache and IDE backend), frontend dependencies and SSH host keys. `podman-compose down` preserves these volumes.

The source is a bind mount of the repository, so edits appear directly in Git. Java dependencies, build output and `node_modules` stay in container volumes. On SELinux hosts the shared source mount uses `:z`.

`podman-compose down -v` deletes **all local database, Jira home and cache data**. Back up anything needed first. Resetting a development environment is not a licence-renewal guarantee.

## Configuration and verification

The original host-specific POM settings remain available outside the container profile. The new profile overrides the absent home ZIP and `localhost` database address. Startup generates `target/container-postgres-home.zip` containing a PostgreSQL `dbconfig.xml`; existing Jira home/database data are preserved. AMPS is configured with `dropAndReCreateDatabase=false`.

Local-only database credentials are declared in Compose. Jira HTTP and SSH bind to host loopback. JDBC addresses use Compose service DNS (`postgres`), not the host network. Base images are multi-architecture; the project does not force amd64 emulation.

Network access is needed for container registries, Ubuntu packages, Atlassian, Maven dependencies, npm and JetBrains. Corporate proxies, CA certificates and internal repositories may need environment-specific configuration. `SDK_URL`, `SDK_VERSION` and the archive checksum `SDK_SHA256` are build arguments for substituting an approved SDK archive.

Validation during preparation: shell syntax, Compose structure, POM profile settings, generated database archive and XML escaping. Container builds, Jira startup/licence acceptance, IntelliJ SSH connection and Linux/Windows/macOS execution remain runtime checks because the preparation environment has no Podman/Docker daemon.

The SDK 9.1.1 archive download and `atlas-version` were also verified. A Maven effective-POM check was attempted but blocked by repository DNS/network resolution (`Unknown host repo1.maven.org`); it did not complete dependency resolution or validate the full build.
