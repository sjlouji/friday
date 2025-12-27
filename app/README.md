# Friday App

Modern React frontend for Beancount accounting application.

## Structure

```
app/src/
├── App.tsx                    # Main app component
├── main.tsx                   # Entry point
├── index.css                  # Global styles
├── components/                # Shared components
│   ├── common/               # Reusable common components
│   ├── layout/               # Layout components
│   └── modals/               # Shared modal components
├── hooks/                     # Custom React hooks
├── lib/                       # Library code
│   ├── api.ts                # API client
│   └── utils/                # Utility functions
│       ├── currency.ts
│       └── date.ts
├── modules/                   # Feature modules
│   ├── transactions/
│   │   ├── pages/           # Transaction pages
│   │   ├── components/      # Transaction-specific components
│   │   ├── hooks/           # Transaction hooks
│   │   ├── types/           # Transaction types
│   │   └── utils/           # Transaction utilities
│   ├── accounts/
│   ├── reports/
│   ├── dashboard/
│   ├── portfolio/
│   ├── budget/
│   ├── bills/
│   ├── goals/
│   ├── assets/
│   ├── debt/
│   ├── tax/
│   ├── import/
│   ├── settings/
│   └── recurring/
├── routes/                    # Route definitions
│   └── index.tsx
├── store/                     # State management (Zustand)
│   ├── beancountStore.ts
│   └── settingsStore.ts
└── types/                     # Shared TypeScript types
    └── beancount.ts
```

## Module Structure

Each module follows a consistent structure:

- **pages/**: Page components for the module
- **components/**: Module-specific components
- **hooks/**: Custom hooks for the module
- **types/**: TypeScript types for the module
- **utils/**: Utility functions for the module

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Features

- **Modular Architecture**: Each feature is organized in its own module
- **Reusable Components**: Shared components in `components/`
- **Custom Hooks**: Reusable hooks in `hooks/`
- **Type Safety**: Full TypeScript support
- **State Management**: Zustand for global state
- **API Client**: Centralized API client in `lib/api.ts`
- **Utilities**: Shared utilities for currency, dates, etc.

