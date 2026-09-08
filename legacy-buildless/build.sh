#!/bin/sh
# Combine index.html + js/*.jsx into a single double-clickable moneytrack.html
cd "$(dirname "$0")"
{
  # everything up to (not including) the three src script tags
  sed '/<script type="text\/babel" src=/,$d' index.html
  echo "<script>window.MT_VERSION=\"V$(cat VERSION)\";</script>"
  echo '<script type="text/babel">'
  cat js/core.jsx
  echo ''
  # drop the per-file hook bindings (already declared in core.jsx) — duplicate const = SyntaxError
  sed '/^const {useState,useEffect,useMemo,useRef}=React;$/d' js/components.jsx
  echo ''
  sed '/^const {useState,useEffect,useMemo,useRef}=React;$/d' js/app.jsx
  echo '</script>'
  echo '</body>'
  echo '</html>'
} > moneytrack.html
echo "Built moneytrack.html ($(wc -l < moneytrack.html | tr -d ' ') lines)"
