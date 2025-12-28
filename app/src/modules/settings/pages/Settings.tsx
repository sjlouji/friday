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
import { useTranslation } from "@/hooks/useTranslation";
import AppearanceTab from "../components/AppearanceTab";
import WorkspaceTab from "../components/WorkspaceTab";
import BookkeepingTab from "../components/BookkeepingTab";

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { loadAll } = useBeancountStore();
  const { t } = useTranslation();
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
    { text: t("settings.title"), href: "/settings" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description={t("settings.description")}
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
        {t("settings.title")}
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
                  ariaLabel={t("common.clear")}
                />
              ) : undefined
            }
          >
            {t("settings.beancountFile.title")}
          </Header>
        }
      >
        <Form>
          <FormField
            label={t("settings.beancountFile.filePath")}
            description={t("settings.beancountFile.filePathDescription")}
            secondaryControl={
              filePath ? (
                <Button
                  iconName="close"
                  variant="icon"
                  onClick={handleClearFilePath}
                  ariaLabel={t("common.clear")}
                />
              ) : undefined
            }
            constraintText={
              <Box variant="small" color="text-body-secondary">
                {t("settings.beancountFile.filePathHint")}
                <br />
                {t("settings.beancountFile.filePathExample")}
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
            label: t("settings.appearance.title"),
            id: "appearance",
            content: <AppearanceTab />,
          },
          {
            label: t("settings.workspace.title"),
            id: "workspace",
            content: <WorkspaceTab />,
          },
          {
            label: t("settings.bookkeeping.title"),
            id: "bookkeeping",
            content: <BookkeepingTab />,
          },
        ]}
      />
    </SpaceBetween>
  );
}
