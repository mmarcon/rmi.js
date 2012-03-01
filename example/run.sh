#!/bin/bash

export PORT=8081
CPATH=`pwd`
cd ..

npm install -d

echo "Example app is running at http://localhost:${PORT}"
echo "^C to stop"

node ./example/server.js

cd $CPATH