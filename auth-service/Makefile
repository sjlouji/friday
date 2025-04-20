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
	@echo "  # Test commands"
	@echo "  make test-service    - Test only service"
