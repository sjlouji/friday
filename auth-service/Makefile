SERVICE_NAME = auth-service
FRONTEND_DIR = frontend
SERVICE_DIR = service

.PHONY: build-frontend
build-frontend:
	@echo "🏗️  Building $(SERVICE_NAME) frontend..."
	cd $(FRONTEND_DIR) && yarn build
	@echo "✅ Frontend built"

.PHONY: build-service
build-service:
	@echo "🏗️  Building $(SERVICE_NAME) service..."
	cd $(SERVICE_DIR) && yarn build
	@echo "✅ Service built"

.PHONY: build
build: build-service build-frontend
	@echo "✅ $(SERVICE_NAME) built completely"

.PHONY: dev-frontend
dev-frontend:
	@echo "🚀 Starting $(SERVICE_NAME) frontend in development mode..."
	cd $(FRONTEND_DIR) && yarn dev

.PHONY: dev-service
dev-service:
	@echo "🚀 Starting $(SERVICE_NAME) service in development mode..."
	cd $(SERVICE_DIR) && yarn dev

.PHONY: clean-frontend
clean-frontend:
	@echo "🧹 Cleaning frontend build artifacts..."
	cd $(FRONTEND_DIR) && yarn clean
	@echo "✅ Frontend cleaned"

.PHONY: clean-service
clean-service:
	@echo "🧹 Cleaning service build artifacts..."
	cd $(SERVICE_DIR) && rm -rf dist node_modules
	@echo "✅ Service cleaned"

.PHONY: clean
clean: clean-frontend clean-service
	@echo "✅ All build artifacts cleaned"

.PHONY: test-service
test-service:
	@echo "🧪 Testing service..."
	cd $(SERVICE_DIR) && yarn test
	@echo "✅ All tests completed"


.PHONY: help
help:
	@echo "$(SERVICE_NAME) commands:"
	@echo "  # Build commands"
	@echo "  make build           - Build both service and frontend"
	@echo "  make build-service   - Build only service"
	@echo "  make build-frontend  - Build only frontend"
	@echo "  # Development commands"
	@echo "  make dev-service     - Start the backend service in dev mode"
	@echo "  make dev-frontend    - Start the frontend in dev mode"
	@echo "  # Clean commands"
	@echo "  make clean           - Clean all build artifacts"
	@echo "  make clean-frontend  - Clean frontend build artifacts"
	@echo "  make clean-service   - Clean service build artifacts"
	@echo "  # Test commands"
	@echo "  make test-service    - Test only service"
