# Friday

A modern, comprehensive personal accounting and bookkeeping software solution built on Beancount plain text accounting system.

## Overview

Friday is a full-stack web application designed to simplify personal financial management through an intuitive interface built on top of the powerful Beancount accounting system. It provides a complete solution for tracking transactions, managing accounts, generating financial reports, and maintaining accurate financial records.

## Scope

Friday is designed for individuals and small businesses who want:

- **Double-entry bookkeeping** with automatic balance verification
- **Comprehensive financial tracking** including transactions, accounts, assets, liabilities, and investments
- **Financial reporting** with balance sheets, income statements, and cash flow analysis
- **Budget management** and spending tracking
- **Portfolio tracking** with investment gain/loss calculations
- **Tax planning** support for income tax and GST tracking
- **Data import/export** capabilities for seamless integration with existing financial data
- **Modern web interface** accessible from any device

## Features

| Feature                    | Description                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------- |
| **Dashboard**              | Overview of finances with key metrics, visualizations, and quick insights             |
| **Transactions**           | Full CRUD operations for managing financial transactions with double-entry support    |
| **Accounts**               | Complete chart of accounts management (Assets, Liabilities, Equity, Income, Expenses) |
| **Reports**                | Generate balance sheets, income statements, and cash flow reports                     |
| **Portfolio**              | Track investments and holdings with automatic gain/loss calculations                  |
| **Budget**                 | Set budgets for expense categories and monitor spending against targets               |
| **Bills**                  | Manage recurring bills and payment reminders                                          |
| **Goals**                  | Track savings goals and debt payoff plans                                             |
| **Assets**                 | Track and manage physical and digital assets                                          |
| **Debt**                   | Monitor and manage debts and liabilities                                              |
| **Tax**                    | Track income tax deductions, GST, and income for tax planning (ITR)                   |
| **Recurring Transactions** | Set up and manage recurring transactions and templates                                |
| **Import/Export**          | Import beancount files, CSV, OFX, QIF formats and export your data                    |
| **Settings**               | Configure currency, date formats, fiscal year, localization, and UI preferences       |

## Tech Stack

### Frontend

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Cloudscape Design System** - AWS design system components
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Recharts** - Data visualization library

### Backend

- **FastAPI** - High-performance Python web framework
- **Beancount** - Plain text accounting library
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation and settings management

## Quick Links

- **Development Guide**: See [DEVELOPMENT.md](DEVELOPMENT.md) for setup and development instructions
- **Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions
- **Repository**: [https://github.com/sjlouji/friday.git](https://github.com/sjlouji/friday.git)
- **Issues**: [https://github.com/sjlouji/friday/issues](https://github.com/sjlouji/friday/issues)

## Contributing

We welcome contributions! Please see [DEVELOPMENT.md](DEVELOPMENT.md) for detailed contribution guidelines, code structure, and development setup.

## Issues

Found a bug or have a feature request? Please open an issue at [https://github.com/sjlouji/friday/issues](https://github.com/sjlouji/friday/issues)

## Repository

[https://github.com/sjlouji/friday.git](https://github.com/sjlouji/friday.git)

## Author

Joan Louji <sjlouji10@gmail.com>

## License

MIT
