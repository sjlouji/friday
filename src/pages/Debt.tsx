import { useState, useEffect, useMemo } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import { format, subMonths, addMonths } from "date-fns";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Table from "@cloudscape-design/components/table";
import Select from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Grid from "@cloudscape-design/components/grid";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import Tabs from "@cloudscape-design/components/tabs";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import ProgressBar from "@cloudscape-design/components/progress-bar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { formatIndianCurrency } from "@/utils/currency";

export default function Debt() {
  const { accounts, balances, transactions, loadAll } = useBeancountStore();
  const [timeRange, setTimeRange] = useState<"1M" | "3M" | "6M" | "1Y" | "ALL">("1Y");

  useEffect(() => {
    loadAll();
  }, []);

  const liabilityAccounts = accounts.filter((a) => a.type === "Liabilities");
  const debtBalances = balances.filter((b) =>
    liabilityAccounts.some((a) => a.name === b.account)
  );

  const totalDebt = debtBalances.reduce(
    (sum, b) => sum + Math.abs(parseFloat(b.amount.number)),
    0
  );

  const debtsByType = useMemo(() => {
    const grouped: Record<string, number> = {};
    debtBalances.forEach((b) => {
      const account = liabilityAccounts.find((a) => a.name === b.account);
      if (account) {
        const type = account.name.split(":")[1] || "Other";
        grouped[type] =
          (grouped[type] || 0) + Math.abs(parseFloat(b.amount.number));
      }
    });
    return grouped;
  }, [debtBalances, liabilityAccounts]);

  const timeRangeMonths = {
    "1M": 1,
    "3M": 3,
    "6M": 6,
    "1Y": 12,
    ALL: 999,
  };

  const startDate = subMonths(new Date(), timeRangeMonths[timeRange]);
  const recentTransactions = transactions.filter(
    (t) => new Date(t.date) >= startDate
  );

  const debtTransactions = recentTransactions.filter((t) =>
    t.postings.some((p) => liabilityAccounts.some((a) => a.name === p.account))
  );

  const journalData = useMemo(() => {
    const journal: Array<{
      date: string;
      account: string;
      description: string;
      payment: number;
      balance: number;
    }> = [];

    const accountBalances: Record<string, number> = {};
    liabilityAccounts.forEach((a) => {
      const balance = debtBalances.find((b) => b.account === a.name);
      accountBalances[a.name] = balance
        ? Math.abs(parseFloat(balance.amount.number))
        : 0;
    });

    debtTransactions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((t) => {
        t.postings.forEach((p) => {
          if (liabilityAccounts.some((a) => a.name === p.account) && p.amount) {
            const amount = Math.abs(parseFloat(p.amount.number));
            const isPayment = p.account.startsWith("Liabilities");
            if (isPayment) {
              accountBalances[p.account] = Math.max(
                0,
                (accountBalances[p.account] || 0) - amount
              );
              journal.push({
                date: t.date,
                account: p.account,
                description: `${t.payee || ""} ${t.narration}`.trim(),
                payment: amount,
                balance: accountBalances[p.account],
              });
            }
          }
        });
      });

    return journal;
  }, [debtTransactions, liabilityAccounts, debtBalances]);

  const debtBreakdown = Object.entries(debtsByType).map(([name, value]) => ({
    name,
    value,
  }));

  const calculatePayoffProjection = (accountName: string, monthlyPayment: number) => {
    const balance = debtBalances.find((b) => b.account === accountName);
    if (!balance) return null;
    const currentBalance = Math.abs(parseFloat(balance.amount.number));
    if (monthlyPayment <= 0) return null;
    const months = Math.ceil(currentBalance / monthlyPayment);
    return {
      months,
      payoffDate: addMonths(new Date(), months),
      totalPayments: months * monthlyPayment,
    };
  };

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: "Debt", href: "/debt" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Track and manage your debts and liabilities"
        actions={
          <Select
            selectedOption={{
              label:
                timeRange === "1M"
                  ? "1 Month"
                  : timeRange === "3M"
                  ? "3 Months"
                  : timeRange === "6M"
                  ? "6 Months"
                  : timeRange === "1Y"
                  ? "1 Year"
                  : "All Time",
              value: timeRange,
            }}
            onChange={(e) =>
              setTimeRange((e.detail.selectedOption.value as any) || "1Y")
            }
            options={[
              { label: "1 Month", value: "1M" },
              { label: "3 Months", value: "3M" },
              { label: "6 Months", value: "6M" },
              { label: "1 Year", value: "1Y" },
              { label: "All Time", value: "ALL" },
            ]}
          />
        }
      >
        Debt & Liabilities
      </Header>

      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
        <Container variant="stacked" header={<Header variant="h2">Total Debt</Header>}>
          <Box variant="h1" color="text-status-error">
            {formatIndianCurrency(totalDebt)}
          </Box>
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">Debt Accounts</Header>}
        >
          <Box variant="h1">{liabilityAccounts.length}</Box>
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">Debt Types</Header>}
        >
          <Box variant="h1">{Object.keys(debtsByType).length}</Box>
        </Container>
      </Grid>

      <Tabs
        tabs={[
          {
            label: "Overview",
            id: "overview",
            content: (
              <Container
                variant="stacked"
                header={<Header variant="h2">Debt Breakdown</Header>}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={debtBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatIndianCurrency(value)} />
                    <Bar dataKey="value" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </Container>
            ),
          },
          {
            label: "Balances",
            id: "balances",
            content: (
              <Container variant="stacked" header={<Header variant="h2">Debt Balances</Header>}>
                <Table
                  columnDefinitions={[
                    {
                      id: "account",
                      header: "Account",
                      cell: (item) => item.account,
                      sortingField: "account",
                    },
                    {
                      id: "balance",
                      header: "Outstanding Balance",
                      cell: (item) =>
                        formatIndianCurrency(Math.abs(parseFloat(item.amount.number))),
                    },
                    {
                      id: "currency",
                      header: "Currency",
                      cell: (item) => item.amount.currency,
                    },
                    {
                      id: "date",
                      header: "Last Updated",
                      cell: (item) => format(new Date(item.date), "dd/MM/yyyy"),
                      sortingField: "date",
                    },
                  ]}
                  items={debtBalances}
                  sortingColumn={{ sortingField: "account" }}
                />
              </Container>
            ),
          },
          {
            label: "Payment Journal",
            id: "journal",
            content: (
              <Container
                variant="stacked"
                header={<Header variant="h2">Payment History</Header>}
              >
                {journalData.length > 0 ? (
                  <Table
                    columnDefinitions={[
                      {
                        id: "date",
                        header: "Date",
                        cell: (item) => format(new Date(item.date), "dd/MM/yyyy"),
                        sortingField: "date",
                      },
                      {
                        id: "account",
                        header: "Account",
                        cell: (item) => item.account,
                      },
                      {
                        id: "description",
                        header: "Description",
                        cell: (item) => item.description || "-",
                      },
                      {
                        id: "payment",
                        header: "Payment",
                        cell: (item) => (
                          <Box color="text-status-success">
                            {formatIndianCurrency(item.payment)}
                          </Box>
                        ),
                      },
                      {
                        id: "balance",
                        header: "Remaining Balance",
                        cell: (item) => formatIndianCurrency(item.balance),
                      },
                    ]}
                    items={journalData}
                    sortingColumn={{ sortingField: "date", sortingDescending: true }}
                  />
                ) : (
                  <Box textAlign="center" padding={{ vertical: "xl" }}>
                    No payment transactions in the selected time range
                  </Box>
                )}
              </Container>
            ),
          },
          {
            label: "By Type",
            id: "by-type",
            content: (
              <Container
                variant="stacked"
                header={<Header variant="h2">Debt Grouped by Type</Header>}
              >
                <KeyValuePairs
                  items={Object.entries(debtsByType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, amount]) => ({
                      label: type,
                      value: formatIndianCurrency(amount),
                    }))}
                />
              </Container>
            ),
          },
        ]}
      />
    </SpaceBetween>
  );
}

