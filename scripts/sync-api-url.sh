#!/usr/bin/env bash
# Write .env.staging and .env.production from the API Terraform outputs.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
api_terraform="$(cd "$root/../pest_api/terraform" && pwd)"

url_for() {
  local env_name="$1"
  terraform -chdir="$api_terraform" workspace select "$env_name" >/dev/null
  terraform -chdir="$api_terraform" output -raw service_url
}

write_env() {
  local env_name="$1"
  local url="$2"
  local file="$root/.env.${env_name}"
  umask 077
  cat >"$file" <<EOF
VITE_PEST_API_URL=${url}/
VITE_AUTH_API_URL=${url}
EOF
  echo "Wrote $file -> $url"
}

write_env staging "$(url_for staging)"
write_env production "$(url_for production)"
