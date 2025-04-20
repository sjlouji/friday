# friday/Makefile

# Variables
LERNA = npx lerna
SERVICE_NAME = friday
PACKAGES_DIR = packages
AUTH_SERVICE_DIR = auth-service

# Bootstrap the entire repo
# This will clean existing dependencies and install fresh ones
# Usage: make bootstrap
.PHONY: bootstrap
bootstrap:
	@echo "🚀 Bootstrapping friday..."
	@make clean
	@make install
	@echo "✅ Repo bootstrapped successfully"

# Install all dependencies after cleaning
# This is useful when you want to start fresh
# Usage: make install
.PHONY: install
install:
	@echo "🔄 Refreshing dependencies..."
	@make clean
	@make install-deps

# Install dependencies without cleaning
# Useful for adding new dependencies
# Usage: make install-deps
.PHONY: install-deps
install-deps:
	@echo "📦 Installing dependencies..."
	yarn install
	$(LERNA) bootstrap --hoist
	@echo "✅ Dependencies installed"

# Clean all build artifacts and dependencies
# Removes node_modules, lock files, and build outputs
# Usage: make clean
.PHONY: clean
clean:
	@echo "🧹 Cleaning build artifacts..."
	$(LERNA) clean -y --yes
	$(LERNA) run clean
	@echo "🧹 Cleaning root level..."
	rm -rf node_modules
	rm -f yarn.lock
	rm -f package-lock.json
	rm -f pnpm-lock.yaml
	@echo "🧹 Cleaning all services and packages..."
	find . -type d -name "node_modules" -exec rm -rf {} +
	find . -type d -name "dist" -exec rm -rf {} +
	find . -type d -name "build" -exec rm -rf {} +
	find . -type d -name ".next" -exec rm -rf {} +
	find . -type f -name "yarn.lock" -delete
	find . -type f -name "package-lock.json" -delete
	find . -type f -name "pnpm-lock.yaml" -delete
	find . -type f -name "*.lock" -delete
	@echo "✅ All builds and lock files cleaned"

# Build all services
# Currently builds auth service, expandable for more services
# Usage: make build
.PHONY: build
build: auth-build
	@echo "✅ $(SERVICE_NAME) built completely"

# Build auth service specifically
# Executes the build command in auth service directory
# Usage: make auth-build
.PHONY: auth-build
auth-build:
	@echo "🏗️  Building auth service..."
	@cd $(AUTH_SERVICE_DIR) && make build

# Run all tests across the monorepo
# Currently runs auth service tests, expandable for more services
# Usage: make test
.PHONY: test
test: auth-test
	@echo "✅ $(SERVICE_NAME) test cases completed"

# Run auth service tests specifically
# Usage: make auth-test
.PHONY: auth-test
auth-test:
	@echo "🧪 Testing auth service..."
	@cd $(AUTH_SERVICE_DIR) && make test

# Create a new shared package
# Sets up TypeScript package with Jest testing
# Usage: make new-package
# Prompt: Enter package name when asked
.PHONY: new-package
new-package:
	@read -p "Enter package name: " name; \
	mkdir -p $(PACKAGES_DIR)/$$name; \
	cd $(PACKAGES_DIR)/$$name; \
	yarn init -y; \
	yarn add -D typescript @types/node ts-node-dev; \
	npx tsc --init --declaration --rootDir src --outDir dist --esModuleInterop --resolveJsonModule --lib es6 --module commonjs --allowJs true --noImplicitAny true; \
	mkdir src; \
	touch src/index.ts; \
	npx ts-jest config:init; \
	sed -i '' 's/"name": ".*"/"name": "@friday\/'"$$name"'"/' package.json; \
	sed -i '' 's/"author": ".*"/"author": "sjlouji10@gmail.com"/' package.json; \
	echo "✅ Created new package: $$name using standard templates"

# Create root .gitignore for monorepo
.PHONY: init-gitignore
init-gitignore:
	@echo "Creating .gitignore for monorepo..."
	@echo "# Dependencies\n\
node_modules\n\
.pnp\n\
.pnp.js\n\
\n\
# Testing\n\
coverage\n\
\n\
# Production\n\
build\n\
dist\n\
.next\n\
out\n\
\n\
# Misc\n\
.DS_Store\n\
*.pem\n\
\n\
# Debug\n\
npm-debug.log*\n\
yarn-debug.log*\n\
yarn-error.log*\n\
\n\
# Local env files\n\
.env\n\
.env.local\n\
.env.development.local\n\
.env.test.local\n\
.env.production.local\n\
\n\
# Lock files\n\
package-lock.json\n\
yarn.lock\n\
pnpm-lock.yaml\n\
\n\
# TypeScript\n\
*.tsbuildinfo\n\
\n\
# Logs\n\
logs\n\
*.log\n\
\n\
# IDE\n\
.idea\n\
.vscode\n\
*.suo\n\
*.ntvs*\n\
*.njsproj\n\
*.sln\n\
*.sw?\n\
\n\
# Monorepo specific\n\
.turbo\n\
.cache\n\
.env.*\n\
!.env.example\n\
\n\
# Service specific\n\
services/**/dist\n\
services/**/.next\n\
services/**/build\n\
\n\
# Package specific\n\
packages/**/dist\n\
packages/**/build\n\
" > .gitignore

# Display help information
# Shows all available commands with descriptions
# Also includes service-specific commands if available
# Usage: make help
.PHONY: help
help:
	@echo "Friday Monorepo Commands:"
	@echo "  # Setup Commands"
	@echo "  make bootstrap      - Bootstrap the monorepo"
	@echo "  make install        - Clean and install all dependencies"
	@echo "  make install-deps   - Install dependencies without cleaning"
	@echo "  make clean          - Clean all build artifacts and dependencies"
	@echo ""
	@echo "  # Build Commands"
	@echo "  make build          - Build all services"
	@echo "  make auth-build     - Build auth service"
	@echo ""
	@echo "  # Test Commands"
	@echo "  make test           - Run all tests"
	@echo "  make auth-test      - Run auth service tests"
	@echo ""
	@echo "  # Creation Commands"
	@echo "  make new-package    - Create a new shared package with TypeScript and Jest"
	@echo "  init-gitignore     - Initialize .gitignore for the monorepo"
	@echo ""
	@echo "  make help           - Display this help information"
	@echo ""
	@if [ -f "$(AUTH_SERVICE_DIR)/Makefile" ]; then \
		echo ""; \
		echo "Auth Service Commands:"; \
		cd $(AUTH_SERVICE_DIR) && make help | sed 's/^/  /'; \
	fi