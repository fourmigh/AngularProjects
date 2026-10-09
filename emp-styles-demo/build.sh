#!/bin/bash
# emp-styles-demo 统一脚本（参考 projects/build.sh 用法）
# Usage: bash build.sh <command> [options]
#
#   lib                       构建 emp-components -> npm pack -> 安装进 bike-tower
#   serve [target]            后台启动 dev server（默认 bike-tower）
#                             target = bike-tower (4200) | emp-ui (4201) | all
#   all [--serve=<target>]    先 lib 再 serve
#   stop                      停止所有后台服务
#   help                      显示帮助
#
# 注意：本脚本依赖 Linux 工具（nohup / fuser / curl），请在 WSL 或 Git Bash 下运行。

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EMP="$SCRIPT_DIR/emp"
EMP_DIST="$EMP/dist/emp-components"
BIKE_TOWER="$SCRIPT_DIR/bike-tower"
LOG_DIR="$SCRIPT_DIR/.build-logs"

ensure_deps() {
  local dir="$1"
  if [ ! -d "$dir/node_modules" ]; then
    echo "==> npm install ($dir)"
    ( cd "$dir" && npm install )
  fi
}

wait_http() {
  local url="$1" timeout="${2:-240}" waited=0 code
  while [ "$waited" -lt "$timeout" ]; do
    code="$(curl -s -o /dev/null -m 3 -w '%{http_code}' "$url" 2>/dev/null || true)"
    if [ -n "$code" ] && [ "$code" != "000" ]; then
      return 0
    fi
    sleep 2
    waited=$((waited + 2))
  done
  return 1
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
  echo "==> Installing into bike-tower (npm install)..."
  ( cd "$BIKE_TOWER" && rm -rf node_modules/@tikmac && npm install --no-save "$tgz" )

  echo "==> Done. emp-components packed and installed into bike-tower."
}

start_web_bg() {
  local target="${1:-bike-tower}" proj script port
  case "$target" in
    bike-tower) proj="$BIKE_TOWER"; script="npm run start"; port=4200 ;;
    emp-ui)     proj="$EMP";        script="npm run start"; port=4201 ;;
    *) echo "Unknown serve target: $target (expected bike-tower|emp-ui|all)"; exit 1 ;;
  esac
  echo "==> Starting '$target' in background (port $port)..."
  rm -rf "$proj/.angular/cache"
  mkdir -p "$LOG_DIR"
  ( cd "$proj" && nohup $script > "$LOG_DIR/web-$target.log" 2>&1 & echo $! > "$LOG_DIR/web-$target.pid" )
  echo "    $target pid: $(cat "$LOG_DIR/web-$target.pid"), log: $LOG_DIR/web-$target.log"
}

cleanup() {
  echo ""
  echo "==> Shutting down services..."
  for f in "$LOG_DIR"/web-*.pid; do
    [ -e "$f" ] || continue
    kill "$(cat "$f")" 2>/dev/null || true
    rm -f "$f"
  done
  fuser -k 4200/tcp 4201/tcp 2>/dev/null || true
}

cmd_serve() {
  local target="${1:-bike-tower}"

  if [ "$target" = "all" ]; then
    start_web_bg bike-tower
    start_web_bg emp-ui
    echo ""
    echo "==> Stack is up:"
    echo "    bike-tower : http://localhost:4200 (log $LOG_DIR/web-bike-tower.log)"
    echo "    emp-ui     : http://localhost:4201 (log $LOG_DIR/web-emp-ui.log)"
    echo "    Press Ctrl-C to stop all services."
    trap cleanup INT TERM EXIT
    wait
    return
  fi

  # bike-tower 依赖打包后的库；未安装则先构建安装
  if [ "$target" = "bike-tower" ] && \
     [ ! -f "$BIKE_TOWER/node_modules/@tikmac/emp-components/package.json" ]; then
    echo "==> emp-components not installed in bike-tower; running 'lib' first."
    cmd_lib
  fi

  start_web_bg "$target"
  echo ""
  echo "==> '$target' is up. Press Ctrl-C to stop."
  trap cleanup INT TERM EXIT
  wait
}

show_help() {
  echo "Usage: bash build.sh <command> [options]"
  echo ""
  echo "Commands:"
  echo "  lib                   Build emp-components, pack, install into bike-tower"
  echo "  serve [target]        Start dev server in background (default: bike-tower)"
  echo "                        target = bike-tower (4200) | emp-ui (4201) | all"
  echo "  all [--serve=<target>]  Run 'lib' then 'serve'"
  echo "  stop                  Stop all background services"
  echo "  help                  Show this help"
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
    # --serve=<target> 解析（默认 bike-tower）
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
