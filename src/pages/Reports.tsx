import { useState, useEffect } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Select from "@cloudscape-design/components/select";
import DateInput from "@cloudscape-design/components/date-input";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import Grid from "@cloudscape-design/components/grid";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Reports() {
  const { fetchBalanceSheet, fetchIncomeStatement, loadAll, transactions } =
    useBeancountStore();
  const [reportType, setReportType] = useState<
    | "balance-sheet"
    | "income-statement"
    | "cash-flow"
    | "net-worth"
    | "spending-by-category"
  >("balance-sheet");
  const [period, setPeriod] = useState({
    start: format(startOfMonth(subMonths(new Date(), 12)), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [balanceSheetData, setBalanceSheetData] = useState<any>(null);
  const [incomeStatementData, setIncomeStatementData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAll();
    if (reportType === "balance-sheet") {
      fetchBalanceSheet().then(setBalanceSheetData);
    } else if (reportType === "income-statement") {
      fetchIncomeStatement(period.start, period.end).then(
        setIncomeStatementData
      );
    }
  }, [reportType, period]);

  const generateCashFlow = () => {
    const monthlyData = transactions
      .filter(
        (t) =>
          new Date(t.date) >= new Date(period.start) &&
          new Date(t.date) <= new Date(period.end)
      )
      .reduce((acc, t) => {
        const month = format(new Date(t.date), "MMM yyyy");
        if (!acc[month]) {
          acc[month] = { income: 0, expenses: 0, net: 0 };
        }
        t.postings.forEach((p) => {
          if (p.account.startsWith("Income") && p.amount) {
            acc[month].income += parseFloat(p.amount.number);
          }
          if (p.account.startsWith("Expenses") && p.amount) {
            acc[month].expenses += Math.abs(parseFloat(p.amount.number));
          }
        });
        acc[month].net = acc[month].income - acc[month].expenses;
        return acc;
      }, {} as Record<string, { income: number; expenses: number; net: number }>);

    return Object.entries(monthlyData)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([month, data]) => ({ month, ...data }));
  };

  const balanceSheet = balanceSheetData || {
    assets: [],
    liabilities: [],
    equity: [],
  };
  const incomeStatement = incomeStatementData || { income: [], expenses: [] };
  const cashFlow = generateCashFlow();

  const totalAssets =
    balanceSheet.assets?.reduce((sum: number, a: any) => sum + a.balance, 0) ||
    0;
  const totalLiabilities =
    balanceSheet.liabilities?.reduce(
      (sum: number, l: any) => sum + l.balance,
      0
    ) || 0;
  const totalEquity =
    balanceSheet.equity?.reduce((sum: number, e: any) => sum + e.balance, 0) ||
    0;
  const totalIncome =
    incomeStatement.income?.reduce((sum: number, i: any) => sum + i.total, 0) ||
    0;
  const totalExpenses =
    incomeStatement.expenses?.reduce(
      (sum: number, e: any) => sum + e.total,
      0
    ) || 0;
  const netIncome = totalIncome - totalExpenses;

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: "Reports", href: "/reports" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header variant="h1" description="Financial reports and analysis">
        Reports
      </Header>

      <Container
        variant="stacked"
        header={
          <Header
            variant="h2"
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <DateInput
                  value={period.start}
                  onChange={(e) =>
                    setPeriod({ ...period, start: e.detail.value })
                  }
                  placeholder="Start date"
                />
                <DateInput
                  value={period.end}
                  onChange={(e) =>
                    setPeriod({ ...period, end: e.detail.value })
                  }
                  placeholder="End date"
                />
                <Select
                  selectedOption={{
                    label:
                      reportType === "balance-sheet"
                        ? "Balance Sheet"
                        : reportType === "income-statement"
                        ? "Income Statement"
                        : reportType === "cash-flow"
                        ? "Cash Flow"
                        : reportType === "net-worth"
                        ? "Net Worth"
                        : "Spending by Category",
                    value: reportType,
                  }}
                  onChange={(e) =>
                    setReportType(e.detail.selectedOption.value as any)
                  }
                  options={[
                    { label: "Balance Sheet", value: "balance-sheet" },
                    { label: "Income Statement", value: "income-statement" },
                    { label: "Cash Flow", value: "cash-flow" },
                    { label: "Net Worth", value: "net-worth" },
                    {
                      label: "Spending by Category",
                      value: "spending-by-category",
                    },
                  ]}
                />
                <Button iconName="download">Export</Button>
              </SpaceBetween>
            }
          >
            Report Configuration
          </Header>
        }
      >
        {reportType === "balance-sheet" && (
          <Grid
            gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}
          >
            <Container
              variant="stacked"
              header={<Header variant="h3">Assets</Header>}
            >
              <KeyValuePairs
                items={(balanceSheet.assets || []).map((asset: any) => ({
                  label: asset.account,
                  value: `$${asset.balance.toFixed(2)}`,
                }))}
              />
              <Box padding={{ top: "m" }}>
                <KeyValuePairs
                  items={[
                    {
                      label: "Total Assets",
                      value: `$${totalAssets.toFixed(2)}`,
                    },
                  ]}
                />
              </Box>
            </Container>
            <Container
              variant="stacked"
              header={<Header variant="h3">Liabilities</Header>}
            >
              <KeyValuePairs
                items={(balanceSheet.liabilities || []).map(
                  (liability: any) => ({
                    label: liability.account,
                    value: `$${liability.balance.toFixed(2)}`,
                  })
                )}
              />
              <Box padding={{ top: "m" }}>
                <KeyValuePairs
                  items={[
                    {
                      label: "Total Liabilities",
                      value: `$${totalLiabilities.toFixed(2)}`,
                    },
                  ]}
                />
              </Box>
            </Container>
            <Container
              variant="stacked"
              header={<Header variant="h3">Equity</Header>}
            >
              <KeyValuePairs
                items={(balanceSheet.equity || []).map((eq: any) => ({
                  label: eq.account,
                  value: `$${eq.balance.toFixed(2)}`,
                }))}
              />
              <Box padding={{ top: "m" }}>
                <KeyValuePairs
                  items={[
                    {
                      label: "Total Equity",
                      value: `$${totalEquity.toFixed(2)}`,
                    },
                  ]}
                />
              </Box>
            </Container>
          </Grid>
        )}

        {reportType === "income-statement" && (
          <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
            <Container
              variant="stacked"
              header={<Header variant="h3">Income</Header>}
            >
              <KeyValuePairs
                items={(incomeStatement.income || []).map((inc: any) => ({
                  label: inc.account,
                  value: `$${inc.total.toFixed(2)}`,
                }))}
              />
              <Box padding={{ top: "m" }}>
                <KeyValuePairs
                  items={[
                    {
                      label: "Total Income",
                      value: `$${totalIncome.toFixed(2)}`,
                    },
                  ]}
                />
              </Box>
            </Container>
            <Container
              variant="stacked"
              header={<Header variant="h3">Expenses</Header>}
            >
              <KeyValuePairs
                items={(incomeStatement.expenses || []).map((exp: any) => ({
                  label: exp.account,
                  value: `$${exp.total.toFixed(2)}`,
                }))}
              />
              <Box padding={{ top: "m" }}>
                <KeyValuePairs
                  items={[
                    {
                      label: "Total Expenses",
                      value: `$${totalExpenses.toFixed(2)}`,
                    },
                  ]}
                />
              </Box>
            </Container>
          </Grid>
        )}

        {reportType === "cash-flow" && (
          <Container
            variant="stacked"
            header={<Header variant="h3">Cash Flow</Header>}
          >
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#3b82f6"
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#10b981"
                  name="Net"
                />
              </LineChart>
            </ResponsiveContainer>
          </Container>
        )}

        {reportType === "net-worth" && (
          <Container
            variant="stacked"
            header={<Header variant="h3">Net Worth</Header>}
          >
            <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
              <Container
                variant="stacked"
                header={<Header variant="h3">Assets</Header>}
              >
                <Box variant="h1" color="text-status-success">
                  ${totalAssets.toFixed(2)}
                </Box>
              </Container>
              <Container
                variant="stacked"
                header={<Header variant="h3">Liabilities</Header>}
              >
                <Box variant="h1" color="text-status-error">
                  ${totalLiabilities.toFixed(2)}
                </Box>
              </Container>
            </Grid>
            <Box padding={{ top: "l" }}>
              <Box variant="h1">
                Net Worth: ${(totalAssets - totalLiabilities).toFixed(2)}
              </Box>
            </Box>
          </Container>
        )}

        {reportType === "spending-by-category" && (
          <Container
            variant="stacked"
            header={<Header variant="h3">Spending by Category</Header>}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={generateSpendingByCategory(transactions, period)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </Container>
        )}
      </Container>
    </SpaceBetween>
  );
}

function generateSpendingByCategory(
  transactions: any[],
  period: { start: string; end: string }
) {
  const categorySpending: Record<string, number> = {};

  transactions
    .filter(
      (t) =>
        new Date(t.date) >= new Date(period.start) &&
        new Date(t.date) <= new Date(period.end)
    )
    .forEach((t) => {
      t.postings.forEach((p: any) => {
        if (p.account.startsWith("Expenses:") && p.amount) {
          const category = p.account.split(":").slice(1).join(":") || "Other";
          const amount = Math.abs(parseFloat(p.amount.number));
          categorySpending[category] =
            (categorySpending[category] || 0) + amount;
        }
      });
    });

  return Object.entries(categorySpending)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
}
