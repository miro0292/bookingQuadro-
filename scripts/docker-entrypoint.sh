#!/bin/sh
set -e

# Valor por defecto si la variable no está inyectada por el entorno
export DATABASE_URL="${DATABASE_URL:-file:/data/dev.db}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-changeme-set-a-real-secret-in-production}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:3000}"

mkdir -p /data

npx prisma db push

if [ "$RUN_SEED_ON_START" = "true" ]; then
  node prisma/seed.js
fi

exec "$@"
