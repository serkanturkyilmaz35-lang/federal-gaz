#!/bin/bash

# Define output name
OUTPUT_NAME="federal-gaz-app-deploy"
OUTPUT_DIR="../$OUTPUT_NAME"

# Create output directory
mkdir -p $OUTPUT_DIR

# Copy necessary files
echo "Copying files..."
cp -r .next $OUTPUT_DIR/.next
cp -r public $OUTPUT_DIR/public
cp -r scripts $OUTPUT_DIR/scripts
cp package.json $OUTPUT_DIR/package.json
cp next.config.mjs $OUTPUT_DIR/next.config.mjs
# cp .env $OUTPUT_DIR/.env # Don't copy .env, user should set it up on server

# Copy node_modules (optional, but saves time on server if arch matches, usually better to npm install on server)
# For Hostinger VPS, better to npm install. For shared hosting, Node support might be limited.
# We will assume VPS/Cloud or Node support where `npm install` is possible.
# If "static export" was needed, we would use `output: 'export'` in next.config.mjs.
# Given "Dashboard" and "OTP", a running server is required.

# Create zip
echo "Creating zip archive..."
cd ..
tar -czf federal-gaz-app.tar.gz $OUTPUT_NAME
zip -r federal-gaz-app.zip $OUTPUT_NAME

echo "Export complete: federal-gaz-app.tar.gz and federal-gaz-app.zip"
