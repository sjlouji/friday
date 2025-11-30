import { useState } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import { format, startOfMonth, endOfMonth } from "date-fns";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Button from "@cloudscape-design/components/button";
import Input from "@cloudscape-design/components/input";
import Grid from "@cloudscape-design/components/grid";
import Box from "@cloudscape-design/components/box";
import ProgressBar from "@cloudscape-design/components/progress-bar";
import Alert from "@cloudscape-design/components/alert";
import SpaceBetween from "@cloudscape-design/components/space-between";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import BudgetModal from "@/components/BudgetModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Budget() {
  const { budgets, transactions } = useBeancountStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(
    format(new Date(), "yyyy-MM")
  );

  const currentMonth = format(new Date(), "yyyy-MM");
  const periodStart = startOfMonth(new Date(selectedPeriod + "-01"));
  const periodEnd = endOfMonth(new Date(selectedPeriod + "-01"));

  const budgetStatus = budgets.map((budget) => {
    const actual = transactions
      .filter(
        (t) =>
          new Date(t.date) >= periodStart &&
          new Date(t.date) <= periodEnd &&
          t.postings.some((p) => p.account === budget.account)
      )
      .reduce((sum, t) => {
        const posting = t.postings.find((p) => p.account === budget.account);
        return (
          sum +
          Math.abs(posting?.amount ? parseFloat(posting.amount.number) : 0)
        );
      }, 0);

    const budgeted = parseFloat(budget.amount.number);
    const remaining = budgeted - actual;
    const percentUsed = budgeted > 0 ? (actual / budgeted) * 100 : 0;

    return {
      ...budget,
      actual,
      remaining,
      percentUsed,
      isOverBudget: actual > budgeted,
    };
  });

  const chartData = budgetStatus.map((b) => ({
    name: b.account.split(":").pop() || b.account,
    budgeted: parseFloat(b.amount.number),
    actual: b.actual,
  }));

  const totalBudgeted = budgets.reduce(
    (sum, b) => sum + parseFloat(b.amount.number),
    0
  );
  const totalActual = budgetStatus.reduce((sum, b) => sum + b.actual, 0);
  const totalRemaining = totalBudgeted - totalActual;

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: "Budget", href: "/budget" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Track your spending against budgets"
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.detail.value)}
            />
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              New Budget
            </Button>
          </SpaceBetween>
        }
      >
        Budget
      </Header>

      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
        <Container
          variant="stacked"
          header={<Header variant="h2">Total Budgeted</Header>}
        >
          <Box variant="h1">
            $
            {totalBudgeted.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Box>
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">Total Spent</Header>}
        >
          <Box variant="h1">
            $
            {totalActual.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Box>
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">Remaining</Header>}
        >
          <Box
            variant="h1"
            color={
              totalRemaining >= 0 ? "text-status-success" : "text-status-error"
            }
          >
            $
            {totalRemaining.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Box>
        </Container>
      </Grid>

      <Container
        variant="stacked"
        header={<Header variant="h2">Budget vs Actual</Header>}
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="budgeted" fill="#94a3b8" name="Budgeted" />
            <Bar dataKey="actual" fill="#0ea5e9" name="Actual" />
          </BarChart>
        </ResponsiveContainer>
      </Container>

      <Container
        variant="stacked"
        header={<Header variant="h2">Budget Details</Header>}
      >
        {budgetStatus.length === 0 ? (
          <Box textAlign="center" padding={{ vertical: "xl" }}>
            No budgets set for this period
          </Box>
        ) : (
          <SpaceBetween direction="vertical" size="m">
            {budgetStatus.map((budget) => (
              <Container
                variant="stacked"
                key={budget.account}
                header={<Header variant="h3">{budget.account}</Header>}
              >
                {budget.isOverBudget && (
                  <Alert type="warning" dismissible={false}>
                    Over Budget
                  </Alert>
                )}
                <SpaceBetween direction="vertical" size="s">
                  <Box>
                    <SpaceBetween direction="horizontal" size="l">
                      <Box variant="small" color="text-body-secondary">
                        Spent
                      </Box>
                      <Box variant="small">${budget.actual.toFixed(2)}</Box>
                    </SpaceBetween>
                  </Box>
                  <Box>
                    <SpaceBetween direction="horizontal" size="l">
                      <Box variant="small" color="text-body-secondary">
                        Remaining
                      </Box>
                      <Box
                        variant="small"
                        color={
                          budget.remaining >= 0
                            ? "text-status-success"
                            : "text-status-error"
                        }
                      >
                        ${budget.remaining.toFixed(2)}
                      </Box>
                    </SpaceBetween>
                  </Box>
                  <Box>
                    <SpaceBetween direction="horizontal" size="l">
                      <Box variant="small" color="text-body-secondary">
                        Progress
                      </Box>
                      <Box variant="small">
                        {budget.percentUsed.toFixed(1)}%
                      </Box>
                    </SpaceBetween>
                    <ProgressBar
                      value={Math.min(budget.percentUsed, 100)}
                      status={
                        budget.percentUsed > 100
                          ? "error"
                          : budget.percentUsed > 80
                          ? "warning"
                          : "success"
                      }
                    />
                  </Box>
                </SpaceBetween>
              </Container>
            ))}
          </SpaceBetween>
        )}
      </Container>

      {isModalOpen && (
        <BudgetModal
          onClose={() => setIsModalOpen(false)}
          defaultPeriod={selectedPeriod}
        />
      )}
    </SpaceBetween>
  );
}
