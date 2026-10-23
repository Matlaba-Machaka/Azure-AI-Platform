from fastapi import FastAPI
from pydantic import BaseModel
from azure.identity import DefaultAzureCredential
from azure.search.documents import SearchClient
from openai import AzureOpenAI

app = FastAPI(title="Azure Operations Copilot API")

# Initialize Azure Enterprise Clients using Keyless Identity
credential = DefaultAzureCredential()
search_client = SearchClient(
    endpoint="https://windows.net", 
    index_name="ops-runbooks-index",
    credential=credential
)

openai_client = AzureOpenAI(
    azure_endpoint="https://ops-copilot-prod-endpoint.openai.azure.com/", 
    api_version="2024-02-15-preview",
    azure_ad_token_provider=credential.get_token_provider("https://azure.com") 
)


class QueryRequest(BaseModel):
    question: str

@app.post("/ask")
async def ask_copilot(payload: QueryRequest):
    # 1. Query internal vector documents
    results = search_client.search(search_text=payload.question, top=3)
    context_str = "\n".join([r['content'] for r in results])
    
    # 2. Build structured Grounded Prompts
    system_prompt = (
        "You are an expert Azure Platform Engineering Copilot. Answer the operational troubleshooting "
        "question using ONLY the provided engineering documentation context. If unknown, state that clearly.\n"
        f"Context:\n{context_str}"
    )
    
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": payload.question}
        ]
    )
    
    return {"answer": response.choices[0].message.content}
