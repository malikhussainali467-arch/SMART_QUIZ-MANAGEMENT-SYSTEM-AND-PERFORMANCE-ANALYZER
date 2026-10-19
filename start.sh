#!/usr/bin/env bash
# Run Smart Quiz on macOS / Linux:  ./start.sh
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
npm start
