import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Tabs from "@cloudscape-design/components/tabs";
import Spinner from "@cloudscape-design/components/spinner";
import { useSettings } from "@/hooks/useSettings";
import { useBeancountStore } from "@/store/beancountStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import AppearanceTab from "../components/AppearanceTab";
import WorkspaceTab from "../components/WorkspaceTab";
import BookkeepingTab from "../components/BookkeepingTab";

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { loadAll } = useBeancountStore();
  const [filePath, setFilePath] = useState(settings.beancountFilePath);
  const [activeTab, setActiveTab] = useState("appearance");
  const filePathInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFilePath(settings.beancountFilePath);
  }, [settings.beancountFilePath]);

  const saveFilePath = useCallback(
    async (path: string) => {
      if (!path.trim()) {
        return;
      }

      const trimmedPath = path.trim();

      if (!trimmedPath.includes("/") && !trimmedPath.includes("\\")) {
        return;
      }

      if (trimmedPath.includes("T") && trimmedPath.match(/\d{4}-\d{2}-\d{2}T\d{2}[:_]\d{2}/)) {
        console.warn(
          "File path appears to contain a timestamp. This is likely invalid:",
          trimmedPath
        );
      }

      updateSettings({ beancountFilePath: trimmedPath });

      try {
        await loadAll();
      } catch (error: unknown) {
        console.error("Failed to load data after saving file path:", error);
        throw error;
      }
    },
    [updateSettings, loadAll]
  );

  const { isSaving: isSavingFilePath, error: filePathError } = useAutoSave(
    filePath,
    saveFilePath,
    1000
  );

  const handleFilePathChange = (value: string) => {
    setFilePath(value);
  };

  const handleClearFilePath = () => {
    setFilePath("");
    updateSettings({ beancountFilePath: "" });
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
          <SpaceBetween direction="horizontal" size="xs">
            {isSavingFilePath && (
              <Box>
                <Spinner size="normal" />
              </Box>
            )}
            {filePathError && (
              <Alert type="error" dismissible>
                Failed to save file path: {filePathError.message}
              </Alert>
            )}
          </SpaceBetween>
        }
      >
        Settings
      </Header>

      <Container
        variant="stacked"
        header={
          <Header
            variant="h2"
            actions={
              filePath ? (
                <Button
                  iconName="close"
                  variant="icon"
                  onClick={handleClearFilePath}
                  ariaLabel="Clear file path"
                />
              ) : undefined
            }
          >
            Beancount File
          </Header>
        }
      >
        <Form>
          <FormField
            label="Beancount File Path"
            description="Enter the full path to your Beancount ledger file."
            secondaryControl={
              filePath ? (
                <Button
                  iconName="close"
                  variant="icon"
                  onClick={handleClearFilePath}
                  ariaLabel="Clear file path"
                />
              ) : undefined
            }
            constraintText={
              <Box variant="small" color="text-body-secondary">
                To create a new Beancount file, create it manually using a text editor and then
                enter its path here.
                <br />
                Example: Create a file named <code>ledger.beancount</code> in your Documents folder,
                then enter the path <code>~/Documents/ledger.beancount</code> or{" "}
                <code>/Users/username/Documents/ledger.beancount</code>.
              </Box>
            }
          >
            <Input
              ref={filePathInputRef}
              value={filePath}
              onChange={(e) => handleFilePathChange(e.detail.value)}
              placeholder="/Users/username/Documents/ledger.beancount or ~/Documents/ledger.beancount"
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
