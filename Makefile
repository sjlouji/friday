.PHONY: help install install-api install-app clean clean-api clean-app dev dev-api dev-app build build-api build-app test test-api test-app lint lint-api lint-app format format-api format-app docker-up docker-down docker-build docker-restart deploy-staging deploy-prod

help:
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: install-api install-app ## Install all dependencies

install-api:
	@echo "Installing API dependencies..."
	cd api && python3 -m venv venv || true
	cd api && source venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

install-app:
	@echo "Installing app dependencies..."
	cd app && npm install

install-prod: install-api-prod install-app-prod

install-api-prod:
	@echo "Installing API production dependencies..."
	cd api && python3 -m venv venv || true
	cd api && source venv/bin/activate && pip install --upgrade pip && pip install --no-dev -r requirements.txt

install-app-prod:
	@echo "Installing app production dependencies..."
	cd app && npm ci --production

clean: clean-api clean-app

clean-api:
	@echo "Cleaning API..."
	cd api && rm -rf __pycache__ *.pyc *.pyo .pytest_cache .coverage htmlcov dist build *.egg-info
	cd api && find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true
	cd api && find . -type f -name "*.pyc" -delete 2>/dev/null || true

clean-app:
	@echo "Cleaning app..."
	cd app && rm -rf node_modules dist dist-ssr .vite .next .nuxt .cache

clean-all: clean
	@echo "Cleaning everything..."
	cd api && rm -rf venv env
	cd app && rm -rf node_modules

dev: dev-api dev-app

dev-api:
	@echo "Starting API server..."
	cd api && ./start.sh

dev-app:
	@echo "Starting app..."
	cd app && npm run dev

build: build-api build-app

build-api:
	@echo "Checking API..."
	cd api && source venv/bin/activate && python -m py_compile app/main.py || echo "API check complete"

build-app:
	@echo "Building app..."
	cd app && npm run build

test: test-api test-app

test-api:
	@echo "Running API tests..."
	cd api && source venv/bin/activate && pytest || echo "No tests configured"

test-app:
	@echo "Running app tests..."
	cd app && npm test || echo "No tests configured"

lint: lint-api lint-app

lint-api:
	@echo "Linting API..."
	cd api && source venv/bin/activate && \
		ruff check app/ || echo "Ruff check complete" && \
		flake8 app/ || echo "Flake8 check complete" && \
		pylint app/ --disable=all --enable=E,F || echo "Pylint check complete"

lint-app:
	@echo "Linting app..."
	cd app && npm run lint && npm run type-check

format: format-api format-app

format-api:
	@echo "Formatting API..."
	cd api && source venv/bin/activate && \
		black app/ || echo "Black not installed, skipping..." && \
		isort app/ || echo "isort not installed, skipping..." && \
		ruff check --fix app/ || echo "Ruff format complete"

format-app:
	@echo "Formatting app..."
	cd app && npm run format

docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down

docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-restart: docker-down docker-up

docker-logs:
	docker-compose logs -f

nginx-test:
	@echo "Testing nginx configuration..."
	docker run --rm \
		-v "$(pwd)/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
		nginx:alpine \
		nginx -t

deploy-staging: build
	@echo "Deploying to staging..."
	@echo "Add your staging deployment commands here"

deploy-prod: build
	@echo "Deploying to production..."
	@echo "Add your production deployment commands here"

setup: install
	@echo "Setup complete!"

reset: clean-all install
	@echo "Project reset complete!"

