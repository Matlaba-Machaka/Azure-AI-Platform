variable "location" {
  type        = string
  description = "The target Azure region for deployment. Shifted from eastus2 due to resource constraints."
  default     = "eastus"
}

variable "resource_group_name" {
  type        = string
  description = "The base resource group containing the production environment."
  default     = "rg-ops-copilot-prod"
}

variable "search_service_name" {
  type        = string
  description = "Name for the Azure AI Search instance."
  default     = "search-ops-copilot"
}

variable "aks_cluster_name" {
  type        = string
  description = "Name for the Managed Kubernetes Cluster container host."
  default     = "aks-copilot-compute"
}

variable "cognitive_account_name" {
  type        = string
  description = "Name for the Azure OpenAI account infrastructure."
  default     = "cog-ops-openai"
}

variable "storage_account_name" {
  type        = string
  description = "The storage infrastructure handle for document containers."
  default     = "saopscopilotdocs"
}
