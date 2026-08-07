#!/usr/bin/env bash
# Se corre a mano YA ADENTRO del servidor (no se conecta por SSH), en la
# misma carpeta donde viven docker-compose.yml y .env.
#
# Uso: ./deploy.sh 23.0.5
set -euo pipefail

TAG="${1:?Uso: ./deploy.sh <version>  (ej. ./deploy.sh 23.0.5)}"
export TAG

echo "==> Jalando slayfear/cinerejon:${TAG}"
docker compose pull app

echo "==> Levantando la nueva version"
docker compose up -d --remove-orphans

echo "==> Esperando a que /api/health responda..."
for i in $(seq 1 15); do
  if curl -fs http://localhost:3000/api/health > /dev/null; then
    echo "==> OK, cinerejon:${TAG} arriba y conectado a Mongo."
    exit 0
  fi
  sleep 2
done

echo "==> El contenedor no respondio a tiempo. Revisa: docker compose logs -f app" >&2
exit 1
