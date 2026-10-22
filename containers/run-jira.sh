#!/bin/bash
set -euo pipefail
cd /workspace/supportal
for attempt in {1..60}; do
  if pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" >/dev/null; then
    break
  fi
  if [ "$attempt" = 60 ]; then echo "PostgreSQL did not become ready" >&2; exit 1; fi
  sleep 2
done
python3 containers/prepare-home.py
exec atlas-mvn -B -Pcontainer-development jira:run "$@"
