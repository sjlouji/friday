import { useState, useEffect, useCallback, useRef } from "react";
import { useFilePicker } from "use-file-picker";
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
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    show: boolean;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [browserPath, setBrowserPath] = useState("");
  const [browserItems, setBrowserItems] = useState<
    Array<{ name: string; type: string; path: string }>
  >([]);
  const [isLoadingBrowser, setIsLoadingBrowser] = useState(false);
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

  const loadBrowserDirectory = useCallback(async (path: string = "") => {
    setIsLoadingBrowser(true);
    try {
      const result = await api.files.browse(path);
      setBrowserItems(result.items || []);
      setBrowserPath(path);
    } catch (error) {
      console.error("Error browsing directory:", error);
      setBrowserItems([]);
    } finally {
      setIsLoadingBrowser(false);
    }
  }, []);

  const handleSelectFile = async () => {
    if ("showOpenFilePicker" in window) {
      try {
        setIsSelecting(true);
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

          let filePath = "";

          try {
            interface FileHandleWithParent extends FileSystemFileHandle {
              getParent?: () => Promise<FileSystemDirectoryHandle>;
            }

            const handleWithParent = fileHandle as FileHandleWithParent;

            if (handleWithParent.getParent && typeof handleWithParent.getParent === "function") {
              const dirHandle = await handleWithParent.getParent();
              const dirName = dirHandle.name;

              const pathParts: string[] = [dirName];
              let currentHandle: FileSystemDirectoryHandle | null = dirHandle;
              let depth = 0;
              const maxDepth = 20;

              while (currentHandle && depth < maxDepth) {
                try {
                  const dirHandleWithParent = currentHandle as FileSystemDirectoryHandle & {
                    getParent?: () => Promise<FileSystemDirectoryHandle>;
                  };
                  if (dirHandleWithParent.getParent) {
                    const parent = await dirHandleWithParent.getParent();
                    if (parent && parent.name) {
                      pathParts.unshift(parent.name);
                      currentHandle = parent;
                      depth++;
                    } else {
                      break;
                    }
                  } else {
                    break;
                  }
                } catch {
                  break;
                }
              }

              if (pathParts.length > 0) {
                const isWindows = navigator.platform.toLowerCase().includes("win");
                if (isWindows) {
                  const fullPath = pathParts.join("\\") + "\\" + fileName;
                  filePath = fullPath;
                } else {
                  const fullPath = "/" + pathParts.join("/") + "/" + fileName;
                  filePath = fullPath;
                }
              }
            }
          } catch (pathError) {
            console.warn("Could not determine full file path:", pathError);
          }

          if (!filePath) {
            const isWindows = navigator.platform.toLowerCase().includes("win");
            const homeDir = isWindows ? "C:\\Users\\YourName" : "~";
            filePath = `${homeDir}/${fileName}`;
          }

          setFilePath(filePath);
          setFileInfo({
            name: fileName,
            show: true,
          });
        }
      } catch (error: unknown) {
        const err = error as { name?: string; message?: string };
        if (err.name !== "AbortError") {
          console.error("Error selecting file:", error);
          setShowFileBrowser(true);
          loadBrowserDirectory();
        }
      } finally {
        setIsSelecting(false);
      }
    } else {
      setShowFileBrowser(true);
      loadBrowserDirectory();
    }
  };

  const handleBrowserItemClick = (item: { name: string; type: string; path: string }) => {
    if (item.type === "directory") {
      loadBrowserDirectory(item.path);
    } else if (item.name.endsWith(".beancount") || item.name.endsWith(".bean")) {
      setFilePath(item.path);
      setFileInfo({
        name: item.name,
        show: true,
      });
      setShowFileBrowser(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (event.target) {
        event.target.value = "";
      }
      return;
    }

    setIsSelecting(true);
    setFileInfo(null);

    try {
      const fileName = file.name;

      setFileInfo({
        name: fileName,
        show: true,
      });

      const isWindows = navigator.platform.toLowerCase().includes("win");
      const homeDir = isWindows ? "C:\\Users\\YourName" : "~";
      const suggestedPath = `${homeDir}/${fileName}`;

      setFilePath(suggestedPath);
    } catch (error: unknown) {
      console.error("Error processing file selection:", error);
    } finally {
      setIsSelecting(false);
      if (event.target) {
        event.target.value = "";
      }
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
              {filePath
                ? "The file path has been filled in the input field below. Please verify it's correct and adjust if needed."
                : "Please enter the full path to this file in the input field below (e.g., /Users/username/Documents/ledger.beancount)."}
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
                  onClick={handleSelectFile}
                  disabled={isSelecting}
                >
                  {isSelecting ? "Processing..." : "Select File"}
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
            constraintText={
              <Box variant="small" color="text-body-secondary">
                To create a new Beancount file, create it manually using a text editor and then
                select it here.
                <br />
                Example: Create a file named <code>ledger.beancount</code> in your Documents folder,
                then enter the path <code>~/Documents/ledger.beancount</code> or use the "Select
                File" button.
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

      {showFileBrowser && (
        <Modal
          visible={showFileBrowser}
          onDismiss={() => setShowFileBrowser(false)}
          header="Select Beancount File"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setShowFileBrowser(false)}>
                  Cancel
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <SpaceBetween size="l">
            <Box>
              <Box variant="small" color="text-body-secondary" margin={{ bottom: "s" }}>
                Current directory: <code>{browserPath || "~"}</code>
              </Box>
              {browserPath && (
                <Button
                  variant="link"
                  iconName="arrow-left"
                  onClick={() => {
                    const parentPath = browserPath.split("/").slice(0, -1).join("/");
                    loadBrowserDirectory(parentPath || "");
                  }}
                >
                  Go Up
                </Button>
              )}
            </Box>

            {isLoadingBrowser ? (
              <Box textAlign="center" padding="xl">
                <Spinner size="large" />
              </Box>
            ) : (
              <Box>
                {browserItems.length === 0 ? (
                  <Box textAlign="center" padding="xl" color="text-body-secondary">
                    No items found
                  </Box>
                ) : (
                  <SpaceBetween size="xs">
                    {browserItems.map((item) => (
                      <Button
                        key={item.path}
                        variant="link"
                        iconName={item.type === "directory" ? "folder" : "file"}
                        onClick={() => handleBrowserItemClick(item)}
                        fullWidth
                      >
                        {item.name}
                      </Button>
                    ))}
                  </SpaceBetween>
                )}
              </Box>
            )}
          </SpaceBetween>
        </Modal>
      )}
    </SpaceBetween>
  );
}
