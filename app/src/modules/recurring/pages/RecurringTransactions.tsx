import { useState, useEffect } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isBefore,
} from "date-fns";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Table from "@cloudscape-design/components/table";
import Button from "@cloudscape-design/components/button";
import Toggle from "@cloudscape-design/components/toggle";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import { RecurringTransaction, Transaction } from "@/types/beancount";
import RecurringTransactionModal from "@/components/RecurringTransactionModal";

export default function RecurringTransactions() {
  const { addTransaction } = useBeancountStore();
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] =
    useState<RecurringTransaction | null>(null);

  useEffect(() => {
    loadRecurringTransactions();
  }, []);

  const loadRecurringTransactions = () => {
    const saved = localStorage.getItem("recurring-transactions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Calculate next execution dates
        const updated = parsed.map((rt: RecurringTransaction) => ({
          ...rt,
          nextExecution: calculateNextExecution(rt),
        }));
        setRecurringTransactions(updated);
      } catch (e) {
        console.error("Failed to load recurring transactions", e);
      }
    }
  };

  const calculateNextExecution = (rt: RecurringTransaction): string => {
    if (!rt.enabled) return "-";
    const lastExecuted = rt.lastExecuted
      ? new Date(rt.lastExecuted)
      : new Date(rt.startDate);
    const now = new Date();

    let next = lastExecuted;
    while (isBefore(next, now) || next.getTime() === lastExecuted.getTime()) {
      switch (rt.frequency) {
        case "daily":
          next = addDays(next, 1);
          break;
        case "weekly":
          next = addWeeks(next, 1);
          break;
        case "biweekly":
          next = addWeeks(next, 2);
          break;
        case "monthly":
          next = addMonths(next, 1);
          break;
        case "quarterly":
          next = addMonths(next, 3);
          break;
        case "yearly":
          next = addYears(next, 1);
          break;
      }
    }

    if (rt.endDate && isBefore(new Date(rt.endDate), next)) {
      return "-";
    }

    return format(next, "yyyy-MM-dd");
  };

  const handleNew = () => {
    setEditingRecurring(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rt: RecurringTransaction) => {
    setEditingRecurring(rt);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      confirm("Are you sure you want to delete this recurring transaction?")
    ) {
      const newList = recurringTransactions.filter((rt) => rt.id !== id);
      setRecurringTransactions(newList);
      localStorage.setItem("recurring-transactions", JSON.stringify(newList));
    }
  };

  const handleToggle = (id: string) => {
    const newList = recurringTransactions.map((rt) =>
      rt.id === id
        ? {
            ...rt,
            enabled: !rt.enabled,
            nextExecution: calculateNextExecution({
              ...rt,
              enabled: !rt.enabled,
            }),
          }
        : rt
    );
    setRecurringTransactions(newList);
    localStorage.setItem("recurring-transactions", JSON.stringify(newList));
  };

  const handleExecute = async (rt: RecurringTransaction) => {
    const transaction: Transaction = {
      ...rt.transaction,
      date: format(new Date(), "yyyy-MM-dd"),
    };

    try {
      await addTransaction(transaction);
      const newList = recurringTransactions.map((r) =>
        r.id === rt.id
          ? {
              ...r,
              lastExecuted: format(new Date(), "yyyy-MM-dd"),
              nextExecution: calculateNextExecution({
                ...r,
                lastExecuted: format(new Date(), "yyyy-MM-dd"),
              }),
            }
          : r
      );
      setRecurringTransactions(newList);
      localStorage.setItem("recurring-transactions", JSON.stringify(newList));
    } catch (error: any) {
      alert(`Failed to execute transaction: ${error.message}`);
    }
  };

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: "Recurring Transactions", href: "/recurring" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Manage recurring transactions and templates"
        actions={
          <Button variant="primary" onClick={handleNew}>
            New Recurring Transaction
          </Button>
        }
        counter={`(${recurringTransactions.length})`}
      >
        Recurring Transactions
      </Header>

      <Container
        variant="stacked"
        header={<Header variant="h2">Recurring Transactions</Header>}
      >
        {recurringTransactions.length === 0 ? (
          <Box textAlign="center" padding={{ vertical: "xl" }}>
            No recurring transactions yet. Create one to get started!
          </Box>
        ) : (
          <Table
            columnDefinitions={[
              {
                id: "name",
                header: "Name",
                cell: (item) => item.name,
              },
              {
                id: "transaction",
                header: "Transaction",
                cell: (item) =>
                  `${item.transaction.payee || ""} ${
                    item.transaction.narration
                  }`.trim(),
              },
              {
                id: "frequency",
                header: "Frequency",
                cell: (item) => item.frequency,
              },
              {
                id: "nextExecution",
                header: "Next Execution",
                cell: (item) =>
                  item.nextExecution && item.nextExecution !== "-"
                    ? format(new Date(item.nextExecution), "MMM dd, yyyy")
                    : "-",
              },
              {
                id: "enabled",
                header: "Enabled",
                cell: (item) => (
                  <Toggle
                    checked={item.enabled}
                    onChange={() => handleToggle(item.id)}
                  />
                ),
              },
              {
                id: "actions",
                header: "Actions",
                cell: (item) => (
                  <SpaceBetween direction="horizontal" size="xs">
                    {item.enabled &&
                      item.nextExecution &&
                      item.nextExecution !== "-" && (
                        <Button
                          variant="inline-link"
                          onClick={() => handleExecute(item)}
                        >
                          Execute Now
                        </Button>
                      )}
                    <Button
                      variant="inline-link"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="inline-link"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </SpaceBetween>
                ),
              },
            ]}
            items={recurringTransactions}
          />
        )}
      </Container>

      {isModalOpen && (
        <RecurringTransactionModal
          recurringTransaction={editingRecurring}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRecurring(null);
            loadRecurringTransactions();
          }}
        />
      )}
    </SpaceBetween>
  );
}
