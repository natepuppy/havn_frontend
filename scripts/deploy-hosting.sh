#!/usr/bin/env bash
# Build the Vite app and deploy it to Firebase Hosting.
# Usage: ./scripts/deploy-hosting.sh staging|production
set -euo pipefail

env_name="${1:?usage: ./scripts/deploy-hosting.sh staging|production}"
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

if [[ "$env_name" == "production" ]]; then
  mode="production"
  project="havn-frontend-production"
else
  mode="staging"
  project="havn-frontend-staging"
fi

if [[ ! -f ".env.${mode}" && ! -f ".env.${env_name}" ]]; then
  echo "Missing the ${env_name} env file. Run scripts/sync-api-url.sh first." >&2
  exit 1
fi

npm run "build:${env_name}"
npx firebase-tools@15.26.0 deploy --only hosting --project "$project" --non-interactive
