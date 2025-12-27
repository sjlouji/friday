import { useState, useEffect } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import { format, addDays, isBefore, isAfter } from "date-fns";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Table from "@cloudscape-design/components/table";
import Button from "@cloudscape-design/components/button";
import Badge from "@cloudscape-design/components/badge";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Alert from "@cloudscape-design/components/alert";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import { Bill } from "@/types/beancount";
import BillModal from "@/components/BillModal";

export default function Bills() {
  const { accounts, transactions } = useBeancountStore();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "overdue" | "paid">(
    "all"
  );

  useEffect(() => {
    loadBills();
  }, [transactions]);

  const loadBills = () => {
    const savedBills = localStorage.getItem("bills");
    if (savedBills) {
      try {
        setBills(JSON.parse(savedBills));
      } catch (e) {
        console.error("Failed to load bills", e);
      }
    }
  };

  const saveBills = (newBills: Bill[]) => {
    localStorage.setItem("bills", JSON.stringify(newBills));
    setBills(newBills);
  };

  const handleNew = () => {
    setEditingBill(null);
    setIsModalOpen(true);
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this bill?")) {
      saveBills(bills.filter((b) => b.id !== id));
    }
  };

  const handleMarkPaid = (id: string) => {
    saveBills(
      bills.map((b) =>
        b.id === id
          ? { ...b, paid: true, paidDate: format(new Date(), "yyyy-MM-dd") }
          : b
      )
    );
  };

  const getBillStatus = (bill: Bill) => {
    if (bill.paid) return "paid";
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    if (isBefore(dueDate, today)) return "overdue";
    if (isBefore(dueDate, addDays(today, 7))) return "upcoming";
    return "pending";
  };

  const filteredBills = bills.filter((bill) => {
    if (filter === "all") return true;
    if (filter === "paid") return bill.paid;
    if (filter === "overdue") return getBillStatus(bill) === "overdue";
    if (filter === "upcoming") return getBillStatus(bill) === "upcoming";
    return true;
  });

  const upcomingBills = bills.filter(
    (b) => !b.paid && isBefore(new Date(b.dueDate), addDays(new Date(), 7))
  );
  const overdueBills = bills.filter(
    (b) => !b.paid && isBefore(new Date(b.dueDate), new Date())
  );

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: "Bills", href: "/bills" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Manage your bills and payment reminders"
        actions={
          <Button variant="primary" onClick={handleNew}>
            New Bill
          </Button>
        }
        counter={`(${bills.length})`}
      >
        Bills
      </Header>

      {(upcomingBills.length > 0 || overdueBills.length > 0) && (
        <SpaceBetween size="s">
          {overdueBills.length > 0 && (
            <Alert type="error" dismissible={false}>
              {overdueBills.length} bill(s) overdue
            </Alert>
          )}
          {upcomingBills.length > 0 && (
            <Alert type="warning" dismissible={false}>
              {upcomingBills.length} bill(s) due in the next 7 days
            </Alert>
          )}
        </SpaceBetween>
      )}

      <Container
        variant="stacked"
        header={
          <Header
            variant="h2"
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant={filter === "all" ? "primary" : "normal"}
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={filter === "upcoming" ? "primary" : "normal"}
                  onClick={() => setFilter("upcoming")}
                >
                  Upcoming
                </Button>
                <Button
                  variant={filter === "overdue" ? "primary" : "normal"}
                  onClick={() => setFilter("overdue")}
                >
                  Overdue
                </Button>
                <Button
                  variant={filter === "paid" ? "primary" : "normal"}
                  onClick={() => setFilter("paid")}
                >
                  Paid
                </Button>
              </SpaceBetween>
            }
          >
            Bill List
          </Header>
        }
      >
        <Table
          columnDefinitions={[
            {
              id: "name",
              header: "Bill Name",
              cell: (item) => item.name,
              sortingField: "name",
            },
            {
              id: "payee",
              header: "Payee",
              cell: (item) => item.payee || "-",
            },
            {
              id: "amount",
              header: "Amount",
              cell: (item) =>
                `$${parseFloat(item.amount.number).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ${item.amount.currency}`,
            },
            {
              id: "dueDate",
              header: "Due Date",
              cell: (item) => format(new Date(item.dueDate), "MMM dd, yyyy"),
              sortingField: "dueDate",
            },
            {
              id: "frequency",
              header: "Frequency",
              cell: (item) => item.frequency,
            },
            {
              id: "status",
              header: "Status",
              cell: (item) => {
                const status = getBillStatus(item);
                return (
                  <StatusIndicator
                    type={
                      status === "paid"
                        ? "success"
                        : status === "overdue"
                        ? "error"
                        : status === "upcoming"
                        ? "warning"
                        : "pending"
                    }
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </StatusIndicator>
                );
              },
            },
            {
              id: "actions",
              header: "Actions",
              cell: (item) => (
                <SpaceBetween direction="horizontal" size="xs">
                  {!item.paid && (
                    <Button
                      variant="inline-link"
                      onClick={() => handleMarkPaid(item.id)}
                    >
                      Mark Paid
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
          items={filteredBills}
          sortingColumn={{ sortingField: "dueDate" }}
        />
      </Container>

      {isModalOpen && (
        <BillModal
          bill={editingBill}
          accounts={accounts}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBill(null);
            loadBills();
          }}
        />
      )}
    </SpaceBetween>
  );
}
