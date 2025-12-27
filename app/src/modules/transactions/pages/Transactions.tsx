import { useState, useMemo, useEffect } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import { format } from "date-fns";
import Header from "@cloudscape-design/components/header";
import Table from "@cloudscape-design/components/table";
import Button from "@cloudscape-design/components/button";
import PropertyFilter from "@cloudscape-design/components/property-filter";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Pagination from "@cloudscape-design/components/pagination";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
import { Transaction } from "@/types/beancount";
import TransactionModal from "../components/TransactionModal";

const FILTERING_PROPERTIES = [
  {
    key: "payee",
    propertyLabel: "Payee",
    operators: [":", "!:", "=", "!="],
    groupValuesLabel: "Payee values",
  },
  {
    key: "narration",
    propertyLabel: "Narration",
    operators: [":", "!:", "=", "!="],
    groupValuesLabel: "Narration values",
  },
  {
    key: "account",
    propertyLabel: "Account",
    operators: [":", "!:", "=", "!="],
    groupValuesLabel: "Account values",
  },
  {
    key: "type",
    propertyLabel: "Type",
    operators: ["=", "!="],
    groupValuesLabel: "Type values",
  },
];

export default function Transactions() {
  const {
    transactions,
    deleteTransaction,
    fetchTransactions,
    loading,
    transactionsPagination,
  } = useBeancountStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [selectedItems, setSelectedItems] = useState<Transaction[]>([]);
  const [propertyFilteringQuery, setPropertyFilteringQuery] = useState<{
    tokens: any[];
    operation: "and" | "or";
    freeTextTokens?: any[];
  }>({
    tokens: [],
    operation: "and",
    freeTextTokens: [],
  });
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortingColumn, setSortingColumn] = useState<{
    sortingField?: string;
    sortingDescending?: boolean;
  }>({
    sortingField: "date",
    sortingDescending: true,
  });
  const [columnDisplay, setColumnDisplay] = useState([
    { id: "date", visible: true },
    { id: "payee", visible: true },
    { id: "narration", visible: true },
    { id: "accounts", visible: true },
    { id: "amount", visible: true },
    { id: "actions", visible: true },
  ]);
  const [preferences, setPreferences] = useState({
    pageSize: 25,
    visibleContent: [
      "date",
      "payee",
      "narration",
      "accounts",
      "amount",
      "actions",
    ],
  });

  const [tablePreferences, setTablePreferences] = useState({
    contentDensity: "compact" as "compact" | "comfortable",
    wrapLines: true,
    stickyFirstColumn: true,
    stickyLastColumn: true,
    columnReordering: true,
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem("transactions-table-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.tablePreferences) {
          setTablePreferences({
            contentDensity: parsed.tablePreferences.contentDensity || "compact",
            wrapLines: parsed.tablePreferences.wrapLines !== false,
            stickyFirstColumn:
              parsed.tablePreferences.stickyFirstColumn !== false,
            stickyLastColumn:
              parsed.tablePreferences.stickyLastColumn !== false,
            columnReordering:
              parsed.tablePreferences.columnReordering !== false,
          });
        }
        if (parsed.tableColumnOrder) {
          setColumnDisplay(parsed.tableColumnOrder);
        }
        if (parsed.tablePreferencesState) {
          setPreferences(parsed.tablePreferencesState);
          if (parsed.tablePreferencesState.pageSize) {
            setPageSize(parsed.tablePreferencesState.pageSize);
          }
        }
        console.log("Loaded transactions table settings from localStorage:", {
          tablePreferences: parsed.tablePreferences,
          tableColumnOrder: parsed.tableColumnOrder,
          tablePreferencesState: parsed.tablePreferencesState,
        });
      } catch (e) {
        console.error("Failed to parse table preferences", e);
      }
    }
  }, []);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Save column display changes to localStorage (skip initial load)
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    const savedSettings = localStorage.getItem("transactions-table-settings");
    const parsed = savedSettings ? JSON.parse(savedSettings) : {};
    parsed.tableColumnOrder = columnDisplay;
    try {
      localStorage.setItem(
        "transactions-table-settings",
        JSON.stringify(parsed)
      );
      console.log("Saved column order to localStorage:", columnDisplay);
    } catch (e) {
      console.error("Failed to save column order", e);
    }
  }, [columnDisplay, isInitialLoad]);

  // Save table preferences changes to localStorage (skip initial load)
  useEffect(() => {
    if (isInitialLoad) {
      return;
    }
    const savedSettings = localStorage.getItem("transactions-table-settings");
    const parsed = savedSettings ? JSON.parse(savedSettings) : {};
    parsed.tablePreferences = tablePreferences;
    try {
      localStorage.setItem(
        "transactions-table-settings",
        JSON.stringify(parsed)
      );
      console.log("Saved table preferences to localStorage:", tablePreferences);
    } catch (e) {
      console.error("Failed to save table preferences", e);
    }
  }, [tablePreferences, isInitialLoad]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Extract filter parameters from query
        const freeText =
          propertyFilteringQuery?.freeTextTokens?.join(" ") || "";
        const filters = {
          freeText: freeText || undefined,
          tokens: propertyFilteringQuery?.tokens || [],
          operation: propertyFilteringQuery?.operation || "and",
        };

        // Extract sorting parameters
        const sorting = sortingColumn?.sortingField
          ? {
              field: sortingColumn.sortingField,
              descending: sortingColumn.sortingDescending || false,
            }
          : undefined;

        // Always use server-side filtering, sorting, and pagination
        await fetchTransactions(
          currentPageIndex + 1,
          pageSize,
          filters,
          sorting
        );
      } catch (error: any) {
        console.error("Error loading transactions:", error);
        alert(
          `Failed to load transactions: ${error.message}\n\nPlease check that the Beancount file path is set correctly in Settings.`
        );
      }
    };
    loadData();
  }, [currentPageIndex, pageSize, propertyFilteringQuery, sortingColumn]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(id);
      } catch (error: any) {
        alert(`Failed to delete transaction: ${error.message}`);
      }
    }
  };

  const handleNew = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    console.log("Filtering transactions:", {
      totalTransactions: transactions.length,
      query: propertyFilteringQuery,
      hasFreeText: propertyFilteringQuery?.freeTextTokens?.length > 0,
      hasTokens: propertyFilteringQuery?.tokens?.length > 0,
    });

    const freeTextTokens = propertyFilteringQuery?.freeTextTokens;
    if (
      freeTextTokens &&
      Array.isArray(freeTextTokens) &&
      freeTextTokens.length > 0
    ) {
      const freeText = freeTextTokens.join(" ").toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.payee?.toLowerCase().includes(freeText) ||
          t.narration.toLowerCase().includes(freeText) ||
          t.postings.some((p) => p.account.toLowerCase().includes(freeText))
      );
    }

    const tokens = propertyFilteringQuery?.tokens;
    if (tokens && Array.isArray(tokens) && tokens.length > 0) {
      const operation = propertyFilteringQuery?.operation || "and";
      filtered = filtered.filter((transaction) => {
        const matches = tokens.map((token: any) => {
          const { propertyKey, operator, value } = token;

          if (propertyKey === "payee") {
            const transactionValue = transaction.payee || "";
            return operator === ":"
              ? transactionValue.toLowerCase().includes(value.toLowerCase())
              : operator === "!:"
              ? !transactionValue.toLowerCase().includes(value.toLowerCase())
              : operator === "="
              ? transactionValue === value
              : transactionValue !== value;
          }

          if (propertyKey === "narration") {
            const transactionValue = transaction.narration || "";
            return operator === ":"
              ? transactionValue.toLowerCase().includes(value.toLowerCase())
              : operator === "!:"
              ? !transactionValue.toLowerCase().includes(value.toLowerCase())
              : operator === "="
              ? transactionValue === value
              : transactionValue !== value;
          }

          if (propertyKey === "account" || propertyKey === "accounts") {
            const transactionValue = transaction.postings
              .map((p) => p.account)
              .join(" ");
            return operator === ":"
              ? transactionValue.toLowerCase().includes(value.toLowerCase())
              : operator === "!:"
              ? !transactionValue.toLowerCase().includes(value.toLowerCase())
              : operator === "="
              ? transactionValue === value
              : transactionValue !== value;
          }

          if (propertyKey === "type") {
            const isIncome = transaction.postings.some((p) =>
              p.account.startsWith("Income")
            );
            const isExpense = transaction.postings.some((p) =>
              p.account.startsWith("Expenses")
            );
            const transactionValue = isIncome
              ? "income"
              : isExpense
              ? "expense"
              : "other";
            return operator === "="
              ? transactionValue === value
              : transactionValue !== value;
          }

          return true;
        });

        // Apply AND or OR logic based on operation
        return operation === "or"
          ? matches.some((m) => m) // At least one match
          : matches.every((m) => m); // All must match
      });
    }

    console.log("Filtered transactions count:", filtered.length);
    return filtered;
  }, [transactions, propertyFilteringQuery]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPageIndex(0);
  }, [propertyFilteringQuery]);

  const tableItems = useMemo(() => {
    return filteredTransactions.map((transaction) => ({
      id: transaction.id,
      date: format(new Date(transaction.date), "MMM d, yyyy"),
      payee: transaction.payee || "-",
      narration: transaction.narration,
      accounts: transaction.postings.map((p) => p.account).join(", "),
      amount: transaction.postings.map((posting, idx) => (
        <Box
          key={idx}
          variant="small"
          color={
            posting.account.startsWith("Expenses") ||
            posting.account.startsWith("Assets")
              ? "text-status-error"
              : "text-status-success"
          }
        >
          {posting.amount
            ? `${
                posting.account.startsWith("Expenses") ||
                posting.account.startsWith("Assets")
                  ? "-"
                  : "+"
              }$${parseFloat(posting.amount.number).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ${posting.amount.currency}`
            : "-"}
        </Box>
      )),
      transaction,
    }));
  }, [filteredTransactions]);

  // Server handles pagination and filtering
  const totalPages = transactionsPagination?.totalPages || 1;
  const totalCount = transactionsPagination?.totalCount || transactions.length;

  // Server already paginated the results
  const displayItems = tableItems;

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: "Transactions", href: "/transactions" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Manage your financial transactions"
        actions={
          <Button variant="primary" onClick={handleNew}>
            New Transaction
          </Button>
        }
        counter={`(${totalCount})`}
      >
        Transactions
      </Header>

      <Table
        columnDefinitions={[
          {
            id: "date",
            header: "Date",
            cell: (item) => item.date,
            sortingField: "date",
            minWidth: 120,
            width: 120,
          },
          {
            id: "payee",
            header: "Payee",
            cell: (item) => item.payee,
            sortingField: "payee",
            minWidth: 150,
          },
          {
            id: "narration",
            header: "Narration",
            cell: (item) => item.narration,
            sortingField: "narration",
            minWidth: 200,
          },
          {
            id: "accounts",
            header: "Accounts",
            cell: (item) => item.accounts,
            minWidth: 200,
          },
          {
            id: "amount",
            header: "Amount",
            cell: (item) => item.amount,
            minWidth: 150,
          },
          {
            id: "actions",
            header: "Actions",
            cell: (item) => (
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="inline-link"
                  onClick={() => handleEdit(item.transaction)}
                >
                  Edit
                </Button>
                <Button
                  variant="inline-link"
                  onClick={() => handleDelete(item.transaction.id)}
                >
                  Delete
                </Button>
              </SpaceBetween>
            ),
            minWidth: 120,
            width: 120,
          },
        ]}
        columnDisplay={columnDisplay}
        stickyColumns={
          tablePreferences.stickyFirstColumn &&
          tablePreferences.stickyLastColumn
            ? { first: 1, last: 1 }
            : tablePreferences.stickyFirstColumn
            ? { first: 1 }
            : tablePreferences.stickyLastColumn
            ? { last: 1 }
            : undefined
        }
        wrapLines={tablePreferences.wrapLines}
        contentDensity={tablePreferences.contentDensity}
        preferences={
          <CollectionPreferences
            title="Table preferences"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            preferences={
              {
                pageSize: preferences.pageSize,
                visibleContent: preferences.visibleContent,
                contentDensity: tablePreferences.contentDensity,
                wrapLines: tablePreferences.wrapLines,
                stickyColumns: {
                  first: tablePreferences.stickyFirstColumn ? 1 : 0,
                  last: tablePreferences.stickyLastColumn ? 1 : 0,
                },
                customPreference: columnDisplay.map((col) => col.id),
              } as any
            }
            pageSizePreference={{
              title: "Page size",
              options: [
                { value: 10, label: "10 items" },
                { value: 25, label: "25 items" },
                { value: 50, label: "50 items" },
                { value: 100, label: "100 items" },
              ],
            }}
            visibleContentPreference={{
              title: "Select visible columns",
              options: [
                {
                  label: "Transaction columns",
                  options: [
                    { id: "date", label: "Date" },
                    { id: "payee", label: "Payee" },
                    { id: "narration", label: "Narration" },
                    { id: "accounts", label: "Accounts" },
                    { id: "amount", label: "Amount" },
                    { id: "actions", label: "Actions" },
                  ],
                },
              ],
            }}
            contentDensityPreference={{
              label: "Content density",
              description: "Control the spacing and size of table content",
            }}
            wrapLinesPreference={{
              label: "Wrap lines",
              description: "Enable text wrapping in table cells",
            }}
            stickyColumnsPreference={{
              firstColumns: {
                title: "Sticky first column",
                description:
                  "Keep the first column fixed when scrolling horizontally",
                options: [
                  { label: "None", value: 0 },
                  { label: "1 column", value: 1 },
                ],
              },
              lastColumns: {
                title: "Sticky last column",
                description:
                  "Keep the last column (Actions) fixed when scrolling horizontally",
                options: [
                  { label: "None", value: 0 },
                  { label: "1 column", value: 1 },
                ],
              },
            }}
            onConfirm={({ detail }) => {
              const visibleContentArray = Array.isArray(detail.visibleContent)
                ? ([...detail.visibleContent] as string[])
                : Array.isArray(preferences.visibleContent)
                ? ([...preferences.visibleContent] as string[])
                : preferences.visibleContent;

              // Get custom column order if provided
              const customColumnOrder =
                (detail as any).customPreference || null;

              setPreferences({
                pageSize: detail.pageSize || preferences.pageSize,
                visibleContent: visibleContentArray,
              });
              setPageSize(detail.pageSize || pageSize);
              setCurrentPageIndex(0);

              // Update column display based on visible content and custom order
              const visibleContent = visibleContentArray;
              let orderedColumns: string[];

              if (customColumnOrder && Array.isArray(customColumnOrder)) {
                // Use custom order, but filter to only visible columns
                orderedColumns = customColumnOrder.filter((colId: string) =>
                  visibleContent.includes(colId)
                );
                // Add any visible columns not in custom order
                visibleContent.forEach((colId: string) => {
                  if (!orderedColumns.includes(colId)) {
                    orderedColumns.push(colId);
                  }
                });
              } else {
                // Use visible content order
                orderedColumns = visibleContent;
              }

              const newColumnDisplay = orderedColumns.map((colId: string) => {
                const existing = columnDisplay.find((col) => col.id === colId);
                return existing || { id: colId, visible: true };
              });

              // Add any columns that are in columnDisplay but not in visibleContent
              columnDisplay.forEach((col) => {
                if (!visibleContent.includes(col.id) && col.visible) {
                  newColumnDisplay.push({ ...col, visible: false });
                }
              });

              setColumnDisplay(newColumnDisplay);

              // Save all preferences to localStorage
              const savedSettings = localStorage.getItem(
                "transactions-table-settings"
              );
              const parsed = savedSettings ? JSON.parse(savedSettings) : {};

              // Update table preferences
              if (
                detail.contentDensity ||
                detail.wrapLines !== undefined ||
                detail.stickyColumns
              ) {
                const newTablePreferences = {
                  ...tablePreferences,
                  ...(detail.contentDensity && {
                    contentDensity: detail.contentDensity,
                  }),
                  ...(detail.wrapLines !== undefined && {
                    wrapLines: detail.wrapLines,
                  }),
                  ...(detail.stickyColumns && {
                    stickyFirstColumn:
                      ((detail.stickyColumns as any)?.first || 0) > 0,
                    stickyLastColumn:
                      ((detail.stickyColumns as any)?.last || 0) > 0,
                  }),
                };
                setTablePreferences(newTablePreferences);
                parsed.tablePreferences = newTablePreferences;
              }

              // Save all table settings including column order
              parsed.tablePreferencesState = {
                pageSize: detail.pageSize || preferences.pageSize,
                visibleContent: visibleContentArray,
              };
              // Save the updated column display order
              parsed.tableColumnOrder = newColumnDisplay;

              // Ensure tablePreferences is always saved
              parsed.tablePreferences =
                parsed.tablePreferences || tablePreferences;

              try {
                localStorage.setItem(
                  "transactions-table-settings",
                  JSON.stringify(parsed)
                );
                console.log(
                  "Saved all transactions table settings to localStorage:",
                  {
                    tablePreferences: parsed.tablePreferences,
                    tableColumnOrder: parsed.tableColumnOrder,
                    tablePreferencesState: parsed.tablePreferencesState,
                  }
                );
              } catch (e) {
                console.error("Failed to save table preferences", e);
              }
            }}
          />
        }
        items={displayItems}
        selectedItems={selectedItems
          .map((item) => tableItems.find((t) => t.id === item.id))
          .filter(Boolean)}
        onSelectionChange={({ detail }) => {
          const selected = detail.selectedItems
            .map((item: any) =>
              filteredTransactions.find((t) => t.id === item.id)
            )
            .filter(Boolean) as Transaction[];
          setSelectedItems(selected);
        }}
        selectionType="multi"
        sortingColumn={sortingColumn}
        sortingDescending={sortingColumn?.sortingDescending}
        onSortingChange={({ detail }) => {
          setSortingColumn({
            sortingField: detail.sortingColumn?.sortingField,
            sortingDescending: detail.isDescending,
          });
        }}
        filter={
          <PropertyFilter
            query={propertyFilteringQuery}
            onChange={({ detail }) => {
              console.log("PropertyFilter onChange - full detail:", detail);

              // PropertyFilter passes the query in detail.query, or tokens/operation directly in detail
              const query = detail.query || {
                tokens: detail.tokens || [],
                operation: detail.operation || "and",
                freeTextTokens: detail.freeTextTokens || [],
              };

              console.log("PropertyFilter onChange - extracted query:", query);

              const updatedQuery = {
                tokens: query.tokens || [],
                operation: query.operation || "and",
                freeTextTokens: query.freeTextTokens || [],
              };

              console.log("Setting propertyFilteringQuery to:", updatedQuery);
              setPropertyFilteringQuery(updatedQuery);
            }}
            filteringProperties={FILTERING_PROPERTIES}
            i18nStrings={{
              filteringAriaLabel: "Filter transactions",
              dismissAriaLabel: "Dismiss",
              filteringPlaceholder: "Search or filter transactions",
              groupValuesText: "Values",
              groupPropertiesText: "Properties",
              operatorsText: "Operators",
              operationAndText: "And",
              operationOrText: "Or",
              operatorLessText: "Less than",
              operatorLessOrEqualText: "Less than or equal",
              operatorGreaterText: "Greater than",
              operatorGreaterOrEqualText: "Greater than or equal",
              operatorContainsText: "Contains",
              operatorDoesNotContainText: "Does not contain",
              operatorEqualsText: "Equals",
              operatorDoesNotEqualText: "Does not equal",
              editTokenHeader: "Edit filter",
              propertyText: "Property",
              operatorText: "Operator",
              valueText: "Value",
              cancelActionText: "Cancel",
              applyActionText: "Apply",
              allPropertiesText: "All properties",
              tokenLimitShowMore: "Show more",
              tokenLimitShowFewer: "Show fewer",
              clearFiltersText: "Clear filters",
              removeTokenButtonAriaLabel: (token) =>
                `Remove token ${token.propertyKey} ${token.operator} ${token.value}`,
              enteredTextLabel: (text) => `Use: "${text}"`,
            }}
          />
        }
        empty={
          <Box textAlign="center" padding={{ vertical: "xl" }}>
            No transactions found
          </Box>
        }
      />

      {totalPages > 1 && (
        <Box padding={{ top: "l" }}>
          <Pagination
            currentPageIndex={currentPageIndex + 1}
            pagesCount={totalPages}
            pageSize={pageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            ariaLabels={{
              nextPageLabel: "Next page",
              previousPageLabel: "Previous page",
              pageLabel: (pageNumber: number) =>
                `Page ${pageNumber} of ${totalPages}`,
            }}
            onChange={({ detail }: any) => {
              setCurrentPageIndex(detail.currentPageIndex - 1);
            }}
            onPageSizeChange={({ detail }: any) => {
              setPageSize(detail.pageSize);
              setCurrentPageIndex(0);
            }}
          />
        </Box>
      )}

      {isModalOpen && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
        />
      )}
    </SpaceBetween>
  );
}
