export interface Transaction {
  id: string;
  date: string;
  flag: string;
  payee: string;
  narration: string;
  postings: Posting[];
  metadata?: Record<string, string>;
}

export interface Posting {
  account: string;
  amount: Amount | null;
  cost?: Cost;
  price?: Price;
  metadata?: Record<string, string>;
}

export interface Amount {
  number: string;
  currency: string;
}

export interface Cost {
  number: string;
  currency: string;
  date?: string;
  label?: string;
}

export interface Price {
  number: string;
  currency: string;
  date?: string;
}

export interface Account {
  name: string;
  type: AccountType;
  openDate: string;
  closeDate?: string;
  metadata?: Record<string, string>;
}

export type AccountType =
  | "Assets"
  | "Liabilities"
  | "Equity"
  | "Income"
  | "Expenses";

export interface Balance {
  account: string;
  date: string;
  amount: Amount;
}

export interface PriceEntry {
  date: string;
  currency: string;
  amount: Amount;
}

export interface Budget {
  account: string;
  period: string;
  amount: Amount;
}

export interface Portfolio {
  account: string;
  positions: Position[];
  totalValue: Amount;
}

export interface Position {
  commodity: string;
  quantity: string;
  cost: Amount;
  value: Amount;
}

export interface Report {
  type: "balance-sheet" | "income-statement" | "cash-flow" | "portfolio";
  period: {
    start: string;
    end: string;
  };
  data: any;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  frequency:
    | "daily"
    | "weekly"
    | "biweekly"
    | "monthly"
    | "quarterly"
    | "yearly";
  startDate: string;
  endDate?: string;
  transaction: Transaction;
  lastExecuted?: string;
  nextExecution?: string;
  enabled: boolean;
}

export interface TransactionTemplate {
  id: string;
  name: string;
  description?: string;
  transaction: Transaction;
  category?: string;
  tags?: string[];
}

export interface Bill {
  id: string;
  name: string;
  account: string;
  amount: Amount;
  dueDate: string;
  frequency: "monthly" | "quarterly" | "yearly" | "one-time";
  category?: string;
  payee?: string;
  paid: boolean;
  paidDate?: string;
  reminderDays?: number;
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: Amount;
  currentAmount: Amount;
  targetDate: string;
  account: string;
  category?: string;
  description?: string;
}

export interface DebtPayoff {
  id: string;
  name: string;
  account: string;
  currentBalance: Amount;
  interestRate: number;
  minimumPayment: Amount;
  targetPayoffDate?: string;
  strategy: "snowball" | "avalanche" | "custom";
}

export interface TaxCategory {
  id: string;
  name: string;
  type: "deduction" | "income" | "expense";
  schedule?: string;
  description?: string;
}

export interface InvestmentTransaction {
  id: string;
  date: string;
  type: "buy" | "sell" | "dividend" | "split" | "transfer";
  account: string;
  commodity: string;
  quantity: string;
  price: Amount;
  cost?: Amount;
  fees?: Amount;
  notes?: string;
}
