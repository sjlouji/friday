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

export default function Import() {
  const { importFile, exportFile } = useBeancountStore();
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
    { text: 'Friday', href: '/' },
    { text: 'Import', href: '/import' },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Import beancount files or export your data"
      >
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
            Export your current data to a beancount file format that can be used
            with the beancount command-line tools or other beancount-compatible
            applications.
          </Box>
          <Button
            variant="primary"
            iconName="download"
            onClick={exportToBeancount}
          >
            Export to .beancount
          </Button>
        </Container>
      </Grid>

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
    </SpaceBetween>
  );
}
