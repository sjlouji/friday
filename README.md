# Friday

A modern, comprehensive web interface for Beancount plain text accounting system.

## Project Structure

```
.
├── api/                       # Python FastAPI backend
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── core/            # Core configuration
│   │   ├── models/          # Pydantic models
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── api/             # API routes
│   ├── requirements.txt
│   ├── start.sh
│   └── README.md
├── app/                       # React frontend
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   ├── components/      # Shared components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Library code
│   │   ├── routes/          # Route definitions
│   │   ├── store/          # State management
│   │   └── types/           # TypeScript types
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
├── scripts/                   # Utility scripts
│   ├── deploy.sh            # Deployment script
│   ├── setup.sh             # Setup script
│   └── clean.sh             # Clean script
├── docker-compose.yml         # Docker configuration
├── Makefile                   # Make commands
├── package.json               # Root scripts
└── README.md                  # This file
```

## Quick Start

### Using Makefile (Recommended)

```bash
# Install all dependencies
make install

# Start development servers
make dev

# Build for production
make build

# Run tests
make test

# Clean build artifacts
make clean
```

See all available commands:
```bash
make help
```

### Manual Setup

#### API Setup (Backend)

1. Navigate to api directory:
```bash
cd api
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

Or use the setup script:
```bash
./scripts/setup.sh
```

3. Start the API server:
```bash
uvicorn app.main:app --reload
```

Or use the startup script:
```bash
./start.sh
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/api/docs`

#### App Setup (Frontend)

1. Navigate to app directory:
```bash
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```bash
VITE_API_URL=http://localhost:8000/api
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make install` | Install all dependencies |
| `make install-prod` | Install production dependencies |
| `make clean` | Clean build artifacts |
| `make clean-all` | Clean everything including venv/node_modules |
| `make dev` | Start both API and app (local) |
| `make dev-api` | Start API only (local) |
| `make dev-app` | Start app only (local) |
| `make build` | Build both API and app |
| `make test` | Run all tests |
| `make lint` | Lint all code (ESLint + Python linters) |
| `make lint-api` | Lint API code (ruff, flake8, pylint) |
| `make lint-app` | Lint app code (ESLint + TypeScript) |
| `make format` | Format all code |
| `make format-api` | Format API code (black, isort, ruff) |
| `make format-app` | Format app code (Prettier) |
| `make docker-up` | Start Docker containers |
| `make docker-down` | Stop Docker containers |
| `make docker-build` | Build Docker images |
| `make docker-restart` | Restart Docker containers |
| `make docker-logs` | View Docker logs |
| `make nginx-test` | Test nginx configuration |
| `make setup` | Initial project setup |
| `make reset` | Reset project (clean and reinstall) |

## Deployment

### Using Scripts

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh prod
```

### Using Makefile

```bash
# Deploy to staging
make deploy-staging

# Deploy to production
make deploy-prod
```

## Docker

```bash
# Start all services (nginx, api, app)
make docker-up

# Stop services
make docker-down

# Rebuild and restart
make docker-restart

# View logs
make docker-logs

# Test nginx configuration
make nginx-test
```

Access the application at `http://localhost` (nginx routes to both API and app)

**Note**: For local development, start services directly:
- API: `cd api && ./start.sh` or `make dev-api`
- App: `cd app && npm run dev` or `make dev-app`

## Nginx Configuration

Nginx acts as a reverse proxy:
- **Frontend**: `http://localhost/` → Served by app or static files
- **API**: `http://localhost/api/*` → Proxied to API backend
- **Health**: `http://localhost/health` → API health check

See `nginx/README.md` for detailed configuration.

## Features

- **Dashboard**: Overview of finances with key metrics and visualizations
- **Transactions**: Full CRUD operations for managing transactions
- **Accounts**: Manage your chart of accounts (Assets, Liabilities, Equity, Income, Expenses)
- **Reports**: Generate balance sheets, income statements, and cash flow reports
- **Portfolio**: Track investments and holdings with gain/loss calculations
- **Budget**: Set budgets and track spending against them
- **Import/Export**: Import beancount files and export your data
- **Settings**: Configure currency, date formats, and other preferences

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
- **Pydantic** - Data validation

## Architecture

The project follows the [FastAPI full-stack template](https://github.com/fastapi/full-stack-fastapi-template) architecture:

- **Backend**: Modular structure with services, models, and API routes
- **Frontend**: Feature-based modules with reusable components and hooks
- **Separation of Concerns**: Clear separation between frontend and backend
- **Type Safety**: Full TypeScript and Pydantic support

## License

MIT
