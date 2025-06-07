from fastapi import APIRouter, Depends
from app.service.services import FinancialAgent, TransactionAgent

router = APIRouter()

financial_agent = FinancialAgent()
transaction_agent = TransactionAgent()

@router.post("/chat")
async def chat_endpoint(query: str):
    # Determine which agent to use based on the query
    if "transaction" in query.lower():
        response = transaction_agent.process_query(query)
    else:
        response = financial_agent.process_query(query)
    return {"response": response} 