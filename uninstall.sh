#!/usr/bin/env sh
set -eu

PLUGIN_NAME=hehehe

DRY_RUN=0
SCOPE=user
TARGET_ROOT=
PREV=
for arg in "$@"; do
  if [ "$PREV" = "--target" ]; then
    TARGET_ROOT=$arg
    SCOPE=project
    PREV=
  elif [ "$arg" = "--dry-run" ]; then
    DRY_RUN=1
  elif [ "$arg" = "--project" ]; then
    SCOPE=project
  elif [ "$arg" = "--target" ]; then
    PREV=--target
  fi
done

if [ "$PREV" = "--target" ]; then
  echo "--target requires a path" >&2
  exit 1
fi

if [ -n "$TARGET_ROOT" ]; then
  TARGET_ROOT=$(cd "$TARGET_ROOT" && pwd)
elif [ "$SCOPE" = "project" ]; then
  TARGET_ROOT=$(pwd)
else
  TARGET_ROOT=${CODEX_HOME:-"$HOME/.codex"}
fi

TARGET_PLUGIN_DIR="$TARGET_ROOT/plugins/$PLUGIN_NAME"
MARKETPLACE_PATH="$TARGET_ROOT/.agents/plugins/marketplace.json"

if [ "$DRY_RUN" = "1" ]; then
  echo "[dry-run] Uninstalling hehehe Codex plugin"
else
  echo "Uninstalling hehehe Codex plugin"
fi
echo "Plugin target: $TARGET_PLUGIN_DIR"
echo "Marketplace target: $MARKETPLACE_PATH"
echo "Scope: $SCOPE"

if [ "$DRY_RUN" != "1" ]; then
  rm -rf "$TARGET_PLUGIN_DIR"
  rm -f "$MARKETPLACE_PATH"
fi

echo "Uninstalled hehehe."
echo "Restart Codex so it can rescan plugins and skills."
