# Friday

A modern, comprehensive web interface for Beancount plain text accounting system.

## Features

- **Dashboard**: Overview of finances with key metrics and visualizations
- **Transactions**: Full CRUD operations for managing transactions
- **Accounts**: Manage your chart of accounts (Assets, Liabilities, Equity, Income, Expenses)
- **Reports**: Generate balance sheets, income statements, and cash flow reports
- **Portfolio**: Track investments and holdings with gain/loss calculations
- **Budget**: Set budgets and track spending against them
- **Import/Export**: Import beancount files and export your data
- **Settings**: Configure currency, date formats, and other preferences

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Python 3.8+ and pip

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend server:
```bash
uvicorn main:app --reload
```

Or use the startup script:
```bash
./start.sh
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional):
```bash
VITE_API_URL=http://localhost:8000/api
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Cloudscape Design System** - AWS design system components
- **Zustand** - State management
- **React Router** - Routing
- **Recharts** - Data visualization

### Backend
- **FastAPI** - Python web framework
- **Beancount** - Plain text accounting library
- **Uvicorn** - ASGI server

## Project Structure

```
.
├── backend/        # Python FastAPI backend
│   ├── main.py     # API server
│   └── requirements.txt
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── store/          # State management
│   ├── services/       # API service layer
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
```

## Usage

1. **Import Data**: Start by importing a beancount file or creating accounts and transactions manually
2. **Manage Transactions**: Add, edit, or delete transactions with full double-entry support
3. **View Reports**: Generate financial reports to understand your financial position
4. **Track Budgets**: Set budgets for expense categories and monitor spending
5. **Monitor Portfolio**: Track investments and see gains/losses

## API Endpoints

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create account
- `GET /api/dashboard` - Get dashboard data
- `GET /api/reports/balance-sheet` - Get balance sheet
- `GET /api/reports/income-statement` - Get income statement
- `POST /api/import` - Import beancount file
- `GET /api/export` - Export beancount file

Visit `http://localhost:8000/docs` for interactive API documentation.

## License

MIT

