import { useState, useEffect } from "react";
import Modal from "@cloudscape-design/components/modal";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Select from "@cloudscape-design/components/select";
import DateInput from "@cloudscape-design/components/date-input";
import Toggle from "@cloudscape-design/components/toggle";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import { RecurringTransaction, Transaction } from "@/types/beancount";
import { format } from "date-fns";

interface RecurringTransactionModalProps {
  recurringTransaction: RecurringTransaction | null;
  onClose: () => void;
}

export default function RecurringTransactionModal({
  recurringTransaction,
  onClose,
}: RecurringTransactionModalProps) {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<
    "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly"
  >("monthly");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");
  const [enabled, setEnabled] = useState(true);

  const [transactionDate, setTransactionDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [payee, setPayee] = useState("");
  const [narration, setNarration] = useState("");
  const [postingAccount1, setPostingAccount1] = useState("");
  const [postingAmount1, setPostingAmount1] = useState("");
  const [postingAccount2, setPostingAccount2] = useState("");
  const [postingAmount2, setPostingAmount2] = useState("");

  useEffect(() => {
    if (recurringTransaction) {
      setName(recurringTransaction.name);
      setFrequency(recurringTransaction.frequency);
      setStartDate(recurringTransaction.startDate);
      setEndDate(recurringTransaction.endDate || "");
      setEnabled(recurringTransaction.enabled);

      const t = recurringTransaction.transaction;
      setTransactionDate(t.date);
      setPayee(t.payee || "");
      setNarration(t.narration || "");
      if (t.postings.length > 0) {
        setPostingAccount1(t.postings[0].account);
        setPostingAmount1(t.postings[0].amount?.number || "");
      }
      if (t.postings.length > 1) {
        setPostingAccount2(t.postings[1].account);
        setPostingAmount2(t.postings[1].amount?.number || "");
      }
    }
  }, [recurringTransaction]);

  const handleSave = () => {
    const transaction: Transaction = {
      id: "",
      date: transactionDate,
      flag: "*",
      payee: payee || undefined,
      narration: narration,
      postings: [
        {
          account: postingAccount1,
          amount: postingAmount1
            ? {
                number: postingAmount1,
                currency: "USD",
              }
            : null,
        },
        {
          account: postingAccount2,
          amount: postingAmount2
            ? {
                number: postingAmount2,
                currency: "USD",
              }
            : null,
        },
      ].filter((p) => p.account),
    };

    const saved = localStorage.getItem("recurring-transactions");
    const recurring: RecurringTransaction[] = saved ? JSON.parse(saved) : [];

    const newRecurring: RecurringTransaction = {
      id: recurringTransaction?.id || `recurring-${Date.now()}`,
      name,
      frequency,
      startDate,
      endDate: endDate || undefined,
      transaction,
      enabled,
      lastExecuted: recurringTransaction?.lastExecuted,
    };

    if (recurringTransaction) {
      const index = recurring.findIndex(
        (r) => r.id === recurringTransaction.id
      );
      if (index >= 0) {
        recurring[index] = newRecurring;
      }
    } else {
      recurring.push(newRecurring);
    }

    localStorage.setItem("recurring-transactions", JSON.stringify(recurring));
    onClose();
  };

  return (
    <Modal
      visible={true}
      onDismiss={onClose}
      header={
        recurringTransaction
          ? "Edit Recurring Transaction"
          : "New Recurring Transaction"
      }
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
          <FormField label="Name">
            <Input
              value={name}
              onChange={(e) => setName(e.detail.value)}
              placeholder="e.g., Monthly Rent, Salary"
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
                { label: "Daily", value: "daily" },
                { label: "Weekly", value: "weekly" },
                { label: "Biweekly", value: "biweekly" },
                { label: "Monthly", value: "monthly" },
                { label: "Quarterly", value: "quarterly" },
                { label: "Yearly", value: "yearly" },
              ]}
            />
          </FormField>

          <FormField label="Start Date">
            <DateInput
              value={startDate}
              onChange={(e) => setStartDate(e.detail.value)}
            />
          </FormField>

          <FormField label="End Date (optional)">
            <DateInput
              value={endDate}
              onChange={(e) => setEndDate(e.detail.value)}
            />
          </FormField>

          <FormField label="Enabled">
            <Toggle
              checked={enabled}
              onChange={(e) => setEnabled(e.detail.checked)}
            />
          </FormField>

          <FormField label="Transaction Date">
            <DateInput
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.detail.value)}
            />
          </FormField>

          <FormField label="Payee (optional)">
            <Input
              value={payee}
              onChange={(e) => setPayee(e.detail.value)}
              placeholder="e.g., Landlord, Employer"
            />
          </FormField>

          <FormField label="Narration">
            <Input
              value={narration}
              onChange={(e) => setNarration(e.detail.value)}
              placeholder="Transaction description"
            />
          </FormField>

          <FormField label="Posting 1 - Account">
            <Input
              value={postingAccount1}
              onChange={(e) => setPostingAccount1(e.detail.value)}
              placeholder="e.g., Expenses:Rent"
            />
          </FormField>

          <FormField label="Posting 1 - Amount">
            <Input
              type="number"
              value={postingAmount1}
              onChange={(e) => setPostingAmount1(e.detail.value)}
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Posting 2 - Account">
            <Input
              value={postingAccount2}
              onChange={(e) => setPostingAccount2(e.detail.value)}
              placeholder="e.g., Assets:Checking"
            />
          </FormField>

          <FormField label="Posting 2 - Amount">
            <Input
              type="number"
              value={postingAmount2}
              onChange={(e) => setPostingAmount2(e.detail.value)}
              placeholder="0.00"
            />
          </FormField>
        </SpaceBetween>
      </Form>
    </Modal>
  );
}
