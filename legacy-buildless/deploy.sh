#!/bin/sh
# Build moneytrack.html and push it to GitHub as index.html.
# Usage: ./deploy.sh "short summary of changes"
set -e
cd "$(dirname "$0")"
V="V$(cat VERSION)"
MSG="${1:-update}"

./build.sh
[ -d .deploy/.git ] || { echo "ERROR: .deploy clone missing — run: git clone https://github.com/meet-p-dev/refactored-octo-tribble.git .deploy"; exit 1; }

cd .deploy
git pull --rebase origin main
cp ../moneytrack.html index.html
cp ../CHANGELOG.md CHANGELOG.md
git add index.html CHANGELOG.md
if git diff --cached --quiet; then echo "Nothing to deploy."; exit 0; fi
git commit -m "$V — $MSG"
git push origin main
echo "Deployed $V"
