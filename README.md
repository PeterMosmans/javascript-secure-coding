# Secure Coding in JavaScript

This is a JavaScript / Node.js demo application mean to practice secure coding.
Make sure to NOT use this code anytime in production, as the examples contain
deliberate security vulnerabilities.

## Prerequisites

Have `docker`, `node` and optionally `openssl` installed.

## How to install

```console
git clone https://github.com/PeterMosmans/javascript-secure-coding \
  && cd javascript-secure-coding \
  && ./installer.sh
```

This will:

- check the prerequisites,
- generate a self-signed certificate if `openssl` is installed,
- copy `defaults/.env` to `.env` (unless there is already a `.env` present), and
- install the required dependencies.

Optionally check the `.env` file: In order for the demos to work, the hosts
mentioned in `.env` should resolve to accessible IP addresses. This might
include modifying your local `hosts` file.

## Run all servers

```console
./start-servers.sh
```

This will start all servers (including the Docker container) in the background.
All servers can be stopped using

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
Source the `.env` file when manually starting servers, as the environment file
contains important variables for the various services to run.

# Copyright / License

Great that you're using this code, hopefully you'll find it useful! All that I'm
asking is that you properly attribute the author
([Peter Mosmans](https://github.com/PeterMosmans)), and respect the
[GPLv3 license](LICENSE).
