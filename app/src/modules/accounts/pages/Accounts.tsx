import { useState, useEffect } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Button from "@cloudscape-design/components/button";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Tabs from "@cloudscape-design/components/tabs";
import Alert from "@cloudscape-design/components/alert";
import { Account } from "@/types/beancount";
import AccountModal from "../components/AccountModal";
import AccountTreeView from "../components/AccountTreeView";
import AccountTableView from "../components/AccountTableView";
import { api } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";

export default function Accounts() {
  const { t } = useTranslation();
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
        // Fetch accounts through the store
        await fetchAccounts();
        
        // Also fetch directly to check for errors
        const response = await api.accounts.getAll();
        
        // Check for errors in response
        if (response.errors && response.errors.length > 0) {
          setAccountErrors(response.errors);
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
  }, [balances, accounts]);


  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = (name: string) => {
    if (confirm(`${t("accounts.confirmDelete")} "${name}"?`)) {
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
    <SpaceBetween size="s">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description={t("accounts.description")}
        actions={
          <Button variant="primary" onClick={handleNew}>
            {t("accounts.newAccount")}
          </Button>
        }
      >
        {t("accounts.title")}
      </Header>

      <Container
        variant="stacked"
        header={
          <Header
            variant="h2"
            actions={
              <Button
                iconName="upload"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".xlsx,.xls";
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      await handleExcelImport([file]);
                    }
                  };
                  input.click();
                }}
              >
                {t("accounts.bulkUpload")}
              </Button>
            }
            description={t("accounts.importDescription")}
          >
            {t("accounts.importFromExcel")}
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
                  {t("accounts.warningsErrors")}
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
        <Box variant="small" color="text-body-secondary">
          <Box fontWeight="bold">{t("accounts.excelFormat")}</Box>
          <Box as="ul" padding={{ left: "l" }}>
            <li>{t("accounts.excelAccountName")}</li>
            <li>{t("accounts.excelType")}</li>
            <li>{t("accounts.excelOpenDate")}</li>
            <li>{t("accounts.excelCurrency")}</li>
            <li>{t("accounts.excelNotes")}</li>
          </Box>
        </Box>
      </Container>

      {error && (
        <Alert
          type="error"
          dismissible
          onDismiss={() => {}}
          header={t("accounts.errorLoading")}
        >
          {error}
          <Box variant="small" color="text-body-secondary" margin={{ top: "xs" }}>
            {t("accounts.checkBeancountFilePath")}
          </Box>
        </Alert>
      )}

      {accountErrors.length > 0 && (
        <Alert
          type="warning"
          dismissible
          onDismiss={() => setAccountErrors([])}
          header={`${t("accounts.beancountFileErrors")} (${accountErrors.length})`}
        >
          <Box as="ul" padding={{ left: "l" }} margin={{ bottom: "xs" }}>
            {accountErrors.map((err, idx) => (
              <li key={idx}>
                <Box fontWeight="bold" display="inline">
                  {err}
                </Box>
              </li>
            ))}
          </Box>
          <Box variant="small" color="text-body-secondary" margin={{ top: "xs" }}>
            {accountErrors.some((err) => err.includes("File not found")) ? (
              <>
                <Box fontWeight="bold" margin={{ bottom: "xs" }}>
                  {t("accounts.fileNotFoundError")}
                </Box>
                <Box>
                  {t("accounts.fileNotFoundInstructions")}
                  <Box as="ul" padding={{ left: "l" }} margin={{ top: "xs" }}>
                    <li>{t("accounts.goToSettings")}</li>
                    <li>{t("accounts.useSelectFile")}</li>
                    <li>{t("accounts.manuallyEnterPath")}</li>
                    <li>{t("accounts.makeSureFileExists")}</li>
                  </Box>
                </Box>
              </>
            ) : (
              <>
                {t("accounts.errorsMayPreventLoading")}
                <Box margin={{ top: "xs" }}>
                  <strong>{t("accounts.tip")}:</strong> {t("accounts.checkLineNumber")}
                  <Box as="ul" padding={{ left: "l" }} margin={{ top: "xs" }}>
                    <li>{t("accounts.transactionsBalance")}</li>
                    <li>{t("accounts.accountNamesFormatted")}</li>
                    <li>{t("accounts.datesInFormat")}</li>
                    <li>{t("accounts.amountsCorrect")}</li>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Alert>
      )}

      {loading && (
        <Box textAlign="center" padding="xl">
          <Box>{t("accounts.loadingAccounts")}</Box>
        </Box>
      )}

      {!loading && !error && accounts.length === 0 && (
        <Box textAlign="center" padding="xl">
          <Box color="text-body-secondary">
            {t("accounts.noAccountsFound")}
          </Box>
        </Box>
      )}

      {!loading && !error && (
        <Tabs
          tabs={[
            {
              label: t("accounts.treeView"),
              id: "tree",
              content: (
                <Container
                  variant="stacked"
                  header={
                    <Header variant="h2">
                      {t("accounts.accountHierarchy")}
                      <Box
                        variant="small"
                        color="text-body-secondary"
                        margin={{ top: "xs" }}
                      >
                        {t("accounts.expandCollapse")}
                      </Box>
                    </Header>
                  }
                >
                  {accounts.length > 0 ? (
                    <AccountTreeView
                      accounts={accounts}
                      balances={accountBalances}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ) : (
                    <Box textAlign="center" padding={{ vertical: "xl" }}>
                      {t("accounts.noAccountsFound")}
                    </Box>
                  )}
                </Container>
              ),
            },
            {
              label: t("accounts.tableView"),
              id: "table",
              content: (
                <Container variant="stacked">
                  {accounts.length > 0 ? (
                    <AccountTableView
                      accounts={accounts}
                      balances={accountBalances}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ) : (
                    <Box textAlign="center" padding={{ vertical: "xl" }}>
                      {t("accounts.noAccountsFound")}
                    </Box>
                  )}
                </Container>
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
