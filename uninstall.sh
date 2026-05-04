#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PLUGIN_NAME=hehehe
TARGET_PLUGIN_DIR="$HOME/.codex/plugins/$PLUGIN_NAME"

DRY_RUN=0
SCOPE=user
for arg in "$@"; do
  if [ "$arg" = "--dry-run" ]; then
    DRY_RUN=1
  elif [ "$arg" = "--project" ]; then
    SCOPE=project
  fi
done

if [ "$SCOPE" = "project" ]; then
  TARGET_PLUGIN_DIR="$(pwd)/.codex/plugins/$PLUGIN_NAME"
fi

if [ "$DRY_RUN" = "1" ]; then
  echo "[dry-run] Uninstalling hehehe Codex plugin"
else
  echo "Uninstalling hehehe Codex plugin"
fi
echo "Plugin target: $TARGET_PLUGIN_DIR"
echo "Scope: $SCOPE"

if [ "$DRY_RUN" != "1" ]; then
  rm -rf "$TARGET_PLUGIN_DIR"
fi

echo "Uninstalled hehehe."
echo "Restart Codex so it can rescan plugins and skills."
