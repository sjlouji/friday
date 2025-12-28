import { useMemo } from "react";
import Table from "@cloudscape-design/components/table";
import Header from "@cloudscape-design/components/header";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { Account, AccountType } from "@/types/beancount";
import { formatIndianCurrency } from "@/lib/utils/currency";
import { useTranslation } from "@/hooks/useTranslation";

interface AccountTableViewProps {
  accounts: Account[];
  balances: Record<string, { number: string; currency: string }>;
  onEdit: (account: Account) => void;
  onDelete: (name: string) => void;
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

  const tableItems = useMemo(() => {
    return accounts.map((account) => ({
      id: account.name,
      name: account.name,
      type: account.type,
      openDate: account.openDate,
      closeDate: account.closeDate,
      balance: balances[account.name],
    }));
  }, [accounts, balances]);

  return (
    <Table
      columnDefinitions={[
        {
          id: "name",
          header: t("accounts.accountName"),
          cell: (item) => item.name,
          sortingField: "name",
        },
        {
          id: "type",
          header: t("accounts.accountType"),
          cell: (item) => (
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
          cell: (item) => {
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
          cell: (item) =>
            new Date(item.openDate).toLocaleDateString(),
          sortingField: "openDate",
        },
        {
          id: "status",
          header: t("accounts.status"),
          cell: (item) =>
            item.closeDate
              ? `Closed: ${new Date(item.closeDate).toLocaleDateString()}`
              : "Open",
        },
        {
          id: "actions",
          header: t("common.actions"),
          cell: (item) => {
            const account = accounts.find((a) => a.name === item.name);
            if (!account) return null;
            return (
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="inline-link"
                  onClick={() => onEdit(account)}
                >
                  {t("common.edit")}
                </Button>
                <Button
                  variant="inline-link"
                  onClick={() => onDelete(account.name)}
                >
                  {t("common.delete")}
                </Button>
              </SpaceBetween>
            );
          },
        },
      ]}
      items={tableItems}
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
  );
}

