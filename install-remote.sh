#!/usr/bin/env sh
set -eu

REF=main
DRY_RUN=0
PROJECT=0
TARGET_ROOT=
PREV=
for arg in "$@"; do
  if [ "$PREV" = "--ref" ]; then
    REF=$arg
    PREV=
  elif [ "$PREV" = "--target" ]; then
    TARGET_ROOT=$arg
    PREV=
  elif [ "$arg" = "--ref" ]; then
    PREV=--ref
  elif [ "$arg" = "--target" ]; then
    PREV=--target
  elif [ "$arg" = "--dry-run" ] || [ "$arg" = "--project" ]; then
    if [ "$arg" = "--dry-run" ]; then
      DRY_RUN=1
    else
      PROJECT=1
    fi
  else
    echo "Unknown argument: $arg" >&2
    exit 1
  fi
done

if [ -n "$PREV" ]; then
  echo "$PREV requires a value" >&2
  exit 1
fi

REPO=d0nghee/harness-hehehe
ZIP_URL="https://github.com/$REPO/archive/refs/heads/$REF.zip"
TEMP_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/hehehe-install.XXXXXX")
ZIP_PATH="$TEMP_ROOT/hehehe.zip"

cleanup() {
  rm -rf "$TEMP_ROOT"
}
trap cleanup EXIT INT TERM

echo "Downloading hehehe from $ZIP_URL"
if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$ZIP_URL" -o "$ZIP_PATH"
elif command -v wget >/dev/null 2>&1; then
  wget -q "$ZIP_URL" -O "$ZIP_PATH"
else
  echo "curl or wget is required to download hehehe." >&2
  exit 1
fi

if command -v unzip >/dev/null 2>&1; then
  unzip -q "$ZIP_PATH" -d "$TEMP_ROOT"
else
  echo "unzip is required to extract hehehe." >&2
  exit 1
fi

REPO_ROOT=
for candidate in "$TEMP_ROOT"/harness-hehehe-*; do
  if [ -d "$candidate" ]; then
    REPO_ROOT=$candidate
    break
  fi
done

if [ -z "$REPO_ROOT" ]; then
  echo "Downloaded archive did not contain the expected harness-hehehe directory." >&2
  exit 1
fi

INSTALLER="$REPO_ROOT/install.sh"
if [ ! -f "$INSTALLER" ]; then
  echo "Downloaded archive did not contain install.sh." >&2
  exit 1
fi

set --
if [ "$DRY_RUN" = "1" ]; then
  set -- "$@" --dry-run
fi
if [ "$PROJECT" = "1" ]; then
  set -- "$@" --project
fi
if [ -n "$TARGET_ROOT" ]; then
  set -- "$@" --target "$TARGET_ROOT"
fi

sh "$INSTALLER" "$@"
