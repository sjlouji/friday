# Development Guide

This guide covers setting up the development environment, understanding the project structure, and contributing to Friday.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Running Locally](#running-locally)
- [Development Workflow](#development-workflow)
- [Code Structure](#code-structure)
- [Testing](#testing)
- [Linting and Formatting](#linting-and-formatting)
- [Making Changes](#making-changes)
- [Contributing](#contributing)

## Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Python** 3.10+ and pip
- **Git**
- **Make** (optional, for using Makefile commands)

## Project Structure

```
friday/
├── api/                          # Python FastAPI backend
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── core/                # Core configuration
│   │   │   ├── config.py       # Settings and configuration (Pydantic)
│   │   │   ├── logging.py      # Logging setup
│   │   │   └── exceptions.py   # Custom exception definitions
│   │   ├── models/             # Pydantic models
│   │   │   └── schemas.py      # Request/Response validation models
│   │   ├── services/           # Business logic layer
│   │   │   ├── beancount_service.py
│   │   │   ├── transaction_service.py
│   │   │   ├── account_service.py
│   │   │   ├── file_service.py
│   │   │   ├── report_service.py
│   │   │   └── import_service.py
│   │   ├── utils/              # Utility functions
│   │   │   └── beancount_utils.py
│   │   └── api/                # API routes
│   │       ├── deps.py         # Dependency injection
│   │       └── v1/
│   │           ├── api.py       # Router aggregation
│   │           └── endpoints/  # Individual endpoint files
│   │               ├── transactions.py
│   │               ├── accounts.py
│   │               ├── files.py
│   │               ├── reports.py
│   │               ├── dashboard.py
│   │               ├── balances.py
│   │               ├── prices.py
│   │               └── import_export.py
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Docker image for API
│   ├── start.sh                # Development startup script
│   └── pyproject.toml          # Python tooling config (black, isort, ruff, mypy)
│
├── app/                         # React frontend
│   ├── src/
│   │   ├── App.tsx             # Main app component
│   │   ├── main.tsx            # Entry point
│   │   ├── index.css           # Global styles
│   │   ├── components/         # Shared components
│   │   │   ├── common/        # Reusable common components
│   │   │   ├── layout/        # Layout components (Layout.tsx)
│   │   │   └── modals/        # Shared modal components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Library code
│   │   │   ├── api.ts         # API client (centralized)
│   │   │   └── utils/         # Utility functions
│   │   │       ├── currency.ts
│   │   │       └── date.ts
│   │   ├── modules/            # Feature modules (organized by feature)
│   │   │   ├── transactions/
│   │   │   │   ├── pages/     # Transaction pages
│   │   │   │   ├── components/# Transaction-specific components
│   │   │   │   ├── hooks/     # Transaction hooks
│   │   │   │   ├── types/     # Transaction types
│   │   │   │   └── utils/     # Transaction utilities
│   │   │   ├── accounts/
│   │   │   ├── reports/
│   │   │   ├── dashboard/
│   │   │   ├── portfolio/
│   │   │   ├── budget/
│   │   │   ├── bills/
│   │   │   ├── goals/
│   │   │   ├── assets/
│   │   │   ├── debt/
│   │   │   ├── tax/
│   │   │   ├── import/
│   │   │   ├── settings/
│   │   │   └── recurring/
│   │   ├── routes/             # Route definitions
│   │   │   └── index.tsx
│   │   ├── store/              # State management (Zustand)
│   │   │   ├── beancountStore.ts
│   │   │   └── settingsStore.ts
│   │   └── types/              # Shared TypeScript types
│   │       └── beancount.ts
│   ├── package.json
│   ├── vite.config.ts          # Vite configuration
│   ├── tsconfig.json           # TypeScript configuration
│   ├── Dockerfile              # Development Docker image
│   └── Dockerfile.prod         # Production Docker image
│
├── scripts/                     # Utility scripts
│   ├── deploy.sh               # Deployment script
│   ├── setup.sh                # Initial setup script
│   └── nginx-test.sh           # Nginx config testing
│
├── nginx/                       # Nginx configuration
│   ├── nginx.conf              # Development config
│   └── nginx.conf              # Nginx configuration (dev & prod)
│
├── docker-compose.yml           # Docker Compose configuration
├── Makefile                     # Make commands for common tasks
├── package.json                 # Root package.json (scripts only)
└── README.md                    # Project overview
```

## Setup

### Quick Setup (Recommended)

Use the Makefile for easy setup:

```bash
# Install all dependencies
make install

# Or use the setup script
make setup
```

### Manual Setup

#### Backend Setup

1. Navigate to API directory:

```bash
cd api
```

2. Create virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Frontend Setup

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

## Running Locally

### Using Makefile

```bash
# Start both API and app
make dev

# Start API only
make dev-api

# Start app only
make dev-app
```

### Manual Start

#### Start API Server

```bash
cd api
source venv/bin/activate
./start.sh

# Or directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at `http://localhost:8000`  
API documentation at `http://localhost:8000/api/docs`

#### Start Frontend

```bash
cd app
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow the existing code structure
- Maintain type safety (TypeScript/Pydantic)
- Write clean, modular code
- Add comments where necessary

### 3. Test Your Changes

```bash
# Run tests
make test

# Lint code
make lint

# Format code
make format
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Structure

### Backend Architecture

The backend follows a modular architecture:

- **Core**: Configuration, logging, exceptions
- **Models**: Pydantic schemas for validation
- **Services**: Business logic (separated from API routes)
- **API**: Route handlers (thin layer, delegates to services)
- **Utils**: Shared utility functions

#### Adding a New Endpoint

1. Create service method in `app/services/`
2. Create Pydantic model in `app/models/schemas.py`
3. Create endpoint in `app/api/v1/endpoints/`
4. Register route in `app/api/v1/api.py`

#### Example: Adding a New Feature

```python
# 1. Service (app/services/my_service.py)
def get_my_data(file_path: str):
    # Business logic here
    pass

# 2. Schema (app/models/schemas.py)
class MyDataResponse(BaseModel):
    data: str

# 3. Endpoint (app/api/v1/endpoints/my_feature.py)
@router.get("/my-feature", response_model=MyDataResponse)
def get_my_feature(file_path: str = Depends(get_file_path)):
    return my_service.get_my_data(file_path)
```

### Frontend Architecture

The frontend uses a feature-based module structure:

- **Modules**: Each feature has its own module
- **Components**: Shared and module-specific components
- **Hooks**: Reusable React hooks
- **Store**: Global state management (Zustand)
- **Lib**: API client and utilities

#### Module Structure

Each module follows this structure:

```
module-name/
├── pages/          # Page components
├── components/     # Module-specific components
├── hooks/         # Module-specific hooks
├── types/         # TypeScript types
└── utils/         # Module utilities
```

#### Adding a New Feature Module

1. Create module directory in `app/src/modules/`
2. Create page component in `pages/`
3. Add route in `app/src/routes/index.tsx`
4. Create components, hooks, types as needed

#### Example: Adding a New Module

```typescript
// 1. Create module structure
app/src/modules/my-feature/
  ├── pages/
  │   └── MyFeature.tsx
  ├── components/
  ├── hooks/
  ├── types/
  └── utils/

// 2. Add route (app/src/routes/index.tsx)
{
  path: "/my-feature",
  element: <MyFeature />
}
```

## Testing

### Backend Testing

```bash
# Run API tests
make test-api

# Or manually
cd api
source venv/bin/activate
pytest
```

### Frontend Testing

```bash
# Run app tests
make test-app

# Or manually
cd app
npm test
```

## Linting and Formatting

### Backend

```bash
# Lint
make lint-api

# Format
make format-api
```

Tools used:
- **Black**: Code formatting
- **isort**: Import sorting
- **Ruff**: Fast linting
- **Flake8**: Style guide enforcement
- **Pylint**: Code analysis
- **Mypy**: Type checking

### Frontend

```bash
# Lint
make lint-app

# Format
make format-app
```

Tools used:
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

## Making Changes

### Code Style

- Follow existing code patterns
- Use TypeScript types (frontend) and Pydantic models (backend)
- Keep functions small and focused
- Use meaningful variable names
- Add docstrings for complex functions

### Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Example:
```
feat: add budget tracking module
fix: resolve transaction date parsing issue
docs: update API documentation
```

## Contributing

### Before Submitting

1. **Run tests**: `make test`
2. **Lint code**: `make lint`
3. **Format code**: `make format`
4. **Check types**: `make lint` (includes type checking)
5. **Update documentation** if needed

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass
5. Submit a Pull Request with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots (if UI changes)

### Code Review

- All PRs require review
- Address review comments promptly
- Keep PRs focused and small when possible
- Update documentation for user-facing changes

## Common Tasks

### View All Make Commands

```bash
make help
```

### Clean Build Artifacts

```bash
make clean
```

### Reset Project

```bash
make reset  # Cleans everything and reinstalls
```

### Build for Production

```bash
make build
```

## Troubleshooting

### API Not Starting

- Check Python version: `python3 --version` (need 3.10+)
- Verify virtual environment is activated
- Check if port 8000 is available
- Review API logs for errors

### Frontend Not Starting

- Check Node.js version: `node --version` (need 18+)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check for port conflicts (5173)

### Import Errors

- Ensure virtual environment is activated (backend)
- Verify all dependencies are installed
- Check Python path and Node.js path

## Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/
- **Beancount Docs**: https://beancount.github.io/docs/
- **TypeScript Docs**: https://www.typescriptlang.org/docs/

## Getting Help

- Open an issue: [https://github.com/sjlouji/friday/issues](https://github.com/sjlouji/friday/issues)
- Check existing issues and discussions
- Review code comments and documentation

