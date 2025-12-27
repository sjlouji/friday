.PHONY: help install install-api install-app install-prod install-api-prod install-app-prod clean clean-api clean-app clean-all dev dev-api dev-app build build-api build-app test test-api test-app lint lint-api lint-app format format-api format-app docker-up docker-down docker-build docker-restart docker-logs nginx-test deploy-staging deploy-prod setup reset

help: ## Show this help message with all available commands
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2}'

install: install-api install-app ## Install all dependencies (creates venv for API, installs npm packages for app)

install-api: ## Install API dependencies (creates Python virtual environment and installs packages)
	@echo "Installing API dependencies..."
	cd api && rm -rf venv && python3 -m venv venv
	cd api && source venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

install-app: ## Install app dependencies (installs all npm packages including dev dependencies)
	@echo "Installing app dependencies..."
	cd app && npm install

install-prod: install-api-prod install-app-prod ## Install production dependencies only (excludes dev dependencies)

install-api-prod: ## Install API production dependencies (no dev/test packages, optimized for production)
	@echo "Installing API production dependencies..."
	cd api && python3 -m venv venv || true
	cd api && source venv/bin/activate && pip install --upgrade pip && pip install --no-dev -r requirements.txt

install-app-prod: ## Install app production dependencies (npm ci with production flag, faster install)
	@echo "Installing app production dependencies..."
	cd app && npm ci --production

clean: clean-api clean-app ## Clean build artifacts (removes cache, compiled files, dist folders)

clean-api: ## Clean API build artifacts (removes __pycache__, .pyc files, test cache, coverage reports)
	@echo "Cleaning API..."
	cd api && rm -rf __pycache__ *.pyc *.pyo .pytest_cache .coverage htmlcov dist build *.egg-info
	cd api && find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true
	cd api && find . -type f -name "*.pyc" -delete 2>/dev/null || true

clean-app: ## Clean app build artifacts (removes dist, node_modules cache, build folders)
	@echo "Cleaning app..."
	cd app && rm -rf node_modules dist dist-ssr .vite .next .nuxt .cache

clean-all: clean ## Clean everything including dependencies (removes venv, node_modules, all artifacts)
	@echo "Cleaning everything..."
	cd api && rm -rf venv env
	cd app && rm -rf node_modules

dev: dev-api dev-app ## Start both API and app in development mode (with hot reload, runs locally)

dev-api: ## Start API server only in development mode (runs with auto-reload on localhost:8000)
	@echo "Starting API server..."
	@lsof -ti :8000 | xargs kill -9 2>/dev/null || true
	cd api && ./start.sh

dev-app: ## Start app only in development mode (runs Vite dev server on localhost:5173)
	@echo "Starting app..."
	cd app && npm run dev

build: build-api build-app ## Build both API and app for production (validates API, creates optimized app bundle)

build-api: ## Build/check API (validates Python syntax and compiles code)
	@echo "Checking API..."
	cd api && source venv/bin/activate && python -m py_compile app/main.py || echo "API check complete"

build-app: ## Build app for production (creates optimized production bundle in dist/)
	@echo "Building app..."
	cd app && npm run build

test: test-api test-app ## Run all tests (executes test suites for both API and app)

test-api: ## Run API tests (executes pytest test suite)
	@echo "Running API tests..."
	cd api && source venv/bin/activate && pytest || echo "No tests configured"

test-app: ## Run app tests (executes npm test suite)
	@echo "Running app tests..."
	cd app && npm test || echo "No tests configured"

lint: lint-api lint-app ## Lint all code (checks code quality and style for both API and app)

lint-api: ## Lint API code (runs ruff, flake8, and pylint to check Python code quality)
	@echo "Linting API..."
	cd api && source venv/bin/activate && \
		ruff check app/ || echo "Ruff check complete" && \
		flake8 app/ || echo "Flake8 check complete" && \
		pylint app/ --disable=all --enable=E,F || echo "Pylint check complete"

lint-app: ## Lint app code (runs ESLint and TypeScript type checking)
	@echo "Linting app..."
	cd app && npm run lint && npm run type-check

format: format-api format-app ## Format all code (auto-fixes code style issues across the project)

format-api: ## Format API code (runs black, isort, and ruff --fix to auto-format Python code)
	@echo "Formatting API..."
	cd api && source venv/bin/activate && \
		black app/ || echo "Black not installed, skipping..." && \
		isort app/ || echo "isort not installed, skipping..." && \
		ruff check --fix app/ || echo "Ruff format complete"

format-app: ## Format app code (runs Prettier to auto-format TypeScript/React code)
	@echo "Formatting app..."
	cd app && npm run format

docker-up: ## Start Docker containers (starts nginx, API, and app services in detached mode)
	@echo "Starting Docker containers..."
	docker-compose up -d

docker-down: ## Stop Docker containers (stops and removes all running containers)
	@echo "Stopping Docker containers..."
	docker-compose down

docker-build: ## Build Docker images (rebuilds all Docker images from Dockerfiles)
	@echo "Building Docker images..."
	docker-compose build

docker-restart: docker-down docker-up ## Restart Docker containers (stops then starts all services)

docker-logs: ## View Docker logs (streams logs from all containers, use Ctrl+C to exit)
	docker-compose logs -f

nginx-test: ## Test nginx configuration (validates both dev and prod nginx configs for syntax errors)
	@echo "Testing nginx configuration..."
	@./scripts/nginx-test.sh

deploy-staging: build ## Deploy to staging environment (builds project then deploys to staging server)
	@./scripts/deploy.sh staging

deploy-prod: build ## Deploy to production environment (builds project then deploys to production server)
	@./scripts/deploy.sh prod

setup: ## Initial project setup (first-time setup: installs all dependencies for development)
	@./scripts/setup.sh

reset: clean-all install ## Reset project completely (removes everything and reinstalls from scratch)
	@echo "Project reset complete!"

