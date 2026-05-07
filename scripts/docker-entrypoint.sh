#!/bin/sh
set -e

export DATABASE_URL="${DATABASE_URL:-file:/data/dev.db}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-changeme-set-a-real-secret-in-production}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:3000}"

echo ">>> DATABASE_URL: $DATABASE_URL"
echo ">>> NEXTAUTH_URL: $NEXTAUTH_URL"
echo ">>> RUN_SEED_ON_START: $RUN_SEED_ON_START"

mkdir -p /data
echo ">>> Directorio /data listo"

echo ">>> Ejecutando prisma db push..."
npx prisma db push
echo ">>> prisma db push completado"

if [ "$RUN_SEED_ON_START" = "true" ]; then
  echo ">>> Ejecutando seed..."
  node prisma/seed.js
  echo ">>> Seed completado"
fi

echo ">>> Iniciando servidor Next.js..."
exec "$@"
