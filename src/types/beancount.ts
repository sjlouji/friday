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

export type AccountType = 'Assets' | 'Liabilities' | 'Equity' | 'Income' | 'Expenses';

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
  type: 'balance-sheet' | 'income-statement' | 'cash-flow' | 'portfolio';
  period: {
    start: string;
    end: string;
  };
  data: any;
}

