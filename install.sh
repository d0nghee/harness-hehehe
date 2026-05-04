#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PLUGIN_NAME=hehehe
SOURCE_PLUGIN_DIR="$SCRIPT_DIR/plugins/$PLUGIN_NAME"
TARGET_PLUGIN_DIR="$HOME/.codex/plugins/$PLUGIN_NAME"

DRY_RUN=0
for arg in "$@"; do
  if [ "$arg" = "--dry-run" ]; then
    DRY_RUN=1
  fi
done

if [ ! -d "$SOURCE_PLUGIN_DIR" ]; then
  echo "Missing bundled plugin directory: $SOURCE_PLUGIN_DIR" >&2
  exit 1
fi

if [ "$DRY_RUN" = "1" ]; then
  echo "[dry-run] Installing hehehe Codex plugin"
else
  echo "Installing hehehe Codex plugin"
fi
echo "Source: $SOURCE_PLUGIN_DIR"
echo "Plugin target: $TARGET_PLUGIN_DIR"

if [ "$DRY_RUN" != "1" ]; then
  mkdir -p "$(dirname "$TARGET_PLUGIN_DIR")"
  rm -rf "$TARGET_PLUGIN_DIR"
  cp -R "$SOURCE_PLUGIN_DIR" "$TARGET_PLUGIN_DIR"
fi

echo "Installed hehehe."
echo "Restart Codex so it can rescan plugins and skills."
