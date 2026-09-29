#!/bin/sh
cd /workspace || exit 1
if curl -fsS -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >/tmp/feldwerk-dev.log 2>&1 &
exit 0
