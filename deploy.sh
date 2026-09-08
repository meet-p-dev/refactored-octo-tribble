#!/bin/sh
# Build the Next.js static export and push it to GitHub Pages as the site root.
# Usage: ./deploy.sh "short summary of changes"
set -e
cd "$(dirname "$0")"
V="V$(cat VERSION)"
MSG="${1:-update}"

./build.sh
[ -d .deploy/.git ] || { echo "ERROR: .deploy clone missing — run: git clone https://github.com/meet-p-dev/refactored-octo-tribble.git .deploy"; exit 1; }

cd .deploy
git pull --rebase origin main
# wipe the previously deployed tree so stale content-hashed chunks from old
# builds don't linger, then copy the fresh static export in
git rm -rq --ignore-unmatch .
cp -r ../out/. .
cp ../CHANGELOG.md CHANGELOG.md
# ~/Documents is iCloud-synced, which spawns "file 2.svg"/"file 3.html" conflict
# copies — including extension-less ones like ".nojekyll 4" (no dot after the digit,
# so the old pattern missed those). Purge both shapes so they never get committed.
find . -path ./.git -prune -o \( -name "* [0-9].*" -o -regex '.* [0-9]' \) -print -delete 2>/dev/null || true
# GitHub Pages runs Jekyll by default, which ignores/mangles the _next/
# folder (leading underscore) unless this file tells it not to
touch .nojekyll
git add -A
if git diff --cached --quiet; then echo "Nothing to deploy."; exit 0; fi
git commit -m "$V — $MSG"
git push origin main
echo "Deployed $V"
