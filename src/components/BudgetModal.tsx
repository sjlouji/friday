import { useState } from 'react';
import { useBeancountStore } from '@/store/beancountStore';
import Modal from '@cloudscape-design/components/modal';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import { Budget } from '@/types/beancount';

interface BudgetModalProps {
  onClose: () => void;
  defaultPeriod?: string;
}

export default function BudgetModal({ onClose, defaultPeriod }: BudgetModalProps) {
  const { addBudget, accounts } = useBeancountStore();
  const [formData, setFormData] = useState({
    account: '',
    period: defaultPeriod || new Date().toISOString().slice(0, 7),
    amount: '',
    currency: 'USD',
  });

  const expenseAccounts = accounts.filter((a) => a.type === 'Expenses');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newBudget: Budget = {
      account: formData.account,
      period: formData.period,
      amount: {
        number: formData.amount,
        currency: formData.currency,
      },
    };

    addBudget(newBudget);
    onClose();
  };

  return (
    <Modal
      visible={true}
      onDismiss={onClose}
      header="New Budget"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Create Budget
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Form>
        <SpaceBetween direction="vertical" size="l">
          <FormField label="Account">
            <Select
              selectedOption={formData.account ? { label: formData.account, value: formData.account } : null}
              onChange={(e) => setFormData({ ...formData, account: e.detail.selectedOption.value || '' })}
              options={expenseAccounts.map((account) => ({
                label: account.name,
                value: account.name,
              }))}
              placeholder="Select an account"
            />
          </FormField>

          <FormField label="Period">
            <Input
              type="month"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.detail.value })}
            />
          </FormField>

          <SpaceBetween direction="horizontal" size="xs">
            <FormField label="Amount" stretch={true}>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.detail.value })}
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Currency">
              <Input
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.detail.value })}
                placeholder="USD"
              />
            </FormField>
          </SpaceBetween>
        </SpaceBetween>
      </Form>
    </Modal>
  );
}
