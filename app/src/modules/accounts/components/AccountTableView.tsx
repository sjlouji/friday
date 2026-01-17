import { useMemo, useState } from "react";
import Table from "@cloudscape-design/components/table";
import Header from "@cloudscape-design/components/header";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Pagination from "@cloudscape-design/components/pagination";
import { Account, AccountType } from "@/types/beancount";
import { formatIndianCurrency } from "@/lib/utils/currency";
import { useTranslation } from "@/hooks/useTranslation";

interface AccountTableViewProps {
  accounts: Account[];
  balances: Record<string, { number: string; currency: string }>;
  onEdit: (account: Account) => void;
  onDelete: (name: string) => void;
}

interface TableItem {
  id: string;
  name: string;
  type: AccountType;
  openDate: string;
  closeDate?: string;
  balance?: { number: string; currency: string };
  account: Account;
}

const accountTypeColors: Record<
  AccountType,
  "blue" | "red" | "green" | "grey"
> = {
  Assets: "green",
  Liabilities: "red",
  Equity: "blue",
  Income: "blue",
  Expenses: "grey",
};

export default function AccountTableView({
  accounts,
  balances,
  onEdit,
  onDelete,
}: AccountTableViewProps) {
  const { t } = useTranslation();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const tableItems = useMemo(() => {
    return accounts.map((account) => ({
      id: account.name,
      name: account.name,
      type: account.type,
      openDate: account.openDate,
      closeDate: account.closeDate,
      balance: balances[account.name],
      account,
    }));
  }, [accounts, balances]);

  const paginatedItems = useMemo(() => {
    const startIndex = currentPageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    return tableItems.slice(startIndex, endIndex);
  }, [tableItems, currentPageIndex, pageSize]);

  const totalPages = Math.ceil(tableItems.length / pageSize);

  return (
    <SpaceBetween size="m">
      <Table
        columnDefinitions={[
          {
            id: "name",
            header: t("accounts.accountName"),
            cell: (item: TableItem) => item.name,
            sortingField: "name",
          },
          {
            id: "type",
            header: t("accounts.accountType"),
            cell: (item: TableItem) => (
              <Box>
                <Box
                  display="inline-block"
                  padding={{ horizontal: "xs", vertical: "xxs" }}
                  backgroundColor={`color-background-status-${accountTypeColors[item.type]}`}
                  borderRadius="default"
                  fontSize="body-s"
                >
                  {item.type}
                </Box>
              </Box>
            ),
            sortingField: "type",
          },
          {
            id: "balance",
            header: t("accounts.balance"),
            cell: (item: TableItem) => {
              if (item.balance) {
                return formatIndianCurrency(
                  parseFloat(item.balance.number),
                  item.balance.currency
                );
              }
              return "N/A";
            },
            sortingField: "balance",
          },
          {
            id: "openDate",
            header: t("accounts.openDate"),
            cell: (item: TableItem) =>
              new Date(item.openDate).toLocaleDateString(),
            sortingField: "openDate",
          },
          {
            id: "status",
            header: t("accounts.status"),
            cell: (item: TableItem) =>
              item.closeDate
                ? `Closed: ${new Date(item.closeDate).toLocaleDateString()}`
                : "Open",
          },
          {
            id: "actions",
            header: t("common.actions"),
            cell: (item: TableItem) => (
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="inline-link"
                  onClick={() => onEdit(item.account)}
                >
                  {t("common.edit")}
                </Button>
                <Button
                  variant="inline-link"
                  onClick={() => onDelete(item.account.name)}
                >
                  {t("common.delete")}
                </Button>
              </SpaceBetween>
            ),
          },
        ]}
        items={paginatedItems}
        loadingText={t("accounts.loadingAccounts")}
        empty={
          <Box textAlign="center" padding={{ vertical: "xl" }}>
            {t("accounts.noAccountsFound")}
          </Box>
        }
        header={
          <Header
            variant="h2"
            counter={`(${accounts.length})`}
          >
            {t("accounts.allAccounts")}
          </Header>
        }
        sortingDisabled={false}
      />

      {totalPages > 1 && (
        <Box padding={{ top: "l" }}>
          <Pagination
            currentPageIndex={currentPageIndex + 1}
            pagesCount={totalPages}
            pageSize={pageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            ariaLabels={{
              nextPageLabel: t("transactions.nextPageLabel"),
              previousPageLabel: t("transactions.previousPageLabel"),
              pageLabel: (pageNumber: number) =>
                `${t("transactions.pageLabel")} ${pageNumber} ${t("common.of")} ${totalPages}`,
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
    </SpaceBetween>
  );
}

