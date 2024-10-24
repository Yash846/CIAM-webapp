#!/bin/sh

# Find the env file that matches the pattern
ENV_FILE=$(ls src/environments/environment.prod.ts | head -n 1)

# Replace environment variables in the main.js file
sed -i 's|PLACEHOLDER_baseUrl|'"${baseUrl}"'|g' "$ENV_FILE"
sed -i 's|PLACEHOLDER_apiClientSecret|'"${apiClientSecret}"'|g' "$ENV_FILE"
sed -i 's|PLACEHOLDER_clientSecret|'"${clientSecret}"'|g' "$ENV_FILE"
sed -i 's|PLACEHOLDER_apiClientId|'"${apiClientId}"'|g' "$ENV_FILE"
sed -i 's|PLACEHOLDER_clientId|'"${clientId}"'|g' "$ENV_FILE"
sed -i 's|PLACEHOLDER_CE_URL|'"${CE_URL}"'|g' "$ENV_FILE"

echo 'vars updated'

# Start the Angular app
ng serve --proxy-config src/proxy.conf.json --configuration=production --host 0.0.0.0 --port 8080