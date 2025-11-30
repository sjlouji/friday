const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const BEANCOUNT_FILE_KEY = "beancount_file_path";

export interface ApiResponse<T> {
  data?: T;
  errors?: any[];
  message?: string;
}

function getFilePath(): string {
  const path = localStorage.getItem(BEANCOUNT_FILE_KEY);
  if (!path) {
    throw new Error(
      "Beancount file path not set. Please configure it in Settings."
    );
  }
  // Validate that it's a full path, not just a filename
  if (!path.includes("/") && !path.includes("\\")) {
    throw new Error(
      "Please provide the full path to the file (e.g., /Users/username/Documents/ledger.beancount), not just the filename. You can set this in Settings."
    );
  }
  return path;
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const filePath = getFilePath();
  // Handle endpoints that may already have query parameters
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${API_BASE_URL}${endpoint}${separator}file_path=${encodeURIComponent(
    filePath
  )}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorData = await response.json();
      errorDetail =
        errorData.detail ||
        errorData.message ||
        errorData.error ||
        response.statusText;
    } catch {
      // If response is not JSON, try to get text
      try {
        const errorText = await response.text();
        errorDetail = errorText || response.statusText;
      } catch {
        errorDetail = response.statusText;
      }
    }
    throw new Error(errorDetail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  transactions: {
    getAll: (
      page: number = 1,
      pageSize: number = 25,
      filters?: {
        freeText?: string;
        tokens?: any[];
        operation?: "and" | "or";
      },
      sorting?: {
        field?: string;
        descending?: boolean;
      }
    ) => {
      let url = `/transactions?page=${page}&page_size=${pageSize}`;
      
      if (filters) {
        if (filters.freeText) {
          url += `&free_text=${encodeURIComponent(filters.freeText)}`;
        }
        if (filters.tokens && filters.tokens.length > 0) {
          url += `&filter_tokens=${encodeURIComponent(JSON.stringify(filters.tokens))}`;
          url += `&filter_operation=${filters.operation || "and"}`;
        }
      }
      
      if (sorting && sorting.field) {
        url += `&sort_field=${encodeURIComponent(sorting.field)}`;
        url += `&sort_descending=${sorting.descending ? "true" : "false"}`;
      }
      
      return fetchAPI<{ transactions: any[]; pagination?: any }>(url);
    },
    create: (transaction: any) =>
      fetchAPI("/transactions", {
        method: "POST",
        body: JSON.stringify(transaction),
      }),
    update: (id: string, transaction: any) =>
      fetchAPI(`/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(transaction),
      }),
    delete: (id: string) =>
      fetchAPI(`/transactions/${id}`, {
        method: "DELETE",
      }),
  },

  accounts: {
    getAll: () => fetchAPI<{ accounts: any[] }>("/accounts"),
    create: (account: any) =>
      fetchAPI("/accounts", {
        method: "POST",
        body: JSON.stringify(account),
      }),
  },

  balances: {
    getAll: () => fetchAPI<{ balances: any[] }>("/balances"),
  },

  prices: {
    getAll: () => fetchAPI<{ prices: any[] }>("/prices"),
  },

  dashboard: {
    get: () => fetchAPI("/dashboard"),
  },

  reports: {
    balanceSheet: () => fetchAPI("/reports/balance-sheet"),
    incomeStatement: (startDate: string, endDate: string) =>
      fetchAPI(
        `/reports/income-statement?start_date=${startDate}&end_date=${endDate}`
      ),
  },

  import: {
    upload: async (file: File) => {
      const filePath = getFilePath();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_path", filePath);
      const response = await fetch(
        `${API_BASE_URL}/import?file_path=${encodeURIComponent(filePath)}`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Import failed");
      }
      return response.json();
    },
  },

  export: {
    download: () => {
      const filePath = getFilePath();
      window.open(
        `${API_BASE_URL}/export?file_path=${encodeURIComponent(filePath)}`,
        "_blank"
      );
    },
  },

  files: {
    create: async (filePath: string) => {
      const response = await fetch(
        `${API_BASE_URL}/files/create?file_path=${encodeURIComponent(
          filePath
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || "Failed to create file");
      }
      return response.json();
    },
    browse: async (path: string = "") => {
      // Build URL with optional path parameter
      let url = `${API_BASE_URL}/files/browse`;
      if (path && path.trim()) {
        url += `?path=${encodeURIComponent(path)}`;
      }

      console.log("Browsing files at URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { detail: errorText || response.statusText };
        }
        console.error("Browse error:", error);
        throw new Error(
          error.detail ||
            `Failed to browse directory: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Browse result:", result);
      return result;
    },
    getCommonPaths: async () => {
      const response = await fetch(`${API_BASE_URL}/files/common-paths`);
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || "Failed to get common paths");
      }
      return response.json();
    },
  },
};
