#!/bin/bash
ADDON_PATH="$(dirname "$(readlink -f "$BASH_SOURCE")")"
GATEWAY_PID=`/bin/ps aux | grep "build/gateway.js" | grep -v "grep" | tail -n -1 | awk '{print $2}'`

# TODO: Check this!
if [ -z "$GATEWAY_PID" ]; then
  echo "Gateway must be running!"
  exit 1
fi

GATEWAY_PATH=`readlink -e /proc/$GATEWAY_PID/cwd`

export NODE_PATH="$GATEWAY_PATH/node_modules"

cd $GATEWAY_PATH
node --inspect "$GATEWAY_PATH/src/addon-loader.js" "$ADDON_PATH"