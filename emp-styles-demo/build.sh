#!/bin/bash
# emp-styles-demo build helper
# Usage: bash build.sh <command> [options]
#
#   lib                       Build emp-components, npm pack, install into bike-tower
#   serve [target]            Start dev server in background (default: bike-tower)
#                             target = bike-tower (4210) | emp-ui (4201) | all
#   all [--serve=target]      Run 'lib' then 'serve'
#   stop                      Stop all background services
#   help                      Show help
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EMP="$SCRIPT_DIR/emp"
EMP_DIST="$EMP/dist/emp-components"
BIKE_TOWER="$SCRIPT_DIR/bike-tower"
LOG_DIR="$SCRIPT_DIR/.build-logs"
WAIT_TIMEOUT="${EMP_WAIT_TIMEOUT:-300}"

platform_name() {
  node -p 'process.platform + "-" + process.arch' 2>/dev/null || echo unknown
}

deps_ok() {
  local dir="$1"
  [ -d "$dir/node_modules" ] || return 1
  ( cd "$dir" && node -e "require('rolldown')" >/dev/null 2>&1 )
}

ensure_deps() {
  local dir="$1"
  if deps_ok "$dir"; then
    return 0
  fi

  echo "==> Installing dependencies for $(platform_name) ($dir)"
  if [ -d "$dir/node_modules" ]; then
    if ! rm -rf "$dir/node_modules"; then
      echo "无法删除 $dir/node_modules（可能被另一个平台占用）。"
      echo "请在当前系统手动删除该目录后重新执行。"
      exit 1
    fi
  fi

  if [ -f "$dir/package-lock.json" ]; then
    ( cd "$dir" && npm ci --no-audit --no-fund )
  else
    ( cd "$dir" && npm install --no-audit --no-fund )
  fi
}

cmd_lib() {
  ensure_deps "$EMP"

  echo "==> Building emp-components..."
  ( cd "$EMP" && npx ng build emp-components )

  echo "==> Packing emp-components..."
  rm -f "$EMP_DIST"/*.tgz
  ( cd "$EMP_DIST" && npm pack >/dev/null )
  local tgz
  tgz="$(ls "$EMP_DIST"/*.tgz | head -n 1)"
  echo "    tarball: $tgz"

  ensure_deps "$BIKE_TOWER"
  echo "==> Installing into bike-tower..."
  ( cd "$BIKE_TOWER" && rm -rf node_modules/@tikmac && npm install --no-audit --no-fund --no-save "$tgz" )

  echo "==> Done. emp-components packed and installed into bike-tower."
}

start_web_bg() {
  local target="${1:-bike-tower}" proj script port
  case "$target" in
    bike-tower) proj="$BIKE_TOWER"; script="npm run start"; port=4210 ;;
    emp-ui)     proj="$EMP";        script="npm run start"; port=4201 ;;
    *) echo "Unknown serve target: $target (expected bike-tower|emp-ui|all)"; exit 1 ;;
  esac

  ensure_deps "$proj"

  echo "==> Starting '$target' in background (port $port)..."
  mkdir -p "$LOG_DIR"
  (
    cd "$proj"
    exec nohup $script
  ) > "$LOG_DIR/web-$target.log" 2>&1 &
  echo $! > "$LOG_DIR/web-$target.pid"
  echo "    $target pid: $(cat "$LOG_DIR/web-$target.pid"), log: $LOG_DIR/web-$target.log"
}

wait_http() {
  local url="$1"
  local timeout="${2:-$WAIT_TIMEOUT}"
  local waited=0
  local code

  if ! command -v curl >/dev/null 2>&1; then
    echo ""
    echo "curl is required to wait for dev servers."
    return 1
  fi

  while [ "$waited" -lt "$timeout" ]; do
    code="$(curl -s -o /dev/null -m 3 -w '%{http_code}' "$url" 2>/dev/null || true)"

    if [ "$code" = "200" ]; then
      return 0
    fi

    sleep 2
    waited=$((waited + 2))

    if [ $((waited % 10)) -eq 0 ]; then
      printf '.'
    fi
  done

  return 1
}

wait_for_target() {
  local target="$1"
  local url

  case "$target" in
    bike-tower) url="http://127.0.0.1:4210/" ;;
    emp-ui)     url="http://127.0.0.1:4201/" ;;
    *) echo "Unknown wait target: $target"; return 1 ;;
  esac

  echo "==> Waiting for '$target' at $url (timeout ${WAIT_TIMEOUT}s)..."

  if wait_http "$url"; then
    echo ""
    echo "    '$target' is ready."
    return 0
  fi

  echo ""
  echo "    '$target' did not become ready within ${WAIT_TIMEOUT}s."
  echo "    Last log lines:"
  tail -n 30 "$LOG_DIR/web-$target.log" 2>/dev/null || true
  return 1
}

cleanup() {
  echo ""
  echo "==> Shutting down services..."
  for f in "$LOG_DIR"/web-*.pid; do
    [ -e "$f" ] || continue
    kill "$(cat "$f")" 2>/dev/null || true
    rm -f "$f"
  done
  if command -v fuser >/dev/null 2>&1; then
    fuser -k 4210/tcp 4201/tcp 2>/dev/null || true
  fi
}

cmd_serve() {
  local target="${1:-bike-tower}"

  if [ "$target" = "all" ]; then
    start_web_bg bike-tower
    start_web_bg emp-ui
    trap cleanup INT TERM EXIT

    wait_for_target bike-tower
    wait_for_target emp-ui

    echo ""
    echo "==> Stack is up:"
    echo "    bike-tower : http://127.0.0.1:4210 (log $LOG_DIR/web-bike-tower.log)"
    echo "    emp-ui     : http://127.0.0.1:4201 (log $LOG_DIR/web-emp-ui.log)"
    echo "    Press Ctrl-C to stop all services."

    wait
    return
  fi

  if [ "$target" = "bike-tower" ] && \
     [ ! -f "$BIKE_TOWER/node_modules/@tikmac/emp-components/package.json" ]; then
    echo "==> emp-components not installed in bike-tower; running 'lib' first."
    cmd_lib
  fi

  start_web_bg "$target"
  trap cleanup INT TERM EXIT

  wait_for_target "$target"

  echo ""
  echo "==> '$target' is up. Press Ctrl-C to stop."
  wait
}

show_help() {
  echo "Usage: bash build.sh <command> [options]"
  echo ""
  echo "Commands:"
  echo "  lib                     Build emp-components, pack, install into bike-tower"
  echo "  serve [target]          Start dev server in background (default: bike-tower)"
  echo "                          target = bike-tower (4210) | emp-ui (4201) | all"
  echo "  all [--serve=target]    Run 'lib' then 'serve'"
  echo "  stop                    Stop all background services"
  echo "  help                    Show this help"
  echo ""
  echo "Dependencies are installed per platform. If node_modules was created by"
  echo "another OS (e.g. Windows) the script reinstalls it with 'npm ci'."
}

case "${1:-help}" in
  lib)
    shift
    cmd_lib ;;
  serve)
    shift
    cmd_serve "$@" ;;
  all)
    shift
    cmd_lib
    serve_target="bike-tower"
    for arg in "$@"; do
      case "$arg" in
        --serve=*) serve_target="${arg#--serve=}" ;;
      esac
    done
    cmd_serve "$serve_target" ;;
  stop)
    cleanup ;;
  help | --help | -h)
    show_help ;;
  *)
    echo "Unknown command: $1"
    show_help
    exit 1 ;;
esac
