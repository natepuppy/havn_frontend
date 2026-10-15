variable "project_id" {
  type        = string
  description = "GCP project that already exists, e.g. havn-frontend-staging."
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "primary_domain" {
  type        = string
  description = "Public hostname for this site, without a scheme."
}

variable "redirect_domains" {
  type        = list(string)
  description = "Extra hostnames that redirect to primary_domain."
  default     = []
}
