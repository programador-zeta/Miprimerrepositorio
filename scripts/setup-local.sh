#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export npm_config_cache="${SOMEWHERE_NPM_CACHE:-/tmp/somewhere-npm}"
npm ci
mkdir -p .local-tools
if [[ ! -x .local-tools/supabase ]]; then
  version=2.54.11
  case "$(uname -m)" in x86_64) arch=amd64;; aarch64|arm64) arch=arm64;; *) echo 'Unsupported architecture'; exit 1;; esac
  artifact="supabase_linux_${arch}.tar.gz"
  base="https://github.com/supabase/cli/releases/download/v${version}"
  curl -fLsS "$base/supabase_${version}_checksums.txt" -o .local-tools/checksums.txt
  curl -fLsS "$base/$artifact" -o ".local-tools/$artifact"
  (cd .local-tools; awk -v file="$artifact" '$2 == file' checksums.txt | sha256sum -c -)
  tar -xzf ".local-tools/$artifact" -C .local-tools supabase
fi
bash scripts/prepare-local-db.sh
export SUPABASE_INTERNAL_IMAGE_REGISTRY=docker.io
.local-tools/supabase start --exclude studio,realtime,imgproxy,edge-runtime,logflare,vector,supavisor,postgres-meta 2>&1 | node scripts/redact-cli.mjs > .local-tools/start.log || { tail -50 .local-tools/start.log; exit 1; }
# Never log keys. Store local runtime configuration in the ignored environment file.
.local-tools/supabase status -o json 2>/dev/null | node scripts/write-local-env.mjs

.local-tools/supabase migration up --local

# Seed only the known local Docker database, never a configured remote connection.
docker exec -i supabase_db_Miprimerrepositorio psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/seed.sql
