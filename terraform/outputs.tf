output "hosting_url" {
  description = "Default Firebase Hosting URL."
  value       = "https://${var.project_id}.web.app"
}

output "primary_domain_dns" {
  description = "DNS records GoDaddy must serve before the primary domain connects."
  value       = google_firebase_hosting_custom_domain.primary.required_dns_updates
}

output "redirect_domain_dns" {
  description = "DNS records for hostnames that redirect to the primary domain."
  value = {
    for domain, resource in google_firebase_hosting_custom_domain.redirect :
    domain => resource.required_dns_updates
  }
}
