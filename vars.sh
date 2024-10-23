#!/bin/sh
cd /app/dist/tcs-angular-app/

# Find the main JS file that matches the pattern
MAIN_JS_FILE=$(ls main.*.js | head -n 1)

# Replace environment variables in the main.js file
sed -i 's|PLACEHOLDER_baseUrl|'"${baseUrl}"'|g' "$MAIN_JS_FILE"
sed -i 's|PLACEHOLDER_apiClientSecret|'"${apiClientSecret}"'|g' "$MAIN_JS_FILE"
sed -i 's|PLACEHOLDER_clientSecret|'"${clientSecret}"'|g' "$MAIN_JS_FILE"
sed -i 's|PLACEHOLDER_apiClientId|'"${apiClientId}"'|g' "$MAIN_JS_FILE"
sed -i 's|PLACEHOLDER_clientId|'"${clientId}"'|g' "$MAIN_JS_FILE"
sed -i 's|PLACEHOLDER_CE_URL|'"${CE_URL}"'|g' "$MAIN_JS_FILE"


echo "vars updated"

cd ../../proxy/

# Start the server
node app.js