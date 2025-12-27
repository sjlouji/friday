import { useState, useEffect } from "react";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Alert from "@cloudscape-design/components/alert";
import Tabs from "@cloudscape-design/components/tabs";
import { api } from "@/lib/api";
import { useSettings } from "@/hooks/useSettings";
import AppearanceTab from "../components/AppearanceTab";
import WorkspaceTab from "../components/WorkspaceTab";
import BookkeepingTab from "../components/BookkeepingTab";

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const [filePath, setFilePath] = useState(settings.beancountFilePath);
  const [activeTab, setActiveTab] = useState("appearance");
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(
    null
  );
  const [createStatus, setCreateStatus] = useState<"success" | "error" | null>(
    null
  );
  const [createMessage, setCreateMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setFilePath(settings.beancountFilePath);
  }, [settings.beancountFilePath]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name;
      alert(
        `Selected file: ${fileName}\n\nPlease enter the full path to this file in the input field above.\n\nExample: /Users/yourname/Documents/${fileName}`
      );
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleFilePathChange = (value: string) => {
    setFilePath(value);
  };

  const handleSave = async () => {
    if (!filePath.trim()) {
      setSaveStatus("error");
      return;
    }

    if (!filePath.includes("/") && !filePath.includes("\\")) {
      setSaveStatus("error");
      alert(
        "Please provide the full path to the file (e.g., /Users/username/Documents/ledger.beancount), not just the filename."
      );
      return;
    }

    updateSettings({ beancountFilePath: filePath });
    setSaveStatus("success");

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleCreateFile = async () => {
    if (!filePath.trim()) {
      setCreateStatus("error");
      setCreateMessage("Please provide a file path");
      return;
    }

    setIsCreating(true);
    setCreateStatus(null);
    setCreateMessage("");

    try {
      const result = await api.files.create(filePath);
      setCreateStatus("success");
      setCreateMessage(result.message || "File created successfully!");

      updateSettings({ beancountFilePath: filePath });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setCreateStatus("error");
      setCreateMessage(error.message || "Failed to create file");
    } finally {
      setIsCreating(false);
    }
  };

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: "Settings", href: "/settings" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Configure your Friday preferences"
        actions={
          <Button variant="primary" iconName="save" onClick={handleSave}>
            Save Settings
          </Button>
        }
      >
        Settings
      </Header>

      {saveStatus === "success" && (
        <Alert type="success" dismissible onDismiss={() => setSaveStatus(null)}>
          Settings saved successfully! Reloading...
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert type="error" dismissible onDismiss={() => setSaveStatus(null)}>
          Please provide a valid Beancount file path.
        </Alert>
      )}

      {createStatus === "success" && (
        <Alert
          type="success"
          dismissible
          onDismiss={() => setCreateStatus(null)}
        >
          {createMessage}
        </Alert>
      )}

      {createStatus === "error" && (
        <Alert type="error" dismissible onDismiss={() => setCreateStatus(null)}>
          {createMessage}
        </Alert>
      )}

      <Container
        variant="stacked"
        header={
          <Header
            variant="h2"
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <input
                  type="file"
                  accept=".beancount,.bean"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  id="file-input"
                />
                <Button
                  variant="normal"
                  iconName="folder-open"
                  onClick={() => {
                    const input = document.getElementById(
                      "file-input"
                    ) as HTMLInputElement;
                    input?.click();
                  }}
                >
                  Select File
                </Button>
                <Button
                  variant="normal"
                  iconName={isCreating ? undefined : "add-plus"}
                  onClick={handleCreateFile}
                  disabled={isCreating || !filePath.trim()}
                >
                  {isCreating ? "Creating..." : "Create New File"}
                </Button>
              </SpaceBetween>
            }
          >
            Beancount File
          </Header>
        }
      >
        <Form>
          <FormField
            label="Beancount File Path"
            description="Enter the full path to your Beancount ledger file or use 'Select File' to browse for one."
          >
            <Input
              value={filePath}
              onChange={(e) => handleFilePathChange(e.detail.value)}
              placeholder="/Users/username/Documents/ledger.beancount"
            />
          </FormField>
        </Form>
      </Container>

      <Tabs
        activeTabId={activeTab}
        onChange={({ detail }) => setActiveTab(detail.activeTabId)}
        tabs={[
          {
            label: "Appearance",
            id: "appearance",
            content: <AppearanceTab />,
          },
          {
            label: "Workspace",
            id: "workspace",
            content: <WorkspaceTab />,
          },
          {
            label: "Bookkeeping",
            id: "bookkeeping",
            content: <BookkeepingTab />,
          },
        ]}
      />
    </SpaceBetween>
  );
}
