import { useState, useEffect } from "react";
import Modal from "@cloudscape-design/components/modal";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Select from "@cloudscape-design/components/select";
import Input from "@cloudscape-design/components/input";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import Table from "@cloudscape-design/components/table";
import Alert from "@cloudscape-design/components/alert";
import Spinner from "@cloudscape-design/components/spinner";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";

interface TransactionMappingModalProps {
  visible: boolean;
  file: File | null;
  previewData: {
    columns: string[];
    preview: any[];
    totalRows: number;
    fileName: string;
  } | null;
  onClose: () => void;
  onImport: (mapping: Record<string, string>, defaults: { currency: string; flag: string }) => Promise<void>;
  loading?: boolean;
}

const REQUIRED_FIELDS = ["date", "narration", "account", "amount"];
const OPTIONAL_FIELDS = ["payee", "currency", "category", "flag"];

export default function TransactionMappingModal({
  visible,
  file,
  previewData,
  onClose,
  onImport,
  loading = false,
}: TransactionMappingModalProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [defaultCurrency, setDefaultCurrency] = useState("INR");
  const [defaultFlag, setDefaultFlag] = useState("*");
  const [error, setError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);

  useEffect(() => {
    if (previewData) {
      setPreviewRows(previewData.preview || []);
      
      // Auto-detect column mappings
      const autoMapping: Record<string, string> = {};
      const columns = previewData.columns.map((col) => col.toLowerCase());
      
      // Try to auto-detect
      columns.forEach((col, idx) => {
        const originalCol = previewData.columns[idx];
        if (col.includes("date") || col.includes("transaction date")) {
          autoMapping["date"] = originalCol;
        } else if (col.includes("narration") || col.includes("description") || col.includes("memo") || col.includes("note")) {
          autoMapping["narration"] = originalCol;
        } else if (col.includes("account") && !col.includes("category")) {
          autoMapping["account"] = originalCol;
        } else if (col.includes("amount") || col.includes("value") || col.includes("total")) {
          autoMapping["amount"] = originalCol;
        } else if (col.includes("payee") || col.includes("merchant") || col.includes("vendor")) {
          autoMapping["payee"] = originalCol;
        } else if (col.includes("currency") || col.includes("curr")) {
          autoMapping["currency"] = originalCol;
        } else if (col.includes("category") || col.includes("type") || col.includes("class")) {
          autoMapping["category"] = originalCol;
        } else if (col.includes("flag") || col.includes("status")) {
          autoMapping["flag"] = originalCol;
        }
      });
      
      setMapping(autoMapping);
    }
  }, [previewData]);

  const handleMappingChange = (field: string, column: string | null) => {
    setMapping((prev) => {
      const newMapping = { ...prev };
      if (column) {
        newMapping[field] = column;
      } else {
        delete newMapping[field];
      }
      return newMapping;
    });
  };

  const handleImport = async () => {
    setError(null);
    
    // Validate required fields
    const missingFields = REQUIRED_FIELDS.filter((field) => !mapping[field]);
    if (missingFields.length > 0) {
      setError(`Please map the following required fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      await onImport(mapping, { currency: defaultCurrency, flag: defaultFlag });
    } catch (err: any) {
      setError(err.message || "Failed to import transactions");
    }
  };

  const columnOptions = previewData?.columns.map((col) => ({ label: col, value: col })) || [];
  const noneOption = { label: "None", value: "" };

  return (
    <Modal
      visible={visible}
      onDismiss={onClose}
      header="Map Columns to Transaction Fields"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={loading || !file}
            >
              {loading ? <Spinner /> : "Import Transactions"}
            </Button>
          </SpaceBetween>
        </Box>
      }
      size="large"
    >
      <Form>
        <SpaceBetween direction="vertical" size="l">
          {error && (
            <Alert type="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {previewData && (
            <Box>
              <Box variant="h3" margin={{ bottom: "s" }}>
                File: {previewData.fileName}
              </Box>
              <Box variant="small" color="text-body-secondary">
                {previewData.totalRows} row(s) found. Showing first {previewData.preview.length} rows.
              </Box>
            </Box>
          )}

          <Container variant="stacked" header={<Header variant="h2">Column Mapping</Header>}>
            <SpaceBetween direction="vertical" size="m">
              <Box variant="small" color="text-body-secondary">
                Map your file columns to transaction fields. Required fields are marked with *.
              </Box>

              {REQUIRED_FIELDS.map((field) => (
                <FormField
                  key={field}
                  label={
                    <span>
                      {field.charAt(0).toUpperCase() + field.slice(1)} <strong>*</strong>
                    </span>
                  }
                  description={
                    field === "date"
                      ? "Transaction date"
                      : field === "narration"
                      ? "Description of the transaction"
                      : field === "account"
                      ? "Account name (e.g., Assets:Bank:Checking)"
                      : field === "amount"
                      ? "Transaction amount (positive for income, negative for expenses)"
                      : ""
                  }
                >
                  <Select
                    selectedOption={
                      mapping[field]
                        ? { label: mapping[field], value: mapping[field] }
                        : null
                    }
                    onChange={(e) =>
                      handleMappingChange(field, e.detail.selectedOption.value || null)
                    }
                    options={columnOptions}
                    placeholder="Select column"
                  />
                </FormField>
              ))}

              {OPTIONAL_FIELDS.map((field) => (
                <FormField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  description={
                    field === "payee"
                      ? "Who you paid or received from"
                      : field === "currency"
                      ? "Currency code (if not in file, use default below)"
                      : field === "category"
                      ? "Category account for categorization"
                      : field === "flag"
                      ? "Transaction flag (*, !, or ?)"
                      : ""
                  }
                >
                  <Select
                    selectedOption={
                      mapping[field]
                        ? { label: mapping[field], value: mapping[field] }
                        : noneOption
                    }
                    onChange={(e) =>
                      handleMappingChange(
                        field,
                        e.detail.selectedOption.value && e.detail.selectedOption.value !== ""
                          ? e.detail.selectedOption.value
                          : null
                      )
                    }
                    options={[noneOption, ...columnOptions]}
                    placeholder="Select column (optional)"
                  />
                </FormField>
              ))}

              <FormField label="Default Currency" description="Used when currency column is not mapped">
                <Input
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.detail.value)}
                  placeholder="INR"
                />
              </FormField>

              <FormField label="Default Flag" description="Transaction flag when not mapped (*, !, or ?)">
                <Select
                  selectedOption={{ label: defaultFlag === "*" ? "* (Cleared)" : defaultFlag === "!" ? "! (Pending)" : "? (Uncertain)", value: defaultFlag }}
                  onChange={(e) => setDefaultFlag(e.detail.selectedOption.value || "*")}
                  options={[
                    { label: "* (Cleared)", value: "*" },
                    { label: "! (Pending)", value: "!" },
                    { label: "? (Uncertain)", value: "?" },
                  ]}
                />
              </FormField>
            </SpaceBetween>
          </Container>

          {previewRows.length > 0 && (
            <Container variant="stacked" header={<Header variant="h2">Preview (First 5 Rows)</Header>}>
              <Table
                columnDefinitions={previewData?.columns.map((col) => ({
                  id: col,
                  header: col,
                  cell: (item: any) => String(item[col] || ""),
                })) || []}
                items={previewRows.slice(0, 5)}
                empty="No preview data available"
              />
            </Container>
          )}
        </SpaceBetween>
      </Form>
    </Modal>
  );
}

