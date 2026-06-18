#!/usr/bin/env bash

set -e

APP_NAME="Ambilengua Frontend"
SSH_USER="${SSH_USER:-trujillo}"
SSH_HOST="${SSH_HOST:-51.15.154.187}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/ambilengua/dist}"

echo "========================================"
echo "Deploy de $APP_NAME"
echo "Destino: $SSH_USER@$SSH_HOST:$REMOTE_PATH"
echo "========================================"

if [ ! -d "node_modules" ]; then
  echo "node_modules no existe. Instalando dependencias..."
  npm install
else
  echo "Dependencias ya instaladas."
fi

echo "Generando build de producción..."
npm run build

if [ ! -d "dist" ]; then
  echo "ERROR: No existe la carpeta dist. El build ha fallado."
  exit 1
fi

echo "Creando carpeta remota si no existe..."
ssh "$SSH_USER@$SSH_HOST" "sudo mkdir -p '$REMOTE_PATH' && sudo chown -R $SSH_USER:$SSH_USER '$REMOTE_PATH'"

echo "Subiendo archivos con rsync..."
rsync -avz --delete dist/ "$SSH_USER@$SSH_HOST:$REMOTE_PATH/"

echo "Recargando Nginx..."
ssh "$SSH_USER@$SSH_HOST" "sudo nginx -t && sudo systemctl reload nginx"

echo "========================================"
echo "Deploy completado correctamente."
echo "Web: https://ambilengua.es"
echo "Jitsi: https://meet.ambilengua.es"
echo "========================================"
