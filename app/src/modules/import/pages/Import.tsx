import { useState } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Button from "@cloudscape-design/components/button";
import FileUpload from "@cloudscape-design/components/file-upload";
import Alert from "@cloudscape-design/components/alert";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import Grid from "@cloudscape-design/components/grid";
import Cards from "@cloudscape-design/components/cards";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Tabs from "@cloudscape-design/components/tabs";
import { api } from "@/lib/api";
import TransactionMappingModal from "../components/TransactionMappingModal";
import { useTranslation } from "@/hooks/useTranslation";

export default function Import() {
  const { t } = useTranslation();
  const { importFile, exportFile, fetchTransactions } = useBeancountStore();
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionImportStatus, setTransactionImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [transactionImportMessage, setTransactionImportMessage] = useState("");
  const [transactionImportErrors, setTransactionImportErrors] = useState<string[]>([]);
  const [mappingFile, setMappingFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<{
    columns: string[];
    preview: any[];
    totalRows: number;
    fileName: string;
  } | null>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!file.name.endsWith(".beancount") && !file.name.endsWith(".bean")) {
      setImportStatus("error");
      setErrorMessage("Please upload a .beancount or .bean file");
      return;
    }

    try {
      await importFile(file);
      setImportStatus("success");
      setErrorMessage("");
    } catch (error: any) {
      setImportStatus("error");
      setErrorMessage(error.message || "Failed to import file");
    }
  };

  const exportToBeancount = () => {
    exportFile();
  };

  const handleTransactionCSVUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".CSV")) {
      setTransactionImportStatus("error");
      setTransactionImportMessage("Please upload a CSV file (.csv)");
      return;
    }

    setTransactionImportStatus("idle");
    setTransactionImportMessage("");
    setTransactionImportErrors([]);

    try {
      const result = await api.transactions.importCSV(file);
      setTransactionImportStatus("success");
      setTransactionImportMessage(
        result.message || `Successfully imported ${result.imported || 0} transaction(s)`
      );
      if (result.errors && result.errors.length > 0) {
        setTransactionImportErrors(result.errors);
      }
      // Reload transactions
      await fetchTransactions();
    } catch (error: any) {
      setTransactionImportStatus("error");
      setTransactionImportMessage(error.message || "Failed to import CSV file");
    }
  };

  const handleTransactionExcelUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setTransactionImportStatus("error");
      setTransactionImportMessage("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setTransactionImportStatus("idle");
    setTransactionImportMessage("");
    setTransactionImportErrors([]);

    try {
      const result = await api.transactions.importExcel(file);
      setTransactionImportStatus("success");
      setTransactionImportMessage(
        result.message || `Successfully imported ${result.imported || 0} transaction(s)`
      );
      if (result.errors && result.errors.length > 0) {
        setTransactionImportErrors(result.errors);
      }
      // Reload transactions
      await fetchTransactions();
    } catch (error: any) {
      setTransactionImportStatus("error");
      setTransactionImportMessage(error.message || "Failed to import Excel file");
    }
  };

  const handleFileForMapping = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (
      !file.name.endsWith(".csv") &&
      !file.name.endsWith(".CSV") &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls") &&
      !file.name.endsWith(".XLSX") &&
      !file.name.endsWith(".XLS")
    ) {
      setTransactionImportStatus("error");
      setTransactionImportMessage("Please upload a CSV or Excel file");
      return;
    }

    setMappingFile(file);
    setTransactionImportStatus("idle");
    setTransactionImportMessage("");
    setTransactionImportErrors([]);

    try {
      const result = await api.transactions.preview(file);
      setPreviewData(result);
      setShowMappingModal(true);
    } catch (error: any) {
      setTransactionImportStatus("error");
      setTransactionImportMessage(error.message || "Failed to preview file");
    }
  };

  const handleMappedImport = async (
    mapping: Record<string, string>,
    defaults: { currency: string; flag: string }
  ) => {
    if (!mappingFile) return;

    setTransactionImportStatus("idle");
    setTransactionImportMessage("");
    setTransactionImportErrors([]);

    try {
      const result = await api.transactions.importMapped(mappingFile, mapping, defaults);
      setTransactionImportStatus("success");
      setTransactionImportMessage(
        result.message || `Successfully imported ${result.imported || 0} transaction(s)`
      );
      if (result.errors && result.errors.length > 0) {
        setTransactionImportErrors(result.errors);
      }
      setShowMappingModal(false);
      setMappingFile(null);
      setPreviewData(null);
      await fetchTransactions();
    } catch (error: any) {
      setTransactionImportStatus("error");
      setTransactionImportMessage(error.message || "Failed to import transactions");
      if (error.errors) {
        setTransactionImportErrors(error.errors);
      }
    }
  };

  const importOptions = [
    {
      header: "CSV Import",
      description: "Import transactions from CSV files",
    },
    {
      header: "OFX Import",
      description: "Import bank statements in OFX format",
    },
    {
      header: "QIF Import",
      description: "Import from Quicken QIF files",
    },
  ];

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: "Import", href: "/import" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header variant="h1" description="Import beancount files or export your data">
        Import & Export
      </Header>

      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        <Container
          variant="stacked"
          header={<Header variant="h2">Import Beancount File</Header>}
          footer={
            importStatus === "success" && (
              <Alert type="success" dismissible={false}>
                File imported successfully!
              </Alert>
            )
          }
        >
          {importStatus === "error" && (
            <Alert type="error" dismissible={false}>
              {errorMessage}
            </Alert>
          )}
          <FileUpload
            value={[]}
            onChange={(e) => handleFileUpload(e.detail.value)}
            accept=".beancount,.bean"
            showFileLastModified
            showFileSize
            showFileThumbnail
          />
        </Container>

        <Container variant="stacked" header={<Header variant="h2">Export to Beancount</Header>}>
          <Box variant="p">
            Export your current data to a beancount file format that can be used with the beancount
            command-line tools or other beancount-compatible applications.
          </Box>
          <Button variant="primary" iconName="download" onClick={exportToBeancount}>
            Export to .beancount
          </Button>
        </Container>
      </Grid>

      <Tabs
        tabs={[
          {
            label: "Flexible Import (Map Columns)",
            id: "flexible",
            content: (
              <Container
                variant="stacked"
                header={<Header variant="h2">Upload Any File and Map Columns</Header>}
                footer={
                  transactionImportStatus === "success" && (
                    <Alert type="success" dismissible={false}>
                      {transactionImportMessage}
                      {transactionImportErrors.length > 0 && (
                        <Box margin={{ top: "s" }}>
                          <Box variant="small" fontWeight="bold">
                            Warnings/Errors:
                          </Box>
                          <Box variant="small" as="ul" padding={{ left: "l" }}>
                            {transactionImportErrors.slice(0, 10).map((err, idx) => (
                              <li key={idx}>{err}</li>
                            ))}
                            {transactionImportErrors.length > 10 && (
                              <li>... and {transactionImportErrors.length - 10} more</li>
                            )}
                          </Box>
                        </Box>
                      )}
                    </Alert>
                  )
                }
              >
                {transactionImportStatus === "error" && (
                  <Alert type="error" dismissible={false}>
                    {transactionImportMessage}
                    {transactionImportErrors.length > 0 && (
                      <Box margin={{ top: "s" }}>
                        <Box variant="small" as="ul" padding={{ left: "l" }}>
                          {transactionImportErrors.slice(0, 10).map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                          {transactionImportErrors.length > 10 && (
                            <li>... and {transactionImportErrors.length - 10} more</li>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Alert>
                )}
                <Box variant="p" margin={{ bottom: "m" }}>
                  Upload any CSV or Excel file. The system will extract the data and let you map
                  your columns to transaction fields.
                  <br />
                  <strong>Supported formats:</strong> CSV (.csv), Excel (.xlsx, .xls)
                </Box>
                <FileUpload
                  value={[]}
                  onChange={(e) => handleFileForMapping(e.detail.value)}
                  accept=".csv,.xlsx,.xls"
                  showFileLastModified
                  showFileSize
                  showFileThumbnail
                />
                <Box margin={{ top: "m" }} variant="small" color="text-body-secondary">
                  <Box fontWeight="bold">How it works:</Box>
                  <Box as="ul" padding={{ left: "l" }}>
                    <li>Upload your file (CSV or Excel)</li>
                    <li>System extracts and shows a preview of your data</li>
                    <li>
                      Map your columns to transaction fields (Date, Narration, Account, Amount,
                      etc.)
                    </li>
                    <li>Review the preview and import</li>
                    <li>
                      System automatically categorizes transactions based on amount and category
                      mapping
                    </li>
                  </Box>
                </Box>
              </Container>
            ),
          },
          {
            label: "Beancount File",
            id: "beancount",
            content: (
              <Container
                variant="stacked"
                header={<Header variant="h2">Import from Other Formats</Header>}
              >
                <Cards
                  cardDefinition={{
                    header: (item) => item.header,
                    sections: [
                      {
                        id: "description",
                        content: (item) => item.description,
                      },
                    ],
                  }}
                  cardsPerRow={[{ cards: 3 }]}
                  items={importOptions}
                />
              </Container>
            ),
          },
          {
            label: "Bulk Transactions",
            id: "transactions",
            content: (
              <SpaceBetween size="l">
                <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                  <Container
                    variant="stacked"
                    header={<Header variant="h2">Import Transactions from CSV</Header>}
                    footer={
                      transactionImportStatus === "success" && (
                        <Alert type="success" dismissible={false}>
                          {transactionImportMessage}
                          {transactionImportErrors.length > 0 && (
                            <Box margin={{ top: "s" }}>
                              <Box variant="small" fontWeight="bold">
                                Warnings/Errors:
                              </Box>
                              <Box variant="small" as="ul" padding={{ left: "l" }}>
                                {transactionImportErrors.slice(0, 10).map((err, idx) => (
                                  <li key={idx}>{err}</li>
                                ))}
                                {transactionImportErrors.length > 10 && (
                                  <li>... and {transactionImportErrors.length - 10} more</li>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Alert>
                      )
                    }
                  >
                    {transactionImportStatus === "error" && (
                      <Alert type="error" dismissible={false}>
                        {transactionImportMessage}
                        {transactionImportErrors.length > 0 && (
                          <Box margin={{ top: "s" }}>
                            <Box variant="small" as="ul" padding={{ left: "l" }}>
                              {transactionImportErrors.slice(0, 10).map((err, idx) => (
                                <li key={idx}>{err}</li>
                              ))}
                              {transactionImportErrors.length > 10 && (
                                <li>... and {transactionImportErrors.length - 10} more</li>
                              )}
                            </Box>
                          </Box>
                        )}
                      </Alert>
                    )}
                    <Box variant="p" margin={{ bottom: "m" }}>
                      Upload a CSV file to bulk import transactions.
                      <br />
                      <strong>Required columns:</strong> Date, Narration, Account, Amount
                      <br />
                      <strong>Optional columns:</strong> Payee, Currency (defaults to INR), Category
                      (for categorization), Flag (*, !, or ?)
                    </Box>
                    <FileUpload
                      value={[]}
                      onChange={(e) => handleTransactionCSVUpload(e.detail.value)}
                      accept=".csv"
                      showFileLastModified
                      showFileSize
                      showFileThumbnail
                    />
                    <Box margin={{ top: "m" }} variant="small" color="text-body-secondary">
                      <Box fontWeight="bold">CSV Format:</Box>
                      <Box as="ul" padding={{ left: "l" }}>
                        <li>
                          <strong>Date:</strong> Transaction date in YYYY-MM-DD format (e.g.,
                          2024-01-15)
                        </li>
                        <li>
                          <strong>Payee:</strong> (Optional) Who you paid or received from
                        </li>
                        <li>
                          <strong>Narration:</strong> Description of the transaction
                        </li>
                        <li>
                          <strong>Account:</strong> Account name (e.g., Assets:Bank:Checking)
                        </li>
                        <li>
                          <strong>Amount:</strong> Positive for income/asset increase, negative for
                          expenses/asset decrease
                        </li>
                        <li>
                          <strong>Currency:</strong> (Optional) Currency code, defaults to INR
                        </li>
                        <li>
                          <strong>Category:</strong> (Optional) Category account for automatic
                          categorization (e.g., Expenses:Food or Income:Salary)
                        </li>
                        <li>
                          <strong>Flag:</strong> (Optional) Transaction flag (*, !, or ?), defaults
                          to *
                        </li>
                      </Box>
                    </Box>
                  </Container>

                  <Container
                    variant="stacked"
                    header={<Header variant="h2">Import Transactions from Excel</Header>}
                    footer={
                      transactionImportStatus === "success" && (
                        <Alert type="success" dismissible={false}>
                          {transactionImportMessage}
                          {transactionImportErrors.length > 0 && (
                            <Box margin={{ top: "s" }}>
                              <Box variant="small" fontWeight="bold">
                                Warnings/Errors:
                              </Box>
                              <Box variant="small" as="ul" padding={{ left: "l" }}>
                                {transactionImportErrors.slice(0, 10).map((err, idx) => (
                                  <li key={idx}>{err}</li>
                                ))}
                                {transactionImportErrors.length > 10 && (
                                  <li>... and {transactionImportErrors.length - 10} more</li>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Alert>
                      )
                    }
                  >
                    {transactionImportStatus === "error" && (
                      <Alert type="error" dismissible={false}>
                        {transactionImportMessage}
                        {transactionImportErrors.length > 0 && (
                          <Box margin={{ top: "s" }}>
                            <Box variant="small" as="ul" padding={{ left: "l" }}>
                              {transactionImportErrors.slice(0, 10).map((err, idx) => (
                                <li key={idx}>{err}</li>
                              ))}
                              {transactionImportErrors.length > 10 && (
                                <li>... and {transactionImportErrors.length - 10} more</li>
                              )}
                            </Box>
                          </Box>
                        )}
                      </Alert>
                    )}
                    <Box variant="p" margin={{ bottom: "m" }}>
                      Upload an Excel file (.xlsx or .xls) to bulk import transactions.
                      <br />
                      <strong>Required columns:</strong> Date, Narration, Account, Amount
                      <br />
                      <strong>Optional columns:</strong> Payee, Currency (defaults to INR), Category
                      (for categorization), Flag (*, !, or ?)
                    </Box>
                    <FileUpload
                      value={[]}
                      onChange={(e) => handleTransactionExcelUpload(e.detail.value)}
                      accept=".xlsx,.xls"
                      showFileLastModified
                      showFileSize
                      showFileThumbnail
                    />
                    <Box margin={{ top: "m" }} variant="small" color="text-body-secondary">
                      <Box fontWeight="bold">Excel Format:</Box>
                      <Box as="ul" padding={{ left: "l" }}>
                        <li>
                          <strong>Date:</strong> Transaction date in YYYY-MM-DD format
                        </li>
                        <li>
                          <strong>Payee:</strong> (Optional) Who you paid or received from
                        </li>
                        <li>
                          <strong>Narration:</strong> Description of the transaction
                        </li>
                        <li>
                          <strong>Account:</strong> Account name (e.g., Assets:Bank:Checking)
                        </li>
                        <li>
                          <strong>Amount:</strong> Positive for income, negative for expenses
                        </li>
                        <li>
                          <strong>Currency:</strong> (Optional) Currency code, defaults to INR
                        </li>
                        <li>
                          <strong>Category:</strong> (Optional) Category account for automatic
                          categorization
                        </li>
                        <li>
                          <strong>Flag:</strong> (Optional) Transaction flag (*, !, or ?)
                        </li>
                      </Box>
                    </Box>
                  </Container>
                </Grid>

                <Container
                  variant="stacked"
                  header={<Header variant="h2">Categorization Guide</Header>}
                >
                  <Box variant="p">
                    <strong>How categorization works:</strong>
                  </Box>
                  <Box as="ul" padding={{ left: "l" }}>
                    <li>
                      <strong>Positive amounts:</strong> If you provide a Category column, the
                      transaction will be categorized as Income. For example, if Account is
                      "Assets:Bank:Checking" and Category is "Income:Salary", it creates:
                      Income:Salary → Assets:Bank:Checking
                    </li>
                    <li>
                      <strong>Negative amounts:</strong> If you provide a Category column, the
                      transaction will be categorized as Expense. For example, if Account is
                      "Assets:Bank:Checking" and Category is "Expenses:Food", it creates:
                      Expenses:Food → Assets:Bank:Checking
                    </li>
                    <li>
                      <strong>Without Category:</strong> Transactions default to
                      "Income:Uncategorized" or "Expenses:Uncategorized" based on the amount sign
                    </li>
                    <li>
                      <strong>Account names:</strong> All account names are automatically
                      capitalized (e.g., "assets:bank" becomes "Assets:Bank")
                    </li>
                  </Box>
                </Container>
              </SpaceBetween>
            ),
          },
        ]}
      />

      <TransactionMappingModal
        visible={showMappingModal}
        file={mappingFile}
        previewData={previewData}
        onClose={() => {
          setShowMappingModal(false);
          setMappingFile(null);
          setPreviewData(null);
        }}
        onImport={handleMappedImport}
        loading={transactionImportStatus === "idle" && transactionImportMessage === ""}
      />
    </SpaceBetween>
  );
}
