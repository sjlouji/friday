# Friday: AI-First Chat-Based Personal Finance App

## Overview

Friday is an AI-powered personal finance management system designed to provide a chat-driven interface for managing your finances. It leverages double-entry accounting (Beancount) and AI capabilities to offer insights, categorization, and automation for your financial data. We are planning to create an agentic AI to use Beancount as a chat API, enhancing the interaction and automation of financial management.

## Features

- **Chat-Driven Interface**: Interact with your finances through a conversational interface.
- **Double-Entry Accounting**: Utilizes Beancount for accurate financial tracking.
- **AI-Powered Insights**: Get intelligent insights and automated categorization of your transactions.
- **Multi-Currency Support**: Manage finances across different currencies.
- **Budgeting and Investments**: Track budgets and manage investments seamlessly.
- **Tax Management**: Simplify tax-related financial management.

## Tech Stack

- **Backend**: FastAPI
- **Database**: PostgreSQL
- **AI/ML Tools**: LangChain, Mistral, OpenAI, Transformers, scikit-learn
- **Vector Database**: Pinecone
- **Authentication**: JWT (python-jose, passlib)
- **Testing**: pytest
- **Code Quality**: black, isort, mypy
- **Database Migrations**: Alembic
- **Logging**: loguru, asgi-correlation-id

## Setup

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd friday
   ```

2. **Create a Virtual Environment**:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**:

   - Create a `.env` file in the project root with the following variables:
     ```
     ENVIRONMENT=development
     PORT=8000
     ```

5. **Run the Application**:
   ```bash
   python app/main.py
   ```

## Usage

- Access the API at `http://127.0.0.1:8000/api/v1`.
- Use the chat endpoint to interact with the system: `POST /api/v1/chat`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
