#!/usr/bin/env bash
# Docker's vfs driver duplicates each image layer. Import the official root filesystem
# as one local layer on vfs hosts; use the original image normally on other drivers.
set -euo pipefail
cd "$(dirname "$0")/.."
image='supabase/postgres:17.6.1.029'
if docker image inspect "$image" >/dev/null 2>&1; then exit 0; fi
if [[ "$(docker info --format '{{.Driver}}')" != 'vfs' ]]; then exit 0; fi
mkdir -p .local-tools
version='0.20.6'
case "$(uname -m)" in x86_64) arch=x86_64; platform=amd64;; aarch64|arm64) arch=arm64; platform=arm64;; *) exit 1;; esac
artifact="go-containerregistry_Linux_${arch}.tar.gz"
base="https://github.com/google/go-containerregistry/releases/download/v${version}"
curl -fLsS "$base/checksums.txt" -o .local-tools/crane-checksums.txt
curl -fLsS "$base/$artifact" -o ".local-tools/$artifact"
(cd .local-tools; awk -v file="$artifact" '$2 == file' crane-checksums.txt | sha256sum -c -)
tar -xzf ".local-tools/$artifact" -C .local-tools crane
remote="registry-1.docker.io/$image"
digest="$(.local-tools/crane digest --platform "linux/$platform" "$remote")"
remote="registry-1.docker.io/supabase/postgres@$digest"
.local-tools/crane config --platform "linux/$platform" "$remote" > .local-tools/postgres.config.json
.local-tools/crane export --platform "linux/$platform" "$remote" .local-tools/postgres.rootfs.tar
python3 scripts/import-local-db.py
rm .local-tools/postgres.rootfs.tar
