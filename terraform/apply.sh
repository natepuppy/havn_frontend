#!/usr/bin/env bash
# Apply one frontend environment: ./apply.sh staging|production
set -euo pipefail

env_name="${1:?usage: ./apply.sh staging|production}"
cd "$(dirname "$0")"

terraform init -input=false
if ! terraform workspace select "$env_name"; then
  terraform workspace new "$env_name"
fi

terraform apply -var-file="environments/${env_name}.tfvars"
