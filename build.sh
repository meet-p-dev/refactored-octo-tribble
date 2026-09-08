#!/bin/sh
# Build the Next.js static export into out/.
cd "$(dirname "$0")"
npm ci
npm run build
echo "Built out/ ($(du -sh out | cut -f1))"
