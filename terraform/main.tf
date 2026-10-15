# Havn web — Firebase Hosting on its own GCP project.
#
#   ./apply.sh staging
#   ./apply.sh production
#
# The site is https://<project-id>.web.app. Ship a build with
# scripts/deploy-hosting.sh after scripts/sync-api-url.sh has written the API URL.

locals {
  services = [
    "cloudresourcemanager.googleapis.com",
    "firebase.googleapis.com",
    "firebasehosting.googleapis.com",
    "serviceusage.googleapis.com",
  ]
}

resource "google_project_service" "services" {
  for_each           = toset(local.services)
  service            = each.value
  disable_on_destroy = false
}

resource "google_firebase_project" "this" {
  provider = google-beta
  project  = var.project_id

  depends_on = [google_project_service.services]
}

# The default Hosting site already exists; its id is the project id.
# wait_dns_verification stays false because the records live at GoDaddy.
resource "google_firebase_hosting_custom_domain" "primary" {
  provider              = google-beta
  project               = var.project_id
  site_id               = var.project_id
  custom_domain         = var.primary_domain
  wait_dns_verification = false

  depends_on = [google_firebase_project.this]
}

resource "google_firebase_hosting_custom_domain" "redirect" {
  for_each              = toset(var.redirect_domains)
  provider              = google-beta
  project               = var.project_id
  site_id               = var.project_id
  custom_domain         = each.value
  redirect_target       = var.primary_domain
  wait_dns_verification = false

  depends_on = [google_firebase_hosting_custom_domain.primary]
}
