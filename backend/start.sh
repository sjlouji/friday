#!/bin/bash

# Create ledger file if it doesn't exist
if [ ! -f "ledger.beancount" ]; then
    touch ledger.beancount
fi

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

