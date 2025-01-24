#!/usr/bin/env bash

# Copyright (C) 2022-2025 Peter Mosmans [Go Forward]
# SPDX-License-Identifier: GPL-3.0-or-later

# Check prerequisites and configure several demo servers
# Part of https://github.com/PeterMosmans/javascript-secure-coding

set -u
set -e

COL_BOLD="\033[1m"
COL_GREEN="\033[32m"
COL_RED="\033[0;31m"
COL_RESET="\033[0m"

EXECUTABLES="dig docker node npm openssl"

setup() {
  # Check if there already is an .env file
  if [[ ! -f .env ]]; then
    echo -e "No ${COL_BOLD}.env${COL_RESET} file found, copying default one from ${COL_BOLD}defaults/.env${COL_RESET}... "
    cp defaults/.env .env
    echo -e "${COL_GREEN}Default .env file created${COL_RESET}"
  else
    echo -e "${COL_GREEN}Found existing .env file${COL_RESET}"
  fi

  # Check if there already is an openssl certificate file
  if [[ ! -f localhost.crt ]]; then
    echo -e "No ${COL_BOLD}localhost.crt${COL_RESET} file found, trying to create one using openssl"
    if ! which openssl &> /dev/null; then
      echo -e "Could not find ${COL_BOLD}openssl{$COL_RED}, using the default certificate files"
      echo -e "${COL_RED}Please note that it's more secure to generate new certificates${COL_RESET}"
      cp defaults/openssl.crt openssl.crt
      cp defaults/openssl.key openssl.key
    else
      create_certificate
    fi
  else
    echo -e "${COL_GREEN}Found existing certificate${COL_RESET}"
  fi
  # shellcheck disable=SC1091
  source .env
}

check_executables() {
  # Check if executables are available
  # shellcheck disable=SC2154
  if [[ -n ${EXECUTABLES} ]]; then
    echo "Checking whether executables can be found"
    # shellcheck disable=SC2154
    for executable in ${EXECUTABLES}; do
      if ! which "${executable}" &> /dev/null; then
        echo -e "${COL_RED}Could not find ${COL_BOLD}${executable}${COL_RED} in paths: Not everything might work correctly${COL_RESET}"
      fi
    done
  fi
}

create_certificate() {
  if [ ! -f localhost.crt ]; then
    echo -e "${COL_GREEN}Generating a key pair, and a self-signed certificate${COL_RESET}"
    openssl req -x509 -out localhost.crt -keyout localhost.key \
      -newkey rsa:2048 -nodes -sha256 \
      -subj '/CN=localhost' -extensions EXT -config <(
        printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth"
      )
    echo -e "Generated ${COL_BOLD}localhost.crt${COL_RESET} and ${COL_BOLD}localhost.key${COL_RESET}"
  else
    echo -e "Found existing certificate ${COL_BOLD}localhost.crt${COL_RESET}"
  fi
}

check_hostnames() {
  if which "dig" &> /dev/null; then
    # shellcheck disable=SC2154
    for hostname in ${WEB_HOST} ${AUTH_HOST} ${API_HOST} ${CERBOS_HOST} ${ATTACKER_HOST}; do
      resolve=$(dig +short "${hostname}")
      if [ -n "${resolve}" ]; then
        echo -e "${hostname} resolves to ${COL_BOLD}${resolve}${COL_RESET}"
      else
        echo -e "${COL_RED}${COL_BOLD}${hostname}${COL_RED} does not resolve yet${COL_RESET}"
        echo -e "${COL_RED}Please add it to the hosts file or change the host in ${COL_BOLD}.env${COL_RESET}"
      fi
    done
  fi
}

check_executables
setup
check_hostnames
# Do a clean install
npm ci

echo -e "\nGood to go! To (re)start all servers and services, run ${COL_BOLD}./start-servers.sh${COL_RESET}"
echo -e "To stop all servers and services, run ${COL_BOLD}./stop-servers.sh${COL_RESET}"
