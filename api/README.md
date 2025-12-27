# Friday Backend API

FastAPI backend integrated with Beancount library for managing financial data.

## Architecture

This backend follows the [FastAPI full-stack template](https://github.com/fastapi/full-stack-fastapi-template) architecture:

```
api/app/
├── __init__.py
├── main.py                    # Main FastAPI application
├── core/                      # Core configuration
│   ├── config.py             # Settings and configuration
│   ├── logging.py            # Logging setup
│   └── exceptions.py          # Custom exceptions
├── models/                    # Pydantic models
│   └── schemas.py             # Request/Response schemas
├── services/                  # Business logic layer
│   ├── beancount_service.py
│   ├── transaction_service.py
│   ├── account_service.py
│   ├── file_service.py
│   ├── report_service.py
│   └── import_service.py
├── utils/                     # Utility functions
│   └── beancount_utils.py
└── api/                       # API routes
    ├── deps.py                # Dependencies
    └── v1/
        ├── api.py             # Router aggregation
        └── endpoints/         # API endpoints
            ├── transactions.py
            ├── accounts.py
            ├── files.py
            ├── reports.py
            ├── dashboard.py
            ├── balances.py
            ├── prices.py
            └── import_export.py
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables (optional):
```bash
export BEANCOUNT_FILE=ledger.beancount
```

3. Run the server:
```bash
uvicorn app.main:app --reload
```

Or use the startup script:
```bash
./start.sh
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/api/docs`

## Configuration

Configuration is managed through `app/core/config.py` using Pydantic Settings. You can override settings via environment variables or a `.env` file.

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions (with pagination and filtering)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction
- `POST /api/transactions/preview` - Preview CSV/Excel file
- `POST /api/transactions/import-mapped` - Import transactions with mapping

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

### Files
- `GET /api/files/browse` - Browse files and directories
- `GET /api/files/common-paths` - Get common file system paths
- `POST /api/files/create` - Create new beancount file

### Import/Export
- `POST /api/import/upload` - Import beancount file
- `GET /api/export/download` - Export beancount file

## API Documentation

Visit `http://localhost:8000/api/docs` for interactive API documentation (Swagger UI).

Visit `http://localhost:8000/api/redoc` for ReDoc documentation.

## Development

The backend uses:
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation and settings management
- **Beancount** - Plain text accounting library
- **Uvicorn** - ASGI server

## Error Handling

Custom exceptions are defined in `app/core/exceptions.py`:
- `BeancountFileNotFoundError` - File not found
- `BeancountFileError` - File parsing errors
- `AccountAlreadyExistsError` - Account already exists
- `InvalidAccountNameError` - Invalid account name format
