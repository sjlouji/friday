import { useState, useEffect, useMemo } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import { format, subMonths } from "date-fns";
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
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { formatIndianCurrency } from "@/utils/currency";

export default function Assets() {
  const { accounts, balances, transactions, loadAll } = useBeancountStore();
  const [timeRange, setTimeRange] = useState<"1M" | "3M" | "6M" | "1Y" | "ALL">("1Y");
  const [groupBy, setGroupBy] = useState<"account" | "type" | "currency">("account");

  useEffect(() => {
    loadAll();
  }, []);

  const assetAccounts = accounts.filter((a) => a.type === "Assets");
  const assetBalances = balances.filter((b) =>
    assetAccounts.some((a) => a.name === b.account)
  );

  const totalAssets = assetBalances.reduce(
    (sum, b) => sum + parseFloat(b.amount.number),
    0
  );

  const assetsByType = useMemo(() => {
    const grouped: Record<string, number> = {};
    assetBalances.forEach((b) => {
      const account = assetAccounts.find((a) => a.name === b.account);
      if (account) {
        const type = account.name.split(":")[1] || "Other";
        grouped[type] = (grouped[type] || 0) + parseFloat(b.amount.number);
      }
    });
    return grouped;
  }, [assetBalances, assetAccounts]);

  const assetsByCurrency = useMemo(() => {
    const grouped: Record<string, number> = {};
    assetBalances.forEach((b) => {
      const currency = b.amount.currency;
      grouped[currency] = (grouped[currency] || 0) + parseFloat(b.amount.number);
    });
    return grouped;
  }, [assetBalances]);

  const chartData = Object.entries(assetsByType).map(([name, value]) => ({
    name,
    value,
  }));

  const currencyData = Object.entries(assetsByCurrency).map(([name, value]) => ({
    name,
    value,
  }));

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

  const assetTransactions = recentTransactions.filter((t) =>
    t.postings.some((p) => assetAccounts.some((a) => a.name === p.account))
  );

  const journalData = useMemo(() => {
    const journal: Array<{
      date: string;
      account: string;
      description: string;
      amount: number;
      balance: number;
    }> = [];

    let runningBalance = 0;
    assetTransactions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((t) => {
        t.postings.forEach((p) => {
          if (assetAccounts.some((a) => a.name === p.account) && p.amount) {
            const amount = parseFloat(p.amount.number);
            runningBalance += amount;
            journal.push({
              date: t.date,
              account: p.account,
              description: `${t.payee || ""} ${t.narration}`.trim(),
              amount,
              balance: runningBalance,
            });
          }
        });
      });

    return journal;
  }, [assetTransactions, assetAccounts]);

  const COLORS = [
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: "Assets", href: "/assets" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Track and manage your assets"
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
        Assets
      </Header>

      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
        <Container variant="stacked" header={<Header variant="h2">Total Assets</Header>}>
          <Box variant="h1" color="text-status-success">
            {formatIndianCurrency(totalAssets)}
          </Box>
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">Asset Accounts</Header>}
        >
          <Box variant="h1">{assetAccounts.length}</Box>
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">Currencies</Header>}
        >
          <Box variant="h1">{Object.keys(assetsByCurrency).length}</Box>
        </Container>
      </Grid>

      <Tabs
        tabs={[
          {
            label: "Overview",
            id: "overview",
            content: (
              <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                <Container
                  variant="stacked"
                  header={<Header variant="h2">Assets by Type</Header>}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatIndianCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Container>

                <Container
                  variant="stacked"
                  header={<Header variant="h2">Assets by Currency</Header>}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={currencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatIndianCurrency(value)} />
                      <Bar dataKey="value" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </Container>
              </Grid>
            ),
          },
          {
            label: "Balances",
            id: "balances",
            content: (
              <Container variant="stacked" header={<Header variant="h2">Asset Balances</Header>}>
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
                      header: "Balance",
                      cell: (item) =>
                        formatIndianCurrency(parseFloat(item.amount.number)),
                    },
                    {
                      id: "currency",
                      header: "Currency",
                      cell: (item) => item.amount.currency,
                    },
                    {
                      id: "date",
                      header: "Date",
                      cell: (item) => format(new Date(item.date), "dd/MM/yyyy"),
                      sortingField: "date",
                    },
                  ]}
                  items={assetBalances}
                  sortingColumn={{ sortingField: "account" }}
                />
              </Container>
            ),
          },
          {
            label: "Journal",
            id: "journal",
            content: (
              <Container variant="stacked" header={<Header variant="h2">Asset Journal</Header>}>
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
                      id: "amount",
                      header: "Amount",
                      cell: (item) => (
                        <Box
                          color={
                            item.amount >= 0
                              ? "text-status-success"
                              : "text-status-error"
                          }
                        >
                          {formatIndianCurrency(item.amount)}
                        </Box>
                      ),
                    },
                    {
                      id: "balance",
                      header: "Running Balance",
                      cell: (item) => formatIndianCurrency(item.balance),
                    },
                  ]}
                  items={journalData}
                  sortingColumn={{ sortingField: "date", sortingDescending: true }}
                />
              </Container>
            ),
          },
          {
            label: "By Type",
            id: "by-type",
            content: (
              <Container
                variant="stacked"
                header={<Header variant="h2">Assets Grouped by Type</Header>}
              >
                <KeyValuePairs
                  items={Object.entries(assetsByType)
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

