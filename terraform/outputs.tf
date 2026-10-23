output "resource_group_name" {
  value       = azurerm_resource_group.rg.name
  description = "The container resource group name."
}

output "search_service_endpoint" {
  value       = "https://${azurerm_search_service.search.name}.search.windows.net"
  description = "The base URL for connecting your Python ingest client script to the search engine."
}

output "aks_cluster_name" {
  value       = azurerm_kubernetes_cluster.aks.name
  description = "The cluster handle for your local Kubernetes CLI credentials hook."
}

output "openai_endpoint" {
  value       = azurerm_cognitive_account.openai.endpoint
  description = "The customized secure backend private link subdomain URL for your OpenAI backend."
}

output "storage_container_url" {
  value       = "${azurerm_storage_account.storage.primary_blob_endpoint}${azurerm_storage_container.docs.name}"
  description = "Target address path for your runbook document binary storage system."
}
