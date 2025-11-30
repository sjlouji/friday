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
import Alert from '@cloudscape-design/components/alert';
import Spinner from '@cloudscape-design/components/spinner';
import { Transaction, Posting } from '@/types/beancount';

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionModal({ transaction, onClose }: TransactionModalProps) {
  const { addTransaction, updateTransaction, accounts, loading } = useBeancountStore();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: transaction?.date || new Date().toISOString().split('T')[0],
    flag: transaction?.flag || '*',
    payee: transaction?.payee || '',
    narration: transaction?.narration || '',
    postings: transaction?.postings || [
      { account: '', amount: { number: '', currency: 'USD' } },
      { account: '', amount: { number: '', currency: 'USD' } },
    ] as Posting[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const newTransaction: Transaction = {
      id: transaction?.id || crypto.randomUUID(),
      date: formData.date,
      flag: formData.flag,
      payee: formData.payee,
      narration: formData.narration,
      postings: formData.postings.filter(
        (p) => p.account && (p.amount?.number || p.amount === null)
      ),
    };

    try {
      if (transaction) {
        await updateTransaction(transaction.id, newTransaction);
      } else {
        await addTransaction(newTransaction);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    }
  };

  const updatePosting = (index: number, field: string, value: any) => {
    const newPostings = [...formData.postings];
    if (field === 'account') {
      newPostings[index] = { ...newPostings[index], account: value };
    } else if (field === 'amount') {
      newPostings[index] = {
        ...newPostings[index],
        amount: { ...newPostings[index].amount, number: value },
      };
    } else if (field === 'currency') {
      newPostings[index] = {
        ...newPostings[index],
        amount: { ...newPostings[index].amount, currency: value },
      };
    }
    setFormData({ ...formData, postings: newPostings });
  };

  const addPosting = () => {
    setFormData({
      ...formData,
      postings: [
        ...formData.postings,
        { account: '', amount: { number: '', currency: 'USD' } },
      ],
    });
  };

  const removePosting = (index: number) => {
    setFormData({
      ...formData,
      postings: formData.postings.filter((_, i) => i !== index),
    });
  };

  return (
    <Modal
      visible={true}
      onDismiss={onClose}
      header={transaction ? 'Edit Transaction' : 'New Transaction'}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner /> : transaction ? 'Update' : 'Create'} Transaction
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Form>
        <SpaceBetween direction="vertical" size="l">
          {error && (
            <Alert type="error" dismissible={false}>
              {error}
            </Alert>
          )}

          <FormField label="Date">
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.detail.value })}
            />
          </FormField>

          <FormField label="Flag">
            <Select
              selectedOption={{ label: formData.flag === '*' ? '* (Cleared)' : formData.flag === '!' ? '! (Pending)' : '? (Uncertain)', value: formData.flag }}
              onChange={(e) => setFormData({ ...formData, flag: e.detail.selectedOption.value || '*' })}
              options={[
                { label: '* (Cleared)', value: '*' },
                { label: '! (Pending)', value: '!' },
                { label: '? (Uncertain)', value: '?' },
              ]}
            />
          </FormField>

          <FormField label="Payee">
            <Input
              value={formData.payee}
              onChange={(e) => setFormData({ ...formData, payee: e.detail.value })}
              placeholder="Who did you pay?"
            />
          </FormField>

          <FormField label="Narration">
            <Input
              value={formData.narration}
              onChange={(e) => setFormData({ ...formData, narration: e.detail.value })}
              placeholder="What was this transaction for?"
            />
          </FormField>

          <Box>
            <SpaceBetween direction="vertical" size="m">
              <Box>
                <SpaceBetween direction="horizontal" size="xs">
                  <Box variant="h3">Postings</Box>
                  <Button variant="link" onClick={addPosting} disabled={loading}>
                    + Add Posting
                  </Button>
                </SpaceBetween>
              </Box>
              {formData.postings.map((posting, index) => (
                <Box key={index} padding="m" border="dashed">
                  <SpaceBetween direction="vertical" size="s">
                    <Box>
                      <SpaceBetween direction="horizontal" size="xs">
                        <Box variant="small">Posting {index + 1}</Box>
                        {formData.postings.length > 2 && (
                          <Button
                            variant="link"
                            onClick={() => removePosting(index)}
                            disabled={loading}
                          >
                            Remove
                          </Button>
                        )}
                      </SpaceBetween>
                    </Box>
                    <FormField label="Account">
                      <Select
                        selectedOption={
                          accounts.find((a) => a.name === posting.account)
                            ? { label: posting.account, value: posting.account }
                            : posting.account
                            ? { label: posting.account, value: posting.account }
                            : null
                        }
                        onChange={(e) =>
                          updatePosting(
                            index,
                            "account",
                            e.detail.selectedOption.value || ""
                          )
                        }
                        options={accounts.map((a) => ({
                          label: a.name,
                          value: a.name,
                        }))}
                        filteringType="auto"
                        placeholder="Select account"
                      />
                    </FormField>
                    <SpaceBetween direction="horizontal" size="xs">
                      <FormField label="Amount" stretch={true}>
                        <Input
                          type="number"
                          step="0.01"
                          value={posting.amount?.number || ''}
                          onChange={(e) => updatePosting(index, 'amount', e.detail.value)}
                          placeholder="0.00"
                        />
                      </FormField>
                      <FormField label="Currency">
                        <Input
                          value={posting.amount?.currency || 'USD'}
                          onChange={(e) => updatePosting(index, 'currency', e.detail.value)}
                          placeholder="USD"
                        />
                      </FormField>
                    </SpaceBetween>
                  </SpaceBetween>
                </Box>
              ))}
            </SpaceBetween>
          </Box>
        </SpaceBetween>
      </Form>
    </Modal>
  );
}
