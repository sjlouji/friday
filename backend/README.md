# Beancount Backend API

FastAPI backend integrated with Beancount library for managing financial data.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variable (optional):
```bash
export BEANCOUNT_FILE=ledger.beancount
```

3. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create new account

### Data
- `GET /api/balances` - Get all balances
- `GET /api/prices` - Get all prices
- `GET /api/dashboard` - Get dashboard summary

### Reports
- `GET /api/reports/balance-sheet` - Get balance sheet
- `GET /api/reports/income-statement?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Get income statement

### Import/Export
- `POST /api/import` - Import beancount file
- `GET /api/export` - Export beancount file

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

