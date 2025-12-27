import Container from "@cloudscape-design/components/container";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Select from "@cloudscape-design/components/select";
import Toggle from "@cloudscape-design/components/toggle";
import Input from "@cloudscape-design/components/input";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Header from "@cloudscape-design/components/header";
import { useSettingsStore } from "@/store/settingsStore";

export default function BookkeepingTab() {
  const { settings, updateBookkeeping } = useSettingsStore();
  const { account, importExport, beancount } = settings.bookkeeping;

  return (
    <SpaceBetween size="l">
      <Container
        variant="stacked"
        header={<Header variant="h2">Account Settings</Header>}
      >
        <Form>
          <SpaceBetween size="l">
            <FormField
              label="Account Journal Include Children"
              description="Include child accounts in journal view"
            >
              <Toggle
                checked={account.accountJournalIncludeChildren}
                onChange={(e) =>
                  updateBookkeeping({
                    account: {
                      ...account,
                      accountJournalIncludeChildren: e.detail.checked,
                    },
                  })
                }
              >
                Include child accounts
              </Toggle>
            </FormField>

            <FormField label="Account Name Separator">
              <Input
                value={account.accountNameSeparator}
                onChange={(e) =>
                  updateBookkeeping({
                    account: {
                      ...account,
                      accountNameSeparator: e.detail.value,
                    },
                  })
                }
                placeholder=":"
              />
            </FormField>

            <FormField label="Default Account Types">
              <SpaceBetween direction="vertical" size="m">
                <FormField label="Assets">
                  <Input
                    value={account.defaultAccountTypes.assets}
                    onChange={(e) =>
                      updateBookkeeping({
                        account: {
                          ...account,
                          defaultAccountTypes: {
                            ...account.defaultAccountTypes,
                            assets: e.detail.value,
                          },
                        },
                      })
                    }
                  />
                </FormField>
                <FormField label="Liabilities">
                  <Input
                    value={account.defaultAccountTypes.liabilities}
                    onChange={(e) =>
                      updateBookkeeping({
                        account: {
                          ...account,
                          defaultAccountTypes: {
                            ...account.defaultAccountTypes,
                            liabilities: e.detail.value,
                          },
                        },
                      })
                    }
                  />
                </FormField>
                <FormField label="Equity">
                  <Input
                    value={account.defaultAccountTypes.equity}
                    onChange={(e) =>
                      updateBookkeeping({
                        account: {
                          ...account,
                          defaultAccountTypes: {
                            ...account.defaultAccountTypes,
                            equity: e.detail.value,
                          },
                        },
                      })
                    }
                  />
                </FormField>
                <FormField label="Income">
                  <Input
                    value={account.defaultAccountTypes.income}
                    onChange={(e) =>
                      updateBookkeeping({
                        account: {
                          ...account,
                          defaultAccountTypes: {
                            ...account.defaultAccountTypes,
                            income: e.detail.value,
                          },
                        },
                      })
                    }
                  />
                </FormField>
                <FormField label="Expenses">
                  <Input
                    value={account.defaultAccountTypes.expenses}
                    onChange={(e) =>
                      updateBookkeeping({
                        account: {
                          ...account,
                          defaultAccountTypes: {
                            ...account.defaultAccountTypes,
                            expenses: e.detail.value,
                          },
                        },
                      })
                    }
                  />
                </FormField>
              </SpaceBetween>
            </FormField>

            <FormField label="Account Current Conversions">
              <Input
                value={account.accountCurrentConversions}
                onChange={(e) =>
                  updateBookkeeping({
                    account: {
                      ...account,
                      accountCurrentConversions: e.detail.value,
                    },
                  })
                }
                placeholder="Conversions:Current"
              />
            </FormField>

            <FormField label="Account Current Earnings">
              <Input
                value={account.accountCurrentEarnings}
                onChange={(e) =>
                  updateBookkeeping({
                    account: {
                      ...account,
                      accountCurrentEarnings: e.detail.value,
                    },
                  })
                }
                placeholder="Earnings:Current"
              />
            </FormField>

            <FormField label="Account Previous Balances">
              <Input
                value={account.accountPreviousBalances}
                onChange={(e) =>
                  updateBookkeeping({
                    account: {
                      ...account,
                      accountPreviousBalances: e.detail.value,
                    },
                  })
                }
                placeholder="Opening-Balances"
              />
            </FormField>

            <FormField label="Account Previous Conversions">
              <Input
                value={account.accountPreviousConversions}
                onChange={(e) =>
                  updateBookkeeping({
                    account: {
                      ...account,
                      accountPreviousConversions: e.detail.value,
                    },
                  })
                }
                placeholder="Conversions:Previous"
              />
            </FormField>

            <FormField label="Account Previous Earnings">
              <Input
                value={account.accountPreviousEarnings}
                onChange={(e) =>
                  updateBookkeeping({
                    account: {
                      ...account,
                      accountPreviousEarnings: e.detail.value,
                    },
                  })
                }
                placeholder="Earnings:Previous"
              />
            </FormField>

            <FormField label="Account Unrealized Gains">
              <Input
                value={account.accountUnrealizedGains}
                onChange={(e) =>
                  updateBookkeeping({
                    account: {
                      ...account,
                      accountUnrealizedGains: e.detail.value,
                    },
                  })
                }
                placeholder="Earnings:Unrealized"
              />
            </FormField>

            <FormField label="Account Rounding">
              <Input
                value={account.accountRounding || ""}
                onChange={(e) =>
                  updateBookkeeping({
                    account: {
                      ...account,
                      accountRounding: e.detail.value || null,
                    },
                  })
                }
                placeholder="Leave empty for none"
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Container>

      <Container
        variant="stacked"
        header={<Header variant="h2">Import & Export Settings</Header>}
      >
        <Form>
          <SpaceBetween size="l">
            <FormField
              label="Import Config"
              description="Path to import configuration file"
            >
              <Input
                value={importExport.importConfig || ""}
                onChange={(e) =>
                  updateBookkeeping({
                    importExport: {
                      ...importExport,
                      importConfig: e.detail.value || null,
                    },
                  })
                }
                placeholder="Leave empty for none"
              />
            </FormField>

            <FormField
              label="Import Directories"
              description="Comma-separated list of directories to import from"
            >
              <Input
                value={importExport.importDirs.join(", ")}
                onChange={(e) =>
                  updateBookkeeping({
                    importExport: {
                      ...importExport,
                      importDirs: e.detail.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0),
                    },
                  })
                }
                placeholder="dir1, dir2, dir3"
              />
            </FormField>

            <FormField
              label="Insert Entry"
              description="Entries to insert automatically"
            >
              <Input
                value={importExport.insertEntry.join(", ")}
                onChange={(e) =>
                  updateBookkeeping({
                    importExport: {
                      ...importExport,
                      insertEntry: e.detail.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0),
                    },
                  })
                }
                placeholder="entry1, entry2"
              />
            </FormField>

            <FormField
              label="Collapse Pattern"
              description="Patterns to collapse in display"
            >
              <Input
                value={importExport.collapsePattern.join(", ")}
                onChange={(e) =>
                  updateBookkeeping({
                    importExport: {
                      ...importExport,
                      collapsePattern: e.detail.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0),
                    },
                  })
                }
                placeholder="pattern1, pattern2"
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Container>

      <Container
        variant="stacked"
        header={<Header variant="h2">Beancount Core Settings</Header>}
      >
        <Form>
          <SpaceBetween size="l">
            <FormField label="Booking Method">
              <Select
                selectedOption={{
                  label: beancount.bookingMethod,
                  value: beancount.bookingMethod,
                }}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      bookingMethod: e.detail.selectedOption.value || "STRICT",
                    },
                  })
                }
                options={[
                  { label: "STRICT", value: "STRICT" },
                  { label: "NONE", value: "NONE" },
                  { label: "FIFO", value: "FIFO" },
                  { label: "LIFO", value: "LIFO" },
                  { label: "AVERAGE", value: "AVERAGE" },
                ]}
              />
            </FormField>

            <FormField
              label="Allow Deprecated None for Tags and Links"
              description="Allow None values for tags and links (deprecated)"
            >
              <Toggle
                checked={beancount.allowDeprecatedNoneForTagsAndLinks}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      allowDeprecatedNoneForTagsAndLinks: e.detail.checked,
                    },
                  })
                }
              >
                Allow deprecated None
              </Toggle>
            </FormField>

            <FormField
              label="Allow Pipe Separator"
              description="Allow pipe (|) as separator in account names"
            >
              <Toggle
                checked={beancount.allowPipeSeparator}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      allowPipeSeparator: e.detail.checked,
                    },
                  })
                }
              >
                Allow pipe separator
              </Toggle>
            </FormField>

            <FormField
              label="Commodities"
              description="Comma-separated list of commodities"
            >
              <Input
                value={beancount.commodities.join(", ")}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      commodities: e.detail.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0),
                    },
                  })
                }
                placeholder="USD, EUR, INR"
              />
            </FormField>

            <FormField
              label="Filename"
              description="Path to the main Beancount file"
            >
              <Input
                value={beancount.filename}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      filename: e.detail.value,
                    },
                  })
                }
                placeholder="/path/to/file.beancount"
              />
            </FormField>

            <FormField
              label="Include Files"
              description="Comma-separated list of files to include"
            >
              <Input
                value={beancount.include.join(", ")}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      include: e.detail.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0),
                    },
                  })
                }
                placeholder="file1.beancount, file2.beancount"
              />
            </FormField>

            <FormField
              label="Infer Tolerance From Cost"
              description="Automatically infer tolerance from cost basis"
            >
              <Toggle
                checked={beancount.inferToleranceFromCost}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      inferToleranceFromCost: e.detail.checked,
                    },
                  })
                }
              >
                Infer tolerance from cost
              </Toggle>
            </FormField>

            <FormField
              label="Inferred Tolerance Multiplier"
              description="Multiplier for inferred tolerance"
            >
              <Input
                type="number"
                step="0.1"
                value={beancount.inferredToleranceMultiplier.toString()}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      inferredToleranceMultiplier:
                        parseFloat(e.detail.value) || 0.5,
                    },
                  })
                }
              />
            </FormField>

            <FormField
              label="Long String Max Lines"
              description="Maximum lines for long strings"
            >
              <Input
                type="number"
                value={beancount.longStringMaxlines.toString()}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      longStringMaxlines: parseInt(e.detail.value) || 64,
                    },
                  })
                }
              />
            </FormField>

            <FormField
              label="Plugins"
              description="Comma-separated list of plugins to load"
            >
              <Input
                value={beancount.plugin.join(", ")}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      plugin: e.detail.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0),
                    },
                  })
                }
                placeholder="plugin1, plugin2"
              />
            </FormField>

            <FormField label="Plugin Processing Mode">
              <Select
                selectedOption={{
                  label: beancount.pluginProcessingMode,
                  value: beancount.pluginProcessingMode,
                }}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      pluginProcessingMode:
                        e.detail.selectedOption.value || "default",
                    },
                  })
                }
                options={[
                  { label: "default", value: "default" },
                  { label: "raw", value: "raw" },
                ]}
              />
            </FormField>

            <FormField
              label="Python Path"
              description="Comma-separated list of Python paths"
            >
              <Input
                value={beancount.pythonpath.join(", ")}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      pythonpath: e.detail.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0),
                    },
                  })
                }
                placeholder="/path1, /path2"
              />
            </FormField>

            <FormField
              label="Render Commas"
              description="Render commas in numbers"
            >
              <Toggle
                checked={beancount.renderCommas}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      renderCommas: e.detail.checked,
                    },
                  })
                }
              >
                Render commas
              </Toggle>
            </FormField>

            <FormField label="Title" description="Title of the ledger">
              <Input
                value={beancount.title}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      title: e.detail.value,
                    },
                  })
                }
                placeholder="My Ledger"
              />
            </FormField>

            <FormField
              label="Tolerance Multiplier"
              description="Multiplier for tolerance calculations"
            >
              <Input
                type="number"
                step="0.1"
                value={beancount.toleranceMultiplier.toString()}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      toleranceMultiplier: parseFloat(e.detail.value) || 0.5,
                    },
                  })
                }
              />
            </FormField>

            <FormField
              label="Unrealized"
              description="Account name for unrealized gains"
            >
              <Input
                value={beancount.unrealized}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      unrealized: e.detail.value,
                    },
                  })
                }
                placeholder="Unrealized"
              />
            </FormField>

            <FormField
              label="Default Flag"
              description="Default flag for transactions"
            >
              <Input
                value={beancount.defaultFlag}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      defaultFlag: e.detail.value,
                    },
                  })
                }
                placeholder="*"
              />
            </FormField>

            <FormField
              label="Default Narration"
              description="Default narration for transactions"
            >
              <Input
                value={beancount.defaultNarration}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      defaultNarration: e.detail.value,
                    },
                  })
                }
                placeholder=""
              />
            </FormField>

            <FormField
              label="Use Legacy Metadata"
              description="Use legacy metadata format"
            >
              <Toggle
                checked={beancount.useLegacyMetadata}
                onChange={(e) =>
                  updateBookkeeping({
                    beancount: {
                      ...beancount,
                      useLegacyMetadata: e.detail.checked,
                    },
                  })
                }
              >
                Use legacy metadata
              </Toggle>
            </FormField>
          </SpaceBetween>
        </Form>
      </Container>
    </SpaceBetween>
  );
}

