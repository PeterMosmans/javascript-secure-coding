#!/usr/bin/env bash

# Copyright (C) 2025 Peter Mosmans [Go Forward]
# SPDX-License-Identifier: GPL-3.0-or-later

# Stop when encountering an error

set -e
# shellcheck disable=SC1091
source .env
PIDFILE=servers.pid
if [[ ! -f $PIDFILE ]]; then
  echo "PID file $PIDFILE doesn't exist... you might want start the servers first"
  exit 0
fi
# shellcheck disable=SC1090
source $PIDFILE
docker stop cerbos &> /dev/null || true
kill "$PID_AUTHENTICATION" 2> /dev/null || true
kill "$PID_API" 2> /dev/null || true
kill "$PID_WEB" 2> /dev/null || true
kill "$PID_ATTACKER" 2> /dev/null || true
echo "Removing PID file $PIDFILE..."
rm -- "$PIDFILE"
