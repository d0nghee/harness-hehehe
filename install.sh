#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PLUGIN_NAME=hehehe
SOURCE_PLUGIN_DIR="$SCRIPT_DIR/plugins/$PLUGIN_NAME"

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

if [ ! -d "$SOURCE_PLUGIN_DIR" ]; then
  echo "Missing bundled plugin directory: $SOURCE_PLUGIN_DIR" >&2
  exit 1
fi

SOURCE_REAL=$(cd "$SOURCE_PLUGIN_DIR" && pwd)
if [ -d "$TARGET_PLUGIN_DIR" ]; then
  TARGET_REAL=$(cd "$TARGET_PLUGIN_DIR" && pwd)
  if [ "$SOURCE_REAL" = "$TARGET_REAL" ]; then
    echo "Source and target plugin directories are the same. Run --project from the target project, or use --target /path/to/project." >&2
    exit 1
  fi
fi

if [ "$DRY_RUN" = "1" ]; then
  echo "[dry-run] Installing hehehe Codex plugin"
else
  echo "Installing hehehe Codex plugin"
fi
echo "Source: $SOURCE_PLUGIN_DIR"
echo "Plugin target: $TARGET_PLUGIN_DIR"
echo "Marketplace target: $MARKETPLACE_PATH"
echo "Scope: $SCOPE"

if [ "$DRY_RUN" != "1" ]; then
  mkdir -p "$(dirname "$TARGET_PLUGIN_DIR")"
  rm -rf "$TARGET_PLUGIN_DIR"
  cp -R "$SOURCE_PLUGIN_DIR" "$TARGET_PLUGIN_DIR"

  mkdir -p "$(dirname "$MARKETPLACE_PATH")"
  PROJECT_NAME=$(basename "$TARGET_ROOT")
  cat > "$MARKETPLACE_PATH" <<EOF
{
  "name": "$PROJECT_NAME-local",
  "interface": {
    "displayName": "$PROJECT_NAME Local Plugins"
  },
  "plugins": [
    {
      "name": "$PLUGIN_NAME",
      "source": {
        "source": "local",
        "path": "./plugins/$PLUGIN_NAME"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
EOF
fi

echo "Installed hehehe."
echo "Restart Codex so it can rescan plugins and skills."
