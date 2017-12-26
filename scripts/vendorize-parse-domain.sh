#!/bin/sh

sed 's/^exports.*=.*=.*/const tlds = {};/; s/^exports\./tlds./' ./vendor/parse-domain/lib/tld.js > ./dist/tlds.js
sed 's/"use strict";/(function() {/; s/^module\.exports.*/MULTIPASS.parseDomain = parseDomain; })();/; s/require("\.\/tld\.js");/tlds;/' ./vendor/parse-domain/lib/parseDomain.js > ./dist/parseDomain.js
