#!/bin/bash

echo -e "Store puppeteer executable in cache\n"

# Create .cache directory if it doesn't exist
mkdir -p ./.cache

# Move Puppeteer cache from system location to app directory
if [ -d "/vercel/.cache/puppeteer" ]; then
    mv /vercel/.cache/puppeteer ./.cache/
    echo "Successfully moved Puppeteer cache to app directory"
else
    echo "Puppeteer cache not found in /vercel/.cache/puppeteer"
    # Install Chrome browser for Puppeteer
    npx puppeteer browsers install chrome
fi

echo "Puppeteer setup complete" 