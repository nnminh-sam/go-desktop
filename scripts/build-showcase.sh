#!/usr/bin/env bash
# Builds doc/design-system.html – a single self-contained page (React + components + CSS inlined).
# Needs esbuild, react@19, react-dom@19 and @hugeicons/core-free-icons resolvable (frontend/node_modules or NODE_PATH).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
npx esbuild "$ROOT/frontend/src/showcase/showcase.tsx" --bundle --minify --format=iife --jsx=automatic \
  --loader:.css=text --define:process.env.NODE_ENV='"production"' --outfile="$TMP/app.js" --log-level=warning
{
  printf '<!doctype html>\n<html lang="en" data-theme="light">\n<head>\n<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
  printf '<title>wp-go-desktop · Design system</title>\n</head>\n<body>\n<div id="root"></div>\n<script>\n'
  sed 's#</script#<\\/script#g' "$TMP/app.js"
  printf '\n</script>\n</body>\n</html>\n'
} > "$ROOT/doc/design-system.html"
rm -rf "$TMP"
echo "wrote doc/design-system.html ($(wc -c < "$ROOT/doc/design-system.html" | tr -d ' ') bytes)"
