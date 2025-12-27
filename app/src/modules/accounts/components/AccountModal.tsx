import { useState } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import Modal from "@cloudscape-design/components/modal";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Select from "@cloudscape-design/components/select";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import Alert from "@cloudscape-design/components/alert";
import Spinner from "@cloudscape-design/components/spinner";
import { Account, AccountType } from "@/types/beancount";

interface AccountModalProps {
  account: Account | null;
  onClose: () => void;
}

export default function AccountModal({ account, onClose }: AccountModalProps) {
  const { addAccount, updateAccount, loading } = useBeancountStore();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: account?.name || "",
    type: (account?.type || "Assets") as AccountType,
    openDate: account?.openDate || new Date().toISOString().split("T")[0],
    closeDate: account?.closeDate || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate account name format
    if (!formData.name || !formData.name.includes(":")) {
      setError(
        "Account name must use colon separators (e.g., Assets:Bank:Checking)"
      );
      return;
    }

    // Validate that account name parts are properly formatted
    const parts = formData.name.split(":");
    for (const part of parts) {
      if (!part.trim()) {
        setError(
          "Account name parts cannot be empty (e.g., Assets::Checking is invalid)"
        );
        return;
      }
    }

    const newAccount: Account = {
      name: formData.name,
      type: formData.type,
      openDate: formData.openDate,
      closeDate: formData.closeDate || undefined,
    };

    try {
      if (account) {
        await updateAccount(account.name, newAccount);
      } else {
        await addAccount(newAccount);
      }
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save account";
      setError(errorMessage);
    }
  };

  return (
    <Modal
      visible={true}
      onDismiss={onClose}
      header={account ? "Edit Account" : "New Account"}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner /> : account ? "Update" : "Create"} Account
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Form>
        <SpaceBetween direction="vertical" size="l">
          {error && (
            <Alert
              type="error"
              dismissible
              onDismiss={() => setError(null)}
              header="Error creating account"
            >
              {error}
            </Alert>
          )}

          <FormField
            label="Account Name"
            description="Account names must use colons and will be auto-capitalized (e.g., Assets:Bank:Checking)"
          >
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.detail.value })
              }
              placeholder="Assets:Bank:Checking"
            />
          </FormField>

          <FormField label="Account Type">
            <Select
              selectedOption={{ label: formData.type, value: formData.type }}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.detail.selectedOption.value as AccountType,
                })
              }
              options={[
                { label: "Assets", value: "Assets" },
                { label: "Liabilities", value: "Liabilities" },
                { label: "Equity", value: "Equity" },
                { label: "Income", value: "Income" },
                { label: "Expenses", value: "Expenses" },
                {
                  label: "GST Input (CGST/SGST/IGST)",
                  value: "Expenses:GST:Input",
                },
                {
                  label: "GST Output (CGST/SGST/IGST)",
                  value: "Income:GST:Output",
                },
              ]}
            />
          </FormField>

          <FormField label="Open Date">
            <Input
              type="date"
              value={formData.openDate}
              onChange={(e) =>
                setFormData({ ...formData, openDate: e.detail.value })
              }
            />
          </FormField>

          <FormField label="Close Date (optional)">
            <Input
              type="date"
              value={formData.closeDate}
              onChange={(e) =>
                setFormData({ ...formData, closeDate: e.detail.value })
              }
            />
          </FormField>
        </SpaceBetween>
      </Form>
    </Modal>
  );
}
