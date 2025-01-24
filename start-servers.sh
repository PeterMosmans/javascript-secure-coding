#!/usr/bin/env bash

# Copyright (C) 2022-2025 Peter Mosmans [Go Forward]
# SPDX-License-Identifier: GPL-3.0-or-later

# Check prerequisites and configure several demo servers
# Part of https://github.com/PeterMosmans/javascript-secure-coding

# Stop when encountering an error or when variables aren't defined
set -eu

function error_message() {
  echo -e "${COL_RED}Something went wrong${COL_RESET}"
  echo -e "Did you run ${COL_BOLD}./installer.sh${COL_RESET} first?"
  echo -e "You could also try to stop services by running ${COL_BOLD}./stop-servers.sh${COL_RESET}"
}

trap error_message ERR
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
docker run --name cerbos --rm -it -u ${UID} --publish "$CERBOS_PORT:3592" --volume "$(pwd)/policies:/policies:ro" --detach ghcr.io/cerbos/cerbos:latest 1> /dev/null
echo -e "${COL_BOLD}2${COL_RESET}/5 - Starting the authentication server on ${COL_BOLD}https://${AUTH_HOST}:${AUTH_PORT}${COL_RESET}"
node authentication-server.js &
echo "export PID_AUTHENTICATION=$!" > $PIDFILE
echo -e "${COL_BOLD}3${COL_RESET}/5 - Starting the API server on ${COL_BOLD}https://${API_HOST}:${API_PORT}${COL_RESET}"
node api-server.js &
echo "export PID_API=$!" >> $PIDFILE
echo -e "${COL_BOLD}4${COL_RESET}/5 - Starting the web server on ${COL_BOLD}https://${WEB_HOST}:${WEB_PORT}${COL_RESET}"
node web-server.js &
echo "export PID_WEB=$!" >> $PIDFILE
echo -e "${COL_BOLD}5${COL_RESET}/5 - Starting the attacker web server on ${COL_BOLD}http://${ATTACKER_HOST}:${ATTACKER_PORT}${COL_RESET}"
node attacker-server.js &
echo "export PID_ATTACKER=$!" >> $PIDFILE
echo -e "To stop all services, please run ${COL_BOLD}./stop-servers.sh${COL_RESET}"
echo
