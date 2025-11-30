import { useState, useEffect } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import { format, differenceInDays, isBefore } from "date-fns";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Tabs from "@cloudscape-design/components/tabs";
import Table from "@cloudscape-design/components/table";
import Button from "@cloudscape-design/components/button";
import ProgressBar from "@cloudscape-design/components/progress-bar";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import { SavingsGoal, DebtPayoff } from "@/types/beancount";
import GoalModal from "@/components/GoalModal";

export default function Goals() {
  const { accounts } = useBeancountStore();
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [debtPayoffs, setDebtPayoffs] = useState<DebtPayoff[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<
    SavingsGoal | DebtPayoff | null
  >(null);
  const [goalType, setGoalType] = useState<"savings" | "debt">("savings");

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const savedSavings = localStorage.getItem("savings-goals");
    const savedDebts = localStorage.getItem("debt-payoffs");
    if (savedSavings) {
      try {
        setSavingsGoals(JSON.parse(savedSavings));
      } catch (e) {
        console.error("Failed to load savings goals", e);
      }
    }
    if (savedDebts) {
      try {
        setDebtPayoffs(JSON.parse(savedDebts));
      } catch (e) {
        console.error("Failed to load debt payoffs", e);
      }
    }
  };

  const handleNew = (type: "savings" | "debt") => {
    setGoalType(type);
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleEdit = (
    goal: SavingsGoal | DebtPayoff,
    type: "savings" | "debt"
  ) => {
    setGoalType(type);
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, type: "savings" | "debt") => {
    if (confirm("Are you sure you want to delete this goal?")) {
      if (type === "savings") {
        const newGoals = savingsGoals.filter((g) => g.id !== id);
        setSavingsGoals(newGoals);
        localStorage.setItem("savings-goals", JSON.stringify(newGoals));
      } else {
        const newDebts = debtPayoffs.filter((d) => d.id !== id);
        setDebtPayoffs(newDebts);
        localStorage.setItem("debt-payoffs", JSON.stringify(newDebts));
      }
    }
  };

  const getGoalProgress = (goal: SavingsGoal) => {
    const current = parseFloat(goal.currentAmount.number);
    const target = parseFloat(goal.targetAmount.number);
    const progress = target > 0 ? (current / target) * 100 : 0;
    const remaining = target - current;
    const daysRemaining = differenceInDays(
      new Date(goal.targetDate),
      new Date()
    );
    return {
      progress,
      remaining,
      daysRemaining,
      isOnTrack:
        daysRemaining > 0 &&
        remaining / daysRemaining <=
          target /
            differenceInDays(
              new Date(goal.targetDate),
              new Date(
                goal.currentAmount.number === "0" ? new Date() : new Date()
              )
            ),
    };
  };

  const getDebtProgress = (debt: DebtPayoff) => {
    const balance = parseFloat(debt.currentBalance.number);
    const minPayment = parseFloat(debt.minimumPayment.number);
    const monthsRemaining = balance / minPayment;
    return { balance, minPayment, monthsRemaining };
  };

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: "Goals", href: "/goals" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Track savings goals and debt payoff plans"
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="primary" onClick={() => handleNew("savings")}>
              New Savings Goal
            </Button>
            <Button variant="primary" onClick={() => handleNew("debt")}>
              New Debt Payoff
            </Button>
          </SpaceBetween>
        }
      >
        Goals
      </Header>

      <Tabs
        tabs={[
          {
            label: "Savings Goals",
            id: "savings",
            content: (
              <Container
                variant="stacked"
                header={
                  <Header variant="h2" counter={`(${savingsGoals.length})`}>
                    Savings Goals
                  </Header>
                }
              >
                {savingsGoals.length === 0 ? (
                  <Box textAlign="center" padding={{ vertical: "xl" }}>
                    No savings goals yet. Create one to get started!
                  </Box>
                ) : (
                  <Table
                    columnDefinitions={[
                      {
                        id: "name",
                        header: "Goal Name",
                        cell: (item) => item.name,
                      },
                      {
                        id: "target",
                        header: "Target Amount",
                        cell: (item) =>
                          `$${parseFloat(
                            item.targetAmount.number
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`,
                      },
                      {
                        id: "current",
                        header: "Current Amount",
                        cell: (item) =>
                          `$${parseFloat(
                            item.currentAmount.number
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`,
                      },
                      {
                        id: "progress",
                        header: "Progress",
                        cell: (item) => {
                          const { progress, remaining, daysRemaining } =
                            getGoalProgress(item);
                          return (
                            <SpaceBetween direction="vertical" size="xs">
                              <ProgressBar
                                value={Math.min(progress, 100)}
                                status={
                                  progress >= 100
                                    ? "success"
                                    : progress >= 75
                                    ? "warning"
                                    : "in-progress"
                                }
                              />
                              <Box variant="small" color="text-body-secondary">
                                ${remaining.toFixed(2)} remaining •{" "}
                                {daysRemaining} days left
                              </Box>
                            </SpaceBetween>
                          );
                        },
                      },
                      {
                        id: "targetDate",
                        header: "Target Date",
                        cell: (item) =>
                          format(new Date(item.targetDate), "MMM dd, yyyy"),
                      },
                      {
                        id: "actions",
                        header: "Actions",
                        cell: (item) => (
                          <SpaceBetween direction="horizontal" size="xs">
                            <Button
                              variant="inline-link"
                              onClick={() => handleEdit(item, "savings")}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="inline-link"
                              onClick={() => handleDelete(item.id, "savings")}
                            >
                              Delete
                            </Button>
                          </SpaceBetween>
                        ),
                      },
                    ]}
                    items={savingsGoals}
                  />
                )}
              </Container>
            ),
          },
          {
            label: "Debt Payoff",
            id: "debt",
            content: (
              <Container
                variant="stacked"
                header={
                  <Header variant="h2" counter={`(${debtPayoffs.length})`}>
                    Debt Payoff Plans
                  </Header>
                }
              >
                {debtPayoffs.length === 0 ? (
                  <Box textAlign="center" padding={{ vertical: "xl" }}>
                    No debt payoff plans yet. Create one to get started!
                  </Box>
                ) : (
                  <Table
                    columnDefinitions={[
                      {
                        id: "name",
                        header: "Debt Name",
                        cell: (item) => item.name,
                      },
                      {
                        id: "account",
                        header: "Account",
                        cell: (item) => item.account,
                      },
                      {
                        id: "balance",
                        header: "Current Balance",
                        cell: (item) =>
                          `$${parseFloat(
                            item.currentBalance.number
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`,
                      },
                      {
                        id: "interest",
                        header: "Interest Rate",
                        cell: (item) => `${item.interestRate.toFixed(2)}%`,
                      },
                      {
                        id: "minPayment",
                        header: "Minimum Payment",
                        cell: (item) =>
                          `$${parseFloat(
                            item.minimumPayment.number
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`,
                      },
                      {
                        id: "monthsRemaining",
                        header: "Months Remaining",
                        cell: (item) => {
                          const { monthsRemaining } = getDebtProgress(item);
                          return `${Math.ceil(monthsRemaining)} months`;
                        },
                      },
                      {
                        id: "strategy",
                        header: "Strategy",
                        cell: (item) => (
                          <StatusIndicator type="pending">
                            {item.strategy.charAt(0).toUpperCase() +
                              item.strategy.slice(1)}
                          </StatusIndicator>
                        ),
                      },
                      {
                        id: "actions",
                        header: "Actions",
                        cell: (item) => (
                          <SpaceBetween direction="horizontal" size="xs">
                            <Button
                              variant="inline-link"
                              onClick={() => handleEdit(item, "debt")}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="inline-link"
                              onClick={() => handleDelete(item.id, "debt")}
                            >
                              Delete
                            </Button>
                          </SpaceBetween>
                        ),
                      },
                    ]}
                    items={debtPayoffs}
                  />
                )}
              </Container>
            ),
          },
        ]}
      />

      {isModalOpen && (
        <GoalModal
          goal={editingGoal}
          goalType={goalType}
          accounts={accounts}
          onClose={() => {
            setIsModalOpen(false);
            setEditingGoal(null);
            loadGoals();
          }}
        />
      )}
    </SpaceBetween>
  );
}
