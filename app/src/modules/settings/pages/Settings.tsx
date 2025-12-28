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
import { api } from "@/lib/api";
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
  const [createStatus, setCreateStatus] = useState<"success" | "error" | null>(null);
  const [createMessage, setCreateMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    show: boolean;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const filePathInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFilePath(settings.beancountFilePath);
  }, [settings.beancountFilePath]);

  const saveFilePath = useCallback(
    async (path: string) => {
      if (!path.trim()) {
        return;
      }

      if (!path.includes("/") && !path.includes("\\")) {
        return;
      }

      updateSettings({ beancountFilePath: path });

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (event.target) {
        event.target.value = "";
      }
      return;
    }

    setIsUploading(true);
    setFileInfo(null);

    try {
      const fileName = file.name;
      const isWindows = navigator.platform.toLowerCase().includes("win");
      const homeDir = isWindows ? "C:\\Users\\YourName" : "~";
      const suggestedPath = `${homeDir}/Documents/${fileName}`;

      setFilePath(suggestedPath);
      setFileInfo({
        name: fileName,
        show: true,
      });

      setCreateStatus(null);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setFileInfo({
        name: file.name,
        show: true,
      });
      setCreateStatus("error");
      setCreateMessage(err.message || "Failed to process file");
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleSelectFileWithAPI = async () => {
    if (!("showOpenFilePicker" in window)) {
      const input = document.getElementById("file-input") as HTMLInputElement;
      input?.click();
      return;
    }

    try {
      setIsUploading(true);
      setFileInfo(null);

      const fileHandles = await (
        window as { showOpenFilePicker?: (options: unknown) => Promise<FileSystemFileHandle[]> }
      ).showOpenFilePicker?.({
        types: [
          {
            description: "Beancount files",
            accept: {
              "text/plain": [".beancount", ".bean"],
            },
          },
        ],
        multiple: false,
      });

      if (fileHandles && fileHandles.length > 0) {
        const fileHandle = fileHandles[0];
        const file = await fileHandle.getFile();
        const fileName = file.name;

        const isWindows = navigator.platform.toLowerCase().includes("win");
        const homeDir = isWindows ? "C:\\Users\\YourName" : "~";
        const suggestedPath = `${homeDir}/Documents/${fileName}`;

        setFilePath(suggestedPath);
        setFileInfo({
          name: fileName,
          show: true,
        });
      }
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (err.name !== "AbortError") {
        setCreateStatus("error");
        setCreateMessage(err.message || "Failed to select file");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFilePathChange = (value: string) => {
    setFilePath(value);
  };

  const handleClearFilePath = () => {
    setFilePath("");
    updateSettings({ beancountFilePath: "" });
    setFileInfo(null);
  };

  const handleCreateFile = async () => {
    let targetPath = filePath.trim();

    if (!targetPath) {
      try {
        if ("showDirectoryPicker" in window) {
          const dirHandle = await (window as any).showDirectoryPicker({
            mode: "readwrite",
          });
          const dirName = dirHandle.name;
          const isWindows = navigator.platform.toLowerCase().includes("win");
          const homeDir = isWindows ? "C:\\Users\\YourName" : "~";
          targetPath = `${homeDir}/${dirName}/ledger.beancount`;
        } else {
          setCreateStatus("error");
          setCreateMessage(
            "Directory picker is not supported in your browser. Please enter a full file path manually in the input field below."
          );
          setTimeout(() => {
            filePathInputRef.current?.focus();
            filePathInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
          return;
        }
      } catch (error: unknown) {
        const err = error as { name?: string; message?: string };
        if (err.name !== "AbortError") {
          setCreateStatus("error");
          setCreateMessage(
            err.message ||
              "Failed to select directory. Please enter a full file path manually in the input field above."
          );
        }
        return;
      }
    }

    if (!targetPath.includes("/") && !targetPath.includes("\\")) {
      setCreateStatus("error");
      setCreateMessage(
        "Please provide the full path to the file (e.g., /Users/username/Documents/ledger.beancount), not just the filename."
      );
      return;
    }

    setIsCreating(true);
    setCreateStatus(null);
    setCreateMessage("");

    try {
      const result = await api.files.create(targetPath);
      setCreateStatus("success");
      setCreateMessage(result.message || "File created successfully!");

      setFilePath(targetPath);
      updateSettings({ beancountFilePath: targetPath });

      try {
        await loadAll();
      } catch (error: unknown) {
        console.error("Failed to load data after creating file:", error);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setCreateStatus("error");
      setCreateMessage(err.message || "Failed to create file");
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

      {createStatus === "success" && (
        <Alert type="success" dismissible onDismiss={() => setCreateStatus(null)}>
          {createMessage}
        </Alert>
      )}

      {createStatus === "error" && (
        <Alert
          type="error"
          dismissible
          onDismiss={() => setCreateStatus(null)}
          action={
            createMessage.includes("Directory picker is not supported") ? (
              <Button
                variant="link"
                onClick={() => {
                  filePathInputRef.current?.focus();
                  filePathInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                Go to input field
              </Button>
            ) : undefined
          }
        >
          {createMessage}
          {createMessage.includes("Directory picker is not supported") && (
            <Box variant="small" color="text-body-secondary" margin={{ top: "xs" }}>
              <Box fontWeight="bold">Examples:</Box>
              <Box padding={{ left: "l" }} margin={{ top: "xs" }}>
                <Box>
                  • <code>/Users/username/Documents/ledger.beancount</code> (absolute path)
                </Box>
                <Box>
                  • <code>~/Documents/ledger.beancount</code> (home directory shortcut)
                </Box>
              </Box>
            </Box>
          )}
        </Alert>
      )}

      {fileInfo?.show && (
        <Alert
          type="success"
          dismissible
          onDismiss={() => setFileInfo(null)}
          header="File Selected"
        >
          <SpaceBetween direction="vertical" size="xs">
            <Box>
              <strong>Selected file:</strong> {fileInfo.name}
            </Box>
            <Box variant="small" color="text-body-secondary">
              A suggested path has been filled in the input field below. The path will be saved
              automatically.
            </Box>
          </SpaceBetween>
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
                  onClick={handleSelectFileWithAPI}
                  disabled={isUploading}
                >
                  {isUploading ? "Processing..." : "Select File"}
                </Button>
                <Button
                  variant="normal"
                  iconName={isCreating ? undefined : "add-plus"}
                  onClick={handleCreateFile}
                  disabled={isCreating}
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
