#!/bin/bash

npm install express socket.io

mkdir -p ../node_modules/rmi.js
cp -r ../lib ../index.js ../package.json ../node_modules/rmi.js

trap "{ rm -rf ../node_modules; exit 0; }" EXIT
echo "Example app is running at http://localhost:8081"
echo "^C to stop"
node server.js