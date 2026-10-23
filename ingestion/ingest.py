import os
from azure.identity import DefaultAzureCredential
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex, SimpleField, SearchableField, SearchFieldDataType, VectorSearch, HnswAlgorithmConfiguration
)
from azure.search.documents import SearchClient

# Connect using local terminal identity or Pod identity
credential = DefaultAzureCredential()
endpoint = "https://windows.net"
index_name = "ops-runbooks-index"

index_client = SearchIndexClient(endpoint=endpoint, credential=credential)

# Establish vector schema
fields = [
    SimpleField(name="id", type=SearchFieldDataType.String, key=True),
    SearchableField(name="title", type=SearchFieldDataType.String),
    SearchableField(name="content", type=SearchFieldDataType.String),
    SearchField(name="content_vector", type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                vector_search_dimensions=1536, vector_search_profile_name="hnsw-profile")
]
vector_search = VectorSearch(
    algorithms=[HnswAlgorithmConfiguration(name="hnsw-algo")],
    profiles=[{"name": "hnsw-profile", "algorithm_configuration_name": "hnsw-algo"}]
)

index = SearchIndex(name=index_name, fields=fields, vector_search=vector_search)
index_client.create_or_update_index(index)

print(f"✅ Secure Azure AI Search Index '{index_name}' successfully created.")
