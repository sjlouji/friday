import { useState, useEffect } from "react";
import Modal from "@cloudscape-design/components/modal";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Select from "@cloudscape-design/components/select";
import DateInput from "@cloudscape-design/components/date-input";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import { Bill, Account } from "@/types/beancount";
import { format } from "date-fns";

interface BillModalProps {
  bill: Bill | null;
  accounts: Account[];
  onClose: () => void;
}

export default function BillModal({ bill, accounts, onClose }: BillModalProps) {
  const [name, setName] = useState("");
  const [payee, setPayee] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [frequency, setFrequency] = useState<
    "monthly" | "quarterly" | "yearly" | "one-time"
  >("monthly");
  const [reminderDays, setReminderDays] = useState("3");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (bill) {
      setName(bill.name);
      setPayee(bill.payee || "");
      setAccount(bill.account);
      setAmount(bill.amount.number);
      setCurrency(bill.amount.currency);
      setDueDate(bill.dueDate);
      setFrequency(bill.frequency);
      setReminderDays(bill.reminderDays?.toString() || "3");
      setNotes(bill.notes || "");
    }
  }, [bill]);

  const handleSave = () => {
    const savedBills = localStorage.getItem("bills");
    const bills: Bill[] = savedBills ? JSON.parse(savedBills) : [];

    const newBill: Bill = {
      id: bill?.id || `bill-${Date.now()}`,
      name,
      payee: payee || undefined,
      account,
      amount: {
        number: amount,
        currency,
      },
      dueDate,
      frequency,
      paid: bill?.paid || false,
      paidDate: bill?.paidDate,
      reminderDays: parseInt(reminderDays) || 3,
      notes: notes || undefined,
    };

    if (bill) {
      const index = bills.findIndex((b) => b.id === bill.id);
      if (index >= 0) {
        bills[index] = newBill;
      }
    } else {
      bills.push(newBill);
    }

    localStorage.setItem("bills", JSON.stringify(bills));
    onClose();
  };

  const expenseAccounts = accounts.filter((a) => a.type === "Expenses");

  return (
    <Modal
      visible={true}
      onDismiss={onClose}
      header={bill ? "Edit Bill" : "New Bill"}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Form>
        <SpaceBetween size="l">
          <FormField label="Bill Name">
            <Input
              value={name}
              onChange={(e) => setName(e.detail.value)}
              placeholder="e.g., Rent, Electricity"
            />
          </FormField>

          <FormField label="Payee" description="Who you pay this bill to">
            <Input
              value={payee}
              onChange={(e) => setPayee(e.detail.value)}
              placeholder="e.g., Landlord, Utility Company"
            />
          </FormField>

          <FormField
            label="Account"
            description="Expense account for this bill"
          >
            <Select
              selectedOption={
                expenseAccounts.find((a) => a.name === account)
                  ? { label: account, value: account }
                  : null
              }
              onChange={(e) => setAccount(e.detail.selectedOption.value || "")}
              options={expenseAccounts.map((a) => ({
                label: a.name,
                value: a.name,
              }))}
              placeholder="Select account"
            />
          </FormField>

          <FormField label="Amount">
            <SpaceBetween direction="horizontal" size="xs">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.detail.value)}
                placeholder="0.00"
              />
              <Select
                selectedOption={{ label: currency, value: currency }}
                onChange={(e) =>
                  setCurrency(e.detail.selectedOption.value || "USD")
                }
                options={[
                  { label: "USD", value: "USD" },
                  { label: "EUR", value: "EUR" },
                  { label: "GBP", value: "GBP" },
                ]}
              />
            </SpaceBetween>
          </FormField>

          <FormField label="Due Date">
            <DateInput
              value={dueDate}
              onChange={(e) => setDueDate(e.detail.value)}
            />
          </FormField>

          <FormField label="Frequency">
            <Select
              selectedOption={{ label: frequency, value: frequency }}
              onChange={(e) =>
                setFrequency(
                  (e.detail.selectedOption.value as any) || "monthly"
                )
              }
              options={[
                { label: "Monthly", value: "monthly" },
                { label: "Quarterly", value: "quarterly" },
                { label: "Yearly", value: "yearly" },
                { label: "One-time", value: "one-time" },
              ]}
            />
          </FormField>

          <FormField
            label="Reminder Days"
            description="Days before due date to remind you"
          >
            <Input
              type="number"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.detail.value)}
              placeholder="3"
            />
          </FormField>

          <FormField label="Notes" description="Additional notes">
            <Input
              value={notes}
              onChange={(e) => setNotes(e.detail.value)}
              placeholder="Optional notes"
            />
          </FormField>
        </SpaceBetween>
      </Form>
    </Modal>
  );
}
