const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T> {
  data?: T;
  errors?: any[];
  message?: string;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  transactions: {
    getAll: () => fetchAPI<{ transactions: any[] }>('/transactions'),
    create: (transaction: any) => fetchAPI('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    }),
    update: (id: string, transaction: any) => fetchAPI(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    }),
    delete: (id: string) => fetchAPI(`/transactions/${id}`, {
      method: 'DELETE',
    }),
  },

  accounts: {
    getAll: () => fetchAPI<{ accounts: any[] }>('/accounts'),
    create: (account: any) => fetchAPI('/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    }),
  },

  balances: {
    getAll: () => fetchAPI<{ balances: any[] }>('/balances'),
  },

  prices: {
    getAll: () => fetchAPI<{ prices: any[] }>('/prices'),
  },

  dashboard: {
    get: () => fetchAPI('/dashboard'),
  },

  reports: {
    balanceSheet: () => fetchAPI('/reports/balance-sheet'),
    incomeStatement: (startDate: string, endDate: string) =>
      fetchAPI(`/reports/income-statement?start_date=${startDate}&end_date=${endDate}`),
  },

  import: {
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/import`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Import failed');
      }
      return response.json();
    },
  },

  export: {
    download: () => {
      window.open(`${API_BASE_URL}/export`, '_blank');
    },
  },
};

