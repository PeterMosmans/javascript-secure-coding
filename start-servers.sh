#!/usr/bin/env bash

# Copyright (C) 2022-2025 Peter Mosmans [Go Forward]
# SPDX-License-Identifier: GPL-3.0-or-later

# Check prerequisites and configure several demo servers
# Part of https://github.com/PeterMosmans/javascript-secure-coding

# Stop when encountering an error
set -e

COL_BOLD="\033[1m"
COL_RED="\033[0;31m"
COL_RESET="\033[0m"

if [[ ! -f .env ]]; then
  echo -e "${COL_RED}No ${COL_BOLD}.env${COL_RESET}${COL_RED} file found${COL_RESET}"
  echo -e "Please run ${COL_BOLD}./installer.sh${COL_RESET} first"
  exit 0
fi

# shellcheck disable=SC1091
source .env
PIDFILE=servers.pid
if [[ -f $PIDFILE ]]; then
  echo "PID file $PIDFILE already exists... so restarting the servers"
  # shellcheck disable=SC1091
  source stop-servers.sh
fi

echo -e "${COL_BOLD}1${COL_RESET}/5 - Starting the Cerbos authorization back-end on port ${COL_BOLD}${CERBOS_PORT}${COL_RESET}"
docker run --name cerbos --rm -it -u ${UID} --publish "$CERBOS_PORT:3592" --volume "$(pwd)/policies:/policies:ro" --detach ghcr.io/cerbos/cerbos:latest
echo -e "${COL_BOLD}2${COL_RESET}/5 - Starting the authentication server"
node authentication-server.js &
echo "export PID_AUTHENTICATION=$!" > $PIDFILE
echo -e "${COL_BOLD}3${COL_RESET}/5 - Starting the API server"
node api-server.js &
echo "export PID_API=$!" >> $PIDFILE
echo -e "${COL_BOLD}4${COL_RESET}/5 - Starting the web server"
node web-server.js &
echo "export PID_WEB=$!" >> $PIDFILE
echo -e "${COL_BOLD}5${COL_RESET}/5 - Starting the attacker web server"
node attacker-server.js &
echo "export PID_ATTACKER=$!" >> $PIDFILE
