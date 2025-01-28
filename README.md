# Secure Coding in JavaScript

This is a JavaScript / Node.js demo application mean to practice secure coding.
Make sure to NOT use this code anytime in production, as the examples contain
deliberate security vulnerabilities.

## Prerequisites

Have `docker`, `node` and optionally `openssl` installed.

## Installation

```console
git clone https://github.com/PeterMosmans/javascript-secure-coding \
  && cd javascript-secure-coding \
  && ./installer.sh
```

This will:

- clone the repository,
- check the prerequisites,
- generate a self-signed certificate when `openssl` is installed,
- copy `defaults/.env` to `.env` (unless there is already a `.env` present), and
- install the required dependencies.

Optionally check the `.env` file: In order for the demos to work, the hosts
mentioned in `.env` should resolve to accessible IP addresses. This might
include modifying your local `hosts` file.

## Run all servers

```console
./start-servers.sh
```

This will start all servers in the background, including the Docker container.

## Stop all servers

```console
./stop-servers.sh
```

# ⚠ IMPORTANT ⚠

Don't forget to trust the self-signed certificate _for each one of the
services_, as this certificate is not trusted by default.

You can do this by visiting https://localhost:3000/test , accepting the
self-signed certificate for this site, then by clicking on "browse to
authentication URL" and "browse to API URL", and accepting the self-signed
certificates **for each one of the servers**.

If you don't trust the certificates manually, then the demos will not work.

When manually starting the services, source the `.env` file, as the environment
file contains important variables required for the various services to run.

## Architecture

The web server has the following functionality:

- Input output page `/` - dynamically display output, filter, sanitize, and
  validate data
- Authentication page `/authentication`: log in, reset session
- Authorization page `/authorization` - perform an action as authenticated user,
  validate access permissions of a token
- Authorization page `/authorization-protected` - perform a protected, validated
  action as authenticated user, validate access permissions of a token
- Test page `/test` - Check whether the demo site is correctly functioning

## Copyright / License

Great that you're using this code, hopefully you'll find it useful! All that I'm
asking is that you properly attribute the author
([Peter Mosmans](https://github.com/PeterMosmans)), and respect the
[GPLv3 license](LICENSE).

This demo uses [Cerbos](https://github.com/cerbos/cerbos) and
[DOMPurify](https://github.com/cure53/DOMPurify), both licensed under the Apache
License.
