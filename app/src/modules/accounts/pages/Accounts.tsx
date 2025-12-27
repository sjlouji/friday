import { useState, useEffect } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Button from "@cloudscape-design/components/button";
import Cards from "@cloudscape-design/components/cards";
import Box from "@cloudscape-design/components/box";
import Badge from "@cloudscape-design/components/badge";
import SpaceBetween from "@cloudscape-design/components/space-between";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Tabs from "@cloudscape-design/components/tabs";
import FileUpload from "@cloudscape-design/components/file-upload";
import Alert from "@cloudscape-design/components/alert";
import Flashbar from "@cloudscape-design/components/flashbar";
import { Account, AccountType } from "@/types/beancount";
import AccountModal from "@/components/AccountModal";
import AccountTree from "@/components/AccountTree";
import { formatIndianCurrency } from "@/utils/currency";
import { api } from "@/services/api";

const accountTypeColors: Record<
  AccountType,
  "blue" | "red" | "green" | "grey"
> = {
  Assets: "green",
  Liabilities: "red",
  Equity: "blue",
  Income: "blue",
  Expenses: "grey",
};

export default function Accounts() {
  const {
    accounts,
    deleteAccount,
    fetchAccounts,
    fetchBalances,
    balances,
    loading,
    error,
  } = useBeancountStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountBalances, setAccountBalances] = useState<
    Record<string, { number: string; currency: string }>
  >({});
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [importMessage, setImportMessage] = useState("");
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [accountErrors, setAccountErrors] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Accounts page: Loading accounts...");
        
        // Fetch accounts through the store
        await fetchAccounts();
        
        // Also fetch directly to check for errors
        const response = await api.accounts.getAll();
        
        // Check for errors in response
        if (response.errors && response.errors.length > 0) {
          const formattedErrors = response.errors.map((err: any) => {
            if (Array.isArray(err) && err.length >= 2) {
              const errorInfo = err[1];
              const lineInfo = err[0]?.lineno ? ` (line ${err[0].lineno})` : "";
              return `${errorInfo}${lineInfo}`;
            }
            return String(err);
          });
          setAccountErrors(formattedErrors);
        } else {
          setAccountErrors([]);
        }
        
        await fetchBalances();
      } catch (error: any) {
        console.error("Error loading accounts:", error);
        setAccountErrors([error.message || "Failed to load accounts"]);
      }
    };
    loadData();
  }, []);

  // Update account balances when balances change
  useEffect(() => {
    const balancesMap: Record<
      string,
      { number: string; currency: string }
    > = {};
    balances.forEach((balance) => {
      balancesMap[balance.account] = balance.amount;
    });
    setAccountBalances(balancesMap);
    console.log("Accounts page: Accounts from store:", accounts);
    console.log("Accounts page: Account balances updated:", balancesMap);
  }, [balances, accounts]);

  const accountsByType = accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = [];
    }
    acc[account.type].push(account);
    return acc;
  }, {} as Record<AccountType, Account[]>);

  console.log(
    "Accounts page render - accounts:",
    accounts,
    "accountsByType:",
    accountsByType
  );

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete account "${name}"?`)) {
      deleteAccount(name);
    }
  };

  const handleNew = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleExcelImport = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setImportStatus("error");
      setImportMessage("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setImportStatus("idle");
    setImportMessage("");
    setImportErrors([]);

    try {
      const result = await api.accounts.importExcel(file);
      setImportStatus("success");
      setImportMessage(
        result.message || `Successfully imported ${result.imported} account(s)`
      );
      if (result.errors && result.errors.length > 0) {
        setImportErrors(result.errors);
      }

      // Reload accounts and balances
      await fetchAccounts();
      await fetchBalances();
    } catch (error: any) {
      setImportStatus("error");
      setImportMessage(error.message || "Failed to import accounts");
    }
  };

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: "Accounts", href: "/accounts" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Manage your chart of accounts"
        actions={
          <Button variant="primary" onClick={handleNew}>
            New Account
          </Button>
        }
      >
        Accounts
      </Header>

      <Container
        variant="stacked"
        header={
          <Header
            variant="h2"
            description="Upload an Excel file with columns: Account Name, Type, Open Date, Currency (optional), Notes (optional)"
          >
            Import Accounts from Excel
          </Header>
        }
      >
        {importStatus === "success" && (
          <Alert
            type="success"
            dismissible
            onDismiss={() => setImportStatus("idle")}
          >
            {importMessage}
            {importErrors.length > 0 && (
              <Box margin={{ top: "s" }}>
                <Box variant="small" fontWeight="bold">
                  Warnings/Errors:
                </Box>
                <Box variant="small" as="ul" padding={{ left: "l" }}>
                  {importErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </Box>
              </Box>
            )}
          </Alert>
        )}
        {importStatus === "error" && (
          <Alert
            type="error"
            dismissible
            onDismiss={() => setImportStatus("idle")}
          >
            {importMessage}
          </Alert>
        )}
        <FileUpload
          value={[]}
          onChange={(e) => handleExcelImport(e.detail.value)}
          accept=".xlsx,.xls"
          showFileLastModified
          showFileSize
          showFileThumbnail
          constraintText="Upload Excel file with columns: Account Name, Type, Open Date, Currency (optional), Notes (optional)"
        />
        <Box margin={{ top: "m" }} variant="small" color="text-body-secondary">
          <Box fontWeight="bold">Excel Format:</Box>
          <Box as="ul" padding={{ left: "l" }}>
            <li>
              <strong>Account Name:</strong> Full account path (e.g.,
              Assets:Bank:Checking)
            </li>
            <li>
              <strong>Type:</strong> Assets, Liabilities, Equity, Income, or
              Expenses
            </li>
            <li>
              <strong>Open Date:</strong> Date in YYYY-MM-DD format (e.g.,
              2024-01-01)
            </li>
            <li>
              <strong>Currency:</strong> (Optional) Currency code, defaults to
              INR
            </li>
            <li>
              <strong>Notes:</strong> (Optional) Additional notes or description
            </li>
          </Box>
        </Box>
      </Container>

      {error && (
        <Alert
          type="error"
          dismissible
          onDismiss={() => {}}
          header="Error loading accounts"
        >
          {error}
          <Box variant="small" color="text-body-secondary" margin={{ top: "xs" }}>
            Please check that the Beancount file path is set correctly in Settings.
          </Box>
        </Alert>
      )}

      {accountErrors.length > 0 && (
        <Alert
          type="warning"
          dismissible
          onDismiss={() => setAccountErrors([])}
          header="Beancount file errors"
        >
          <Box as="ul" padding={{ left: "l" }}>
            {accountErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </Box>
          <Box variant="small" color="text-body-secondary" margin={{ top: "xs" }}>
            These errors may prevent accounts from loading correctly. Please fix them in your Beancount file.
          </Box>
        </Alert>
      )}

      {loading && (
        <Box textAlign="center" padding="xl">
          <Box>Loading accounts...</Box>
        </Box>
      )}

      {!loading && !error && accounts.length === 0 && (
        <Box textAlign="center" padding="xl">
          <Box color="text-body-secondary">
            No accounts found. Make sure your Beancount file has account
            definitions (e.g., "2024-01-01 open Assets:Checking").
          </Box>
        </Box>
      )}

      {!loading && !error && (
        <Tabs
          tabs={[
            {
              label: "Tree View",
              id: "tree",
              content: (
                <Container
                  variant="stacked"
                  header={
                    <Header variant="h2">
                      Account Hierarchy
                      <Box
                        variant="small"
                        color="text-body-secondary"
                        margin={{ top: "xs" }}
                      >
                        Expand/collapse to view parent-child relationships
                      </Box>
                    </Header>
                  }
                >
                  {accounts.length > 0 ? (
                    <AccountTree
                      accounts={accounts}
                      balances={accountBalances}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ) : (
                    <Box textAlign="center" padding={{ vertical: "xl" }}>
                      No accounts found
                    </Box>
                  )}
                </Container>
              ),
            },
            {
              label: "By Type",
              id: "by-type",
              content: (
                <SpaceBetween size="l">
                  {(
                    [
                      "Assets",
                      "Liabilities",
                      "Equity",
                      "Income",
                      "Expenses",
                    ] as AccountType[]
                  ).map((type) => {
                    const typeAccounts = accountsByType[type] || [];
                    return (
                      <Container
                        key={type}
                        variant="stacked"
                        header={
                          <Header
                            variant="h2"
                            counter={`(${typeAccounts.length})`}
                            actions={
                              <Badge color={accountTypeColors[type]}>
                                {typeAccounts.length} accounts
                              </Badge>
                            }
                          >
                            {type}
                          </Header>
                        }
                      >
                        {typeAccounts.length > 0 ? (
                          <Cards
                            cardDefinition={{
                              header: (item) => item.name,
                              sections: [
                                {
                                  id: "date",
                                  header: "Opened",
                                  content: (item) =>
                                    new Date(
                                      item.openDate
                                    ).toLocaleDateString(),
                                },
                                {
                                  id: "balance",
                                  header: "Balance",
                                  content: (item) => {
                                    const balance = accountBalances[item.name];
                                    if (balance) {
                                      return formatIndianCurrency(
                                        parseFloat(balance.number),
                                        balance.currency
                                      );
                                    }
                                    return "N/A";
                                  },
                                },
                                {
                                  id: "closed",
                                  header: "Status",
                                  content: (item) =>
                                    item.closeDate
                                      ? `Closed: ${new Date(
                                          item.closeDate
                                        ).toLocaleDateString()}`
                                      : "Open",
                                },
                              ],
                            }}
                            cardsPerRow={[{ cards: 3 }]}
                            items={typeAccounts.map((account) => ({
                              ...account,
                              actions: (
                                <SpaceBetween direction="horizontal" size="xs">
                                  <Button
                                    variant="inline-link"
                                    onClick={() => handleEdit(account)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="inline-link"
                                    onClick={() => handleDelete(account.name)}
                                  >
                                    Delete
                                  </Button>
                                </SpaceBetween>
                              ),
                            }))}
                          />
                        ) : (
                          <Box textAlign="center" padding={{ vertical: "xl" }}>
                            No {type.toLowerCase()} accounts yet
                          </Box>
                        )}
                      </Container>
                    );
                  })}
                </SpaceBetween>
              ),
            },
          ]}
        />
      )}

      {isModalOpen && (
        <AccountModal
          account={editingAccount}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAccount(null);
          }}
        />
      )}
    </SpaceBetween>
  );
}
