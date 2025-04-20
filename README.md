# Friday 🤖

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-green)](https://expressjs.com/)
[![Lerna](https://img.shields.io/badge/Lerna-7.1.5-purple)](https://lerna.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## Your AI-powered Personal Life Assistant

Friday is an intelligent personal assistant designed to simplify the management of your family's daily life. Leveraging AI capabilities, Friday helps you track finances, maintain schedules, monitor health routines, manage tasks, and stay on top of important events and subscriptions.

## 🚀 Development Roadmap

Friday is being developed in five distinct phases:

### 🔍 Current Phase: Finance Management (Phase 1)
- Building core finance tracking features
- Setting up monorepo architecture
- Establishing foundational UI components

### 📋 Upcoming Phases:
- **Phase 2:** Authentication System (Passkey and Email)
- **Phase 3:** Workout and Health Routines
- **Phase 4:** Calendar Management and Subscription Tracking
- **Phase 5:** Event Planning and Todo Management

## ✨ Features

### Finance Management (Phase 1)
- **Income Tracking:** Monitor multiple income streams with detailed categorization
- **Expense Tracking:** Track and categorize all expenses with receipt scanning
- **Budgeting:** Create customizable budgets with real-time monitoring
- **Financial Goals:** Set, track, and achieve savings targets
- **Savings Analysis:** Visualize saving patterns with actionable insights
- **Financial Analytics:** Get AI-powered insights on spending habits and opportunities
- **Asset Tracking:** Monitor investments, property, and other assets
- **Liability Tracking:** Track loans, mortgages, and other debts

### Future Features (Phases 2-5)
- **Secure Authentication:** Passwordless login with passkeys and email verification
- **Workout Tracking:** Create, monitor, and optimize exercise routines
- **Calendar Integration:** Sync events across multiple calendars
- **Subscription Management:** Track recurring payments and renewal dates
- **Event Planning:** Coordinate family events and gatherings
- **Todo Management:** Create and assign tasks with smart reminders

## 🛠️ Tech Stack

### Frontend
- **React:** Component-based UI library for building interactive interfaces
- **TypeScript:** Type-safe JavaScript for better developer experience
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development
- **shadcn/ui:** Accessible component system with a beautiful design language
- **Vite:** Next generation frontend tooling for faster development

### Backend
- **Node.js:** JavaScript runtime for building server-side applications
- **Express:** Minimal web framework for building APIs
- **TypeScript:** Type-safe JavaScript for robust server code

### Database (Planned)
- **PostgreSQL:** Powerful, open-source relational database
- **Prisma:** Next-generation ORM for Node.js and TypeScript

### DevOps & Infrastructure
- **Lerna:** Tool for managing JavaScript monorepos
- **Yarn:** Fast, reliable, and secure dependency management
- **Jest:** Delightful JavaScript testing framework
- **GitHub Actions:** CI/CD automation

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- Yarn package manager
- Git

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/friday.git
   cd friday
   ```

2. **Install dependencies**
   ```bash
   make bootstrap
   ```

3. **Start the development environment**
   ```bash
   # Start both frontend and backend
   cd auth-service && make dev
   
   # Or start them individually
   cd auth-service && make dev-frontend
   cd auth-service && make dev-service
   ```

4. **Build for production**
   ```bash
   make build
   ```

### Project Structure
```
friday/
├── packages/            # Shared libraries and components
├── auth-service/        # Authentication service
│   ├── frontend/        # React frontend
│   └── service/         # Express backend
├── README.md            # This file
└── Makefile             # Build automation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure your code follows the existing style and includes appropriate tests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Built with ❤️ by Joan Louji