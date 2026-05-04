#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PLUGIN_NAME=hehehe
TARGET_PLUGIN_DIR="$HOME/.codex/plugins/$PLUGIN_NAME"

DRY_RUN=0
for arg in "$@"; do
  if [ "$arg" = "--dry-run" ]; then
    DRY_RUN=1
  fi
done

if [ "$DRY_RUN" = "1" ]; then
  echo "[dry-run] Uninstalling hehehe Codex plugin"
else
  echo "Uninstalling hehehe Codex plugin"
fi
echo "Plugin target: $TARGET_PLUGIN_DIR"

if [ "$DRY_RUN" != "1" ]; then
  rm -rf "$TARGET_PLUGIN_DIR"
fi

echo "Uninstalled hehehe."
echo "Restart Codex so it can rescan plugins and skills."
