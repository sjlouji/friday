# Setup Guide

This guide will help you set up Friday on your local machine for development or personal use.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.10 or higher) - [Download](https://www.python.org/downloads/)
- **Docker** and **Docker Compose** (optional, for containerized setup) - [Download](https://www.docker.com/)
- **Git** - [Download](https://git-scm.com/downloads)

## Quick Start

### Option 1: Using Make (Recommended)

The easiest way to set up Friday is using the provided Makefile:

```bash
# Clone the repository
git clone https://github.com/sjlouji/friday.git
cd friday

# Run setup script
make setup

# Start development servers
make dev
```

This will:
- Install all dependencies (frontend and backend)
- Set up Python virtual environment
- Start both frontend (port 5173) and backend (port 8000) development servers

### Option 2: Manual Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/sjlouji/friday.git
cd friday
```

#### 2. Backend Setup

```bash
# Navigate to API directory
cd api

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

#### 3. Frontend Setup

```bash
# Navigate to app directory (from project root)
cd app

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### 4. Using Docker Compose (Alternative)

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f
```

This will start:
- Frontend at `http://localhost:5173`
- Backend API at `http://localhost:8000`
- Nginx reverse proxy at `http://localhost:80`

## Configuration

### Environment Variables

Create a `.env` file in the `api/` directory (optional):

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Beancount Configuration
BEANCOUNT_FILE_PATH=~/Documents/ledger.beancount
```

### Beancount File Setup

1. Create a Beancount ledger file (e.g., `ledger.beancount`)
2. Add it to Settings in the Friday UI, or set the path in environment variables
3. Example Beancount file structure:

```beancount
; Example ledger.beancount

2024-01-01 open Assets:Bank:Checking
2024-01-01 open Assets:Bank:Savings
2024-01-01 open Expenses:Food
2024-01-01 open Expenses:Transport
2024-01-01 open Income:Salary

2024-01-15 * "Salary"
  Income:Salary          -5000 USD
  Assets:Bank:Checking    5000 USD

2024-01-20 * "Grocery Shopping"
  Expenses:Food            150 USD
  Assets:Bank:Checking     -150 USD
```

## Development Workflow

### Running Tests

```bash
# Backend tests
cd api
pytest

# Frontend tests
cd app
npm test
```

### Linting and Formatting

```bash
# From project root
make lint      # Run linters
make format    # Format code
```

### Building for Production

```bash
# Build frontend
cd app
npm run build

# Build Docker images
docker-compose build
```

## Troubleshooting

### Common Issues

#### Port Already in Use

If port 8000 or 5173 is already in use:

```bash
# Backend - specify different port
cd api
uvicorn app.main:app --reload --port 8001

# Frontend - edit vite.config.ts
# Change port in server configuration
```

#### Python Virtual Environment Issues

```bash
# Remove and recreate venv
cd api
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Node Modules Issues

```bash
# Clear and reinstall
cd app
rm -rf node_modules package-lock.json
npm install
```

#### Docker Issues

```bash
# Clean up Docker containers and volumes
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Getting Help

- Check [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development guidelines
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions
- Open an issue on [GitHub](https://github.com/sjlouji/friday/issues)
- Review the [README.md](./README.md) for project overview

## Next Steps

After setup:

1. **Configure Settings**: Go to Settings in the UI to configure:
   - Beancount file path
   - Currency and date formats
   - Theme and localization preferences

2. **Import Data**: Use the Import feature to bring in existing financial data

3. **Create Accounts**: Set up your chart of accounts

4. **Start Tracking**: Begin adding transactions and managing your finances

## Additional Resources

- [Beancount Documentation](https://beancount.github.io/docs/)
- [Cloudscape Design System](https://cloudscape.design/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)

## Support

For questions or issues:
- GitHub Issues: https://github.com/sjlouji/friday/issues
- Email: sjlouji10@gmail.com

Happy accounting! 📊

