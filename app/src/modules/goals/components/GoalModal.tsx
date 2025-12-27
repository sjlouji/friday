import { useState, useEffect } from "react";
import Modal from "@cloudscape-design/components/modal";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Select from "@cloudscape-design/components/select";
import DateInput from "@cloudscape-design/components/date-input";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import { SavingsGoal, DebtPayoff, Account } from "@/types/beancount";
import { format } from "date-fns";

interface GoalModalProps {
  goal: SavingsGoal | DebtPayoff | null;
  goalType: "savings" | "debt";
  accounts: Account[];
  onClose: () => void;
}

export default function GoalModal({
  goal,
  goalType,
  accounts,
  onClose,
}: GoalModalProps) {
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [targetDate, setTargetDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");

  const [debtBalance, setDebtBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [strategy, setStrategy] = useState<"snowball" | "avalanche" | "custom">(
    "snowball"
  );

  useEffect(() => {
    if (goal) {
      if (goalType === "savings") {
        const savingsGoal = goal as SavingsGoal;
        setName(savingsGoal.name);
        setAccount(savingsGoal.account);
        setTargetAmount(savingsGoal.targetAmount.number);
        setCurrentAmount(savingsGoal.currentAmount.number);
        setTargetDate(savingsGoal.targetDate);
        setCurrency(savingsGoal.targetAmount.currency);
        setDescription(savingsGoal.description || "");
      } else {
        const debtGoal = goal as DebtPayoff;
        setName(debtGoal.name);
        setAccount(debtGoal.account);
        setDebtBalance(debtGoal.currentBalance.number);
        setInterestRate(debtGoal.interestRate.toString());
        setMinPayment(debtGoal.minimumPayment.number);
        setCurrency(debtGoal.currentBalance.currency);
        setStrategy(debtGoal.strategy);
      }
    } else {
      setTargetDate(
        format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
      );
    }
  }, [goal, goalType]);

  const handleSave = () => {
    if (goalType === "savings") {
      const savedGoals = localStorage.getItem("savings-goals");
      const goals: SavingsGoal[] = savedGoals ? JSON.parse(savedGoals) : [];

      const newGoal: SavingsGoal = {
        id: goal?.id || `goal-${Date.now()}`,
        name,
        account,
        targetAmount: {
          number: targetAmount,
          currency,
        },
        currentAmount: {
          number: currentAmount,
          currency,
        },
        targetDate,
        description: description || undefined,
      };

      if (goal) {
        const index = goals.findIndex((g) => g.id === goal.id);
        if (index >= 0) {
          goals[index] = newGoal;
        }
      } else {
        goals.push(newGoal);
      }

      localStorage.setItem("savings-goals", JSON.stringify(goals));
    } else {
      const savedDebts = localStorage.getItem("debt-payoffs");
      const debts: DebtPayoff[] = savedDebts ? JSON.parse(savedDebts) : [];

      const newDebt: DebtPayoff = {
        id: goal?.id || `debt-${Date.now()}`,
        name,
        account,
        currentBalance: {
          number: debtBalance,
          currency,
        },
        interestRate: parseFloat(interestRate) || 0,
        minimumPayment: {
          number: minPayment,
          currency,
        },
        strategy,
      };

      if (goal) {
        const index = debts.findIndex((d) => d.id === goal.id);
        if (index >= 0) {
          debts[index] = newDebt;
        }
      } else {
        debts.push(newDebt);
      }

      localStorage.setItem("debt-payoffs", JSON.stringify(debts));
    }
    onClose();
  };

  const assetAccounts = accounts.filter((a) => a.type === "Assets");
  const liabilityAccounts = accounts.filter((a) => a.type === "Liabilities");

  return (
    <Modal
      visible={true}
      onDismiss={onClose}
      header={
        goal
          ? `Edit ${goalType === "savings" ? "Savings Goal" : "Debt Payoff"}`
          : `New ${goalType === "savings" ? "Savings Goal" : "Debt Payoff"}`
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
              placeholder={
                goalType === "savings"
                  ? "e.g., Emergency Fund, Vacation"
                  : "e.g., Credit Card, Car Loan"
              }
            />
          </FormField>

          <FormField label="Account">
            <Select
              selectedOption={
                (goalType === "savings"
                  ? assetAccounts
                  : liabilityAccounts
                ).find((a) => a.name === account)
                  ? { label: account, value: account }
                  : null
              }
              onChange={(e) => setAccount(e.detail.selectedOption.value || "")}
              options={(goalType === "savings"
                ? assetAccounts
                : liabilityAccounts
              ).map((a) => ({
                label: a.name,
                value: a.name,
              }))}
              placeholder="Select account"
            />
          </FormField>

          {goalType === "savings" ? (
            <>
              <FormField label="Target Amount">
                <SpaceBetween direction="horizontal" size="xs">
                  <Input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.detail.value)}
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

              <FormField label="Current Amount">
                <Input
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.detail.value)}
                  placeholder="0.00"
                />
              </FormField>

              <FormField label="Target Date">
                <DateInput
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.detail.value)}
                />
              </FormField>

              <FormField label="Description" description="Optional">
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.detail.value)}
                  placeholder="Optional description"
                />
              </FormField>
            </>
          ) : (
            <>
              <FormField label="Current Balance">
                <SpaceBetween direction="horizontal" size="xs">
                  <Input
                    type="number"
                    value={debtBalance}
                    onChange={(e) => setDebtBalance(e.detail.value)}
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

              <FormField label="Interest Rate (%)">
                <Input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.detail.value)}
                  placeholder="0.00"
                />
              </FormField>

              <FormField label="Minimum Payment">
                <Input
                  type="number"
                  value={minPayment}
                  onChange={(e) => setMinPayment(e.detail.value)}
                  placeholder="0.00"
                />
              </FormField>

              <FormField label="Payoff Strategy">
                <Select
                  selectedOption={{ label: strategy, value: strategy }}
                  onChange={(e) =>
                    setStrategy(
                      (e.detail.selectedOption.value as any) || "snowball"
                    )
                  }
                  options={[
                    {
                      label: "Snowball (smallest balance first)",
                      value: "snowball",
                    },
                    {
                      label: "Avalanche (highest interest first)",
                      value: "avalanche",
                    },
                    { label: "Custom", value: "custom" },
                  ]}
                />
              </FormField>
            </>
          )}
        </SpaceBetween>
      </Form>
    </Modal>
  );
}
