# Azure Operations Copilot (OpsPilot)

An enterprise-grade, infrastructure-heavy Retrieval-Augmented Generation (RAG) platform designed to assist cloud engineers with system troubleshooting. Instead of a generic conversational assistant, this project focuses on **zero-trust security, strict network isolation, and fully automated infrastructure provisioning**.

The platform ingests Azure runbooks, internal troubleshooting guides, and network topology maps to diagnose complex infrastructure issues (e.g., *"Why is my VM unreachable?"*) and outputs precise solutions backed by structured citations.

---

## 🏗️ Architecture Overview

The system is deployed using a hardened **Hub-and-Spoke / Isolated VNet** topology. No AI data processing or database interaction touches the public internet.

```text
                       [ Public Internet / Client ]
                                    │
                                    ▼ (HTTPS)
                      [ Azure Application Gateway ]
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    │                       Private VNet Boundary                    │
    │                                                               │
    │  ┌────────────────────────┐       ┌────────────────────────┐  │
    │  │       AKS Subnet       │       │ Private Endpoint Subn. │  │
    │  │ ┌────────────────────┐ │       │  ┌──────────────────┐  │  │
    │  │ │   Python Backend   │─┼───────┼─>│ Azure AI Search  │  │  │
    │  │ │   (LangChain/Pod)  │ │       │  └──────────────────┘  │  │
    │  │ └────────────────────┘ │       │  ┌──────────────────┐  │  │
    │  │                      ─┼───────┼─>│ Azure OpenAI     │  │  │
    │  │ ┌────────────────────┐ │       │  └──────────────────┘  │  │
    │  │ │      React UI      │ │       │  ┌──────────────────┐  │  │
    │  │ └────────────────────┘ │       │  │ Blob Storage     │  │  │
    │  └────────────────────────┘       │  └──────────────────┘  │  │
    │                                   │  ┌──────────────────┐  │  │
    │                                   │  │ Azure Key Vault  │  │  │
    │                                   │  └──────────────────┘  │  │
    └───────────────────────────────────┴────────────────────────┴──┘
```

### 🔒 Enterprise Security Guardrails
* **Network Isolation:** Azure OpenAI, AI Search, and Blob Storage are locked down behind **Azure Private Endpoints**. All traffic stays on the Microsoft backbone network.
* **Passwordless Auth:** Leverages **AKS Workload Identity** (OIDC Issuer). Pods exchange ephemeral tokens with Entra ID to authenticate with Azure services—**zero API keys or connection strings are stored in code**.
* **Granular RBAC:** Uses strict principal-based access control (e.g., `Cognitive Services OpenAI User` and `Storage Blob Data Reader`).

---

## 📂 Repository Structure

The project separates the infrastructure declarations cleanly from the decoupled application code:

```text
├── .github/workflows/          # CI/CD pipelines (Terraform plan/lint, Docker build)
├── terraform/                  # Infrastructure as Code (IaC)
│   ├── modules/                # Reusable infra components
│   │   ├── network/            # VNet, Subnets, NSGs, Private DNS Zones
│   │   ├── security/           # Key Vault, Managed Identities, RBAC Role Assignments
│   │   ├── compute/            # Azure Kubernetes Service (AKS) with OIDC enabled
│   │   └── data_ai/            # OpenAI, AI Search Service, Private Blob Storage
│   ├── dev/                    # Development environment root variables
│   └── provider.tf             # AzureRM configuration
├── src/                        # Application Code
│   ├── backend/                # Python / FastAPI RAG API Orchestrator (LangChain)
│   │   ├── app/                # Main retrieval and orchestration engine
│   │   └── Dockerfile          # Multi-stage secure container build
│   └── frontend/               # React.js / TypeScript / Tailwind CSS UI dashboard
└── docs/                       # Architectural runbooks and deep dives

```

## 🛠️ Tech Stack & Core Dependencies

* **Infrastructure:** Terraform, Azure CLI
* **Orchestration & Containerization:** Azure Kubernetes Service (AKS), Docker, Microsoft Entra Workload Identity
* **AI & Search Ecosystem:** Azure OpenAI (`gpt-4o`, `text-embedding-3-small`), Azure AI Search (Hybrid + Vector matching), LangChain (Python)
* **Frontend UI:** React.js, TypeScript, Tailwind CSS, Vite

---

### 2. Configure AKS Workload Identity

Establish the trust relationship between the AKS service account and your Azure Managed Identity:

```bash
az identity federated-credential create \
  --name "ops-copilot-fed-cred" \
  --identity-name "id-ops-copilot-backend" \
  --resource-group "rg-ops-copilot-dev" \
  --issuer "\${AKS_OIDC_ISSUER_URL}" \
  --subject "system:serviceaccount:default:ops-copilot-sa"
```

