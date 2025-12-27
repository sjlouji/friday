#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Create ledger file if it doesn't exist
if [ ! -f "ledger.beancount" ]; then
    touch ledger.beancount
fi

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

