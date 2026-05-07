#!/bin/sh
set -e

# For SQLite deployments, ensure the db directory exists when using a mounted volume.
mkdir -p /data

# Create/update schema in the target database (safe for current sqlite setup).
npx prisma db push

if [ "$RUN_SEED_ON_START" = "true" ]; then
  node prisma/seed.js
fi

exec "$@"
