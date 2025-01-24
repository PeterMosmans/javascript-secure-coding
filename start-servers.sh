#!/usr/bin/env bash

# Copyright (C) 2022-2025 Peter Mosmans [Go Forward]
# SPDX-License-Identifier: GPL-3.0-or-later

# Check prerequisites and configure several demo servers
# Part of https://github.com/PeterMosmans/javascript-secure-coding

# Stop when encountering an error
set -e

# shellcheck disable=SC1091
source .env
PIDFILE=servers.pid
if [[ -f $PIDFILE ]]; then
  echo "PID file $PIDFILE already exists... so restarting the servers"
  # shellcheck disable=SC1091
  source stop-servers.sh
fi

echo "Starting the Cerbos authorization back-end on port ${CERBOS_PORT}"
docker run --name cerbos --rm -it -u ${UID} --publish "$CERBOS_PORT:3592" --volume "$(pwd)/policies:/policies:ro" --detach ghcr.io/cerbos/cerbos:latest
echo "Starting the authentication server"
node authentication-server.js &
echo "export PID_AUTHENTICATION=$!" > $PIDFILE
echo "Starting the API server"
node api-server.js &
echo "export PID_API=$!" >> $PIDFILE
echo "Starting the web server"
node web-server.js &
echo "export PID_WEB=$!" >> $PIDFILE
echo "Starting the attacker web server"
node attacker-server.js &
echo "export PID_ATTACKER=$!" >> $PIDFILE
