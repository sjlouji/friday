import { create } from 'zustand';
import { Transaction, Account, Balance, PriceEntry, Budget, Portfolio } from '@/types/beancount';
import { api } from '@/services/api';

interface BeancountState {
  transactions: Transaction[];
  accounts: Account[];
  balances: Balance[];
  prices: PriceEntry[];
  budgets: Budget[];
  portfolios: Portfolio[];
  currentFile: string | null;
  loading: boolean;
  error: string | null;
  
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (id: string, transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  fetchAccounts: () => Promise<void>;
  addAccount: (account: Account) => Promise<void>;
  updateAccount: (name: string, account: Account) => Promise<void>;
  deleteAccount: (name: string) => Promise<void>;
  
  fetchBalances: () => Promise<void>;
  fetchPrices: () => Promise<void>;
  addBalance: (balance: Balance) => void;
  addPrice: (price: PriceEntry) => void;
  addBudget: (budget: Budget) => void;
  
  fetchDashboard: () => Promise<any>;
  fetchBalanceSheet: () => Promise<any>;
  fetchIncomeStatement: (startDate: string, endDate: string) => Promise<any>;
  
  setCurrentFile: (file: string | null) => void;
  importFile: (file: File) => Promise<void>;
  exportFile: () => Promise<void>;
  
  loadAll: () => Promise<void>;
}

export const useBeancountStore = create<BeancountState>((set, get) => ({
  transactions: [],
  accounts: [],
  balances: [],
  prices: [],
  budgets: [],
  portfolios: [],
  currentFile: null,
  loading: false,
  error: null,
  
  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.transactions.getAll();
      set({ transactions: response.transactions || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  addTransaction: async (transaction) => {
    set({ loading: true, error: null });
    try {
      await api.transactions.create(transaction);
      await get().fetchTransactions();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateTransaction: async (id, transaction) => {
    set({ loading: true, error: null });
    try {
      await api.transactions.update(id, transaction);
      await get().fetchTransactions();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  deleteTransaction: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.transactions.delete(id);
      await get().fetchTransactions();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.accounts.getAll();
      set({ accounts: response.accounts || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  addAccount: async (account) => {
    set({ loading: true, error: null });
    try {
      await api.accounts.create(account);
      await get().fetchAccounts();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateAccount: async (name, account) => {
    set((state) => ({
      accounts: state.accounts.map((a) => (a.name === name ? account : a)),
    }));
  },
  
  deleteAccount: async (name) => {
    set((state) => ({
      accounts: state.accounts.filter((a) => a.name !== name),
    }));
  },
  
  fetchBalances: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.balances.getAll();
      set({ balances: response.balances || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchPrices: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.prices.getAll();
      set({ prices: response.prices || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  addBalance: (balance) =>
    set((state) => ({
      balances: [...state.balances, balance],
    })),
  
  addPrice: (price) =>
    set((state) => ({
      prices: [...state.prices, price],
    })),
  
  addBudget: (budget) =>
    set((state) => ({
      budgets: [...state.budgets, budget],
    })),
  
  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.dashboard.get();
      set({ loading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  fetchBalanceSheet: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.reports.balanceSheet();
      set({ loading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  fetchIncomeStatement: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const data = await api.reports.incomeStatement(startDate, endDate);
      set({ loading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  setCurrentFile: (file) => set({ currentFile: file }),
  
  importFile: async (file) => {
    set({ loading: true, error: null });
    try {
      await api.import.upload(file);
      set({ currentFile: file.name, loading: false });
      await get().loadAll();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  exportFile: async () => {
    try {
      api.export.download();
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  loadAll: async () => {
    await Promise.all([
      get().fetchTransactions(),
      get().fetchAccounts(),
      get().fetchBalances(),
      get().fetchPrices(),
    ]);
  },
}));
