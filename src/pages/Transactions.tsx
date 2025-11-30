import { useState, useMemo, useEffect } from 'react';
import { useBeancountStore } from '@/store/beancountStore';
import { format } from 'date-fns';
import Header from '@cloudscape-design/components/header';
import Table from '@cloudscape-design/components/table';
import Button from '@cloudscape-design/components/button';
import PropertyFilter from '@cloudscape-design/components/property-filter';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import { Transaction } from '@/types/beancount';
import TransactionModal from '@/components/TransactionModal';

const FILTERING_PROPERTIES = [
  {
    key: 'payee',
    propertyLabel: 'Payee',
    operators: [':', '!:', '=', '!='],
    groupValuesLabel: 'Payee values',
  },
  {
    key: 'narration',
    propertyLabel: 'Narration',
    operators: [':', '!:', '=', '!='],
    groupValuesLabel: 'Narration values',
  },
  {
    key: 'account',
    propertyLabel: 'Account',
    operators: [':', '!:', '=', '!='],
    groupValuesLabel: 'Account values',
  },
  {
    key: 'type',
    propertyLabel: 'Type',
    operators: ['=', '!='],
    groupValuesLabel: 'Type values',
  },
];

export default function Transactions() {
  const { transactions, deleteTransaction, fetchTransactions, loading } = useBeancountStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedItems, setSelectedItems] = useState<Transaction[]>([]);
  const [propertyFilteringQuery, setPropertyFilteringQuery] = useState({ tokens: [], operation: 'and' as const, freeTextTokens: [] });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
      } catch (error: any) {
        alert(`Failed to delete transaction: ${error.message}`);
      }
    }
  };

  const handleNew = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (propertyFilteringQuery.freeTextTokens && propertyFilteringQuery.freeTextTokens.length > 0) {
      const freeText = propertyFilteringQuery.freeTextTokens.join(' ').toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.payee?.toLowerCase().includes(freeText) ||
          t.narration.toLowerCase().includes(freeText) ||
          t.postings.some((p) => p.account.toLowerCase().includes(freeText))
      );
    }

    if (propertyFilteringQuery.tokens.length > 0) {
      filtered = filtered.filter((transaction) => {
        return propertyFilteringQuery.tokens.every((token: any) => {
          const { propertyKey, operator, value } = token;
          
          if (propertyKey === 'payee') {
            const transactionValue = transaction.payee || '';
            return operator === ':' ? transactionValue.toLowerCase().includes(value.toLowerCase()) :
                   operator === '!:' ? !transactionValue.toLowerCase().includes(value.toLowerCase()) :
                   operator === '=' ? transactionValue === value :
                   transactionValue !== value;
          }
          
          if (propertyKey === 'narration') {
            const transactionValue = transaction.narration || '';
            return operator === ':' ? transactionValue.toLowerCase().includes(value.toLowerCase()) :
                   operator === '!:' ? !transactionValue.toLowerCase().includes(value.toLowerCase()) :
                   operator === '=' ? transactionValue === value :
                   transactionValue !== value;
          }
          
          if (propertyKey === 'account') {
            const transactionValue = transaction.postings.map(p => p.account).join(' ');
            return operator === ':' ? transactionValue.toLowerCase().includes(value.toLowerCase()) :
                   operator === '!:' ? !transactionValue.toLowerCase().includes(value.toLowerCase()) :
                   operator === '=' ? transactionValue === value :
                   transactionValue !== value;
          }
          
          if (propertyKey === 'type') {
            const isIncome = transaction.postings.some(p => p.account.startsWith('Income'));
            const isExpense = transaction.postings.some(p => p.account.startsWith('Expenses'));
            const transactionValue = isIncome ? 'income' : isExpense ? 'expense' : 'other';
            return operator === '=' ? transactionValue === value : transactionValue !== value;
          }
          
          return true;
        });
      });
    }

    return filtered;
  }, [transactions, propertyFilteringQuery]);

  const tableItems = filteredTransactions.map((transaction) => ({
    id: transaction.id,
    date: format(new Date(transaction.date), 'MMM d, yyyy'),
    payee: transaction.payee || '-',
    narration: transaction.narration,
    accounts: transaction.postings.map((p) => p.account).join(', '),
    amount: transaction.postings.map((posting, idx) => (
      <Box
        key={idx}
        variant="small"
        color={
          posting.account.startsWith('Expenses') || posting.account.startsWith('Assets')
            ? 'text-status-error'
            : 'text-status-success'
        }
      >
        {posting.amount
          ? `${posting.account.startsWith('Expenses') || posting.account.startsWith('Assets') ? '-' : '+'}$${parseFloat(posting.amount.number).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${posting.amount.currency}`
          : '-'}
      </Box>
    )),
    transaction,
  }));

  const breadcrumbs = [
    { text: 'Friday', href: '/' },
    { text: 'Transactions', href: '/transactions' },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Manage your financial transactions"
        actions={
          <Button variant="primary" onClick={handleNew}>
            New Transaction
          </Button>
        }
        counter={`(${filteredTransactions.length})`}
      >
        Transactions
      </Header>

      <Table
        columnDefinitions={[
          {
            id: 'date',
            header: 'Date',
            cell: (item) => item.date,
            sortingField: 'date',
          },
          {
            id: 'payee',
            header: 'Payee',
            cell: (item) => item.payee,
            sortingField: 'payee',
          },
          {
            id: 'narration',
            header: 'Narration',
            cell: (item) => item.narration,
            sortingField: 'narration',
          },
          {
            id: 'accounts',
            header: 'Accounts',
            cell: (item) => item.accounts,
          },
          {
            id: 'amount',
            header: 'Amount',
            cell: (item) => item.amount,
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: (item) => (
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="inline-link"
                  onClick={() => handleEdit(item.transaction)}
                >
                  Edit
                </Button>
                <Button
                  variant="inline-link"
                  onClick={() => handleDelete(item.transaction.id)}
                >
                  Delete
                </Button>
              </SpaceBetween>
            ),
          },
        ]}
        items={tableItems}
        selectedItems={selectedItems.map(item => tableItems.find(t => t.id === item.id)).filter(Boolean)}
        onSelectionChange={({ detail }) => {
          const selected = detail.selectedItems.map((item: any) => 
            filteredTransactions.find(t => t.id === item.id)
          ).filter(Boolean) as Transaction[];
          setSelectedItems(selected);
        }}
        selectionType="multi"
        sortingColumn={{ sortingField: 'date' }}
        sortingDescending={true}
        filter={
          <PropertyFilter
            query={propertyFilteringQuery}
            onChange={({ detail }) => setPropertyFilteringQuery(detail.query)}
            filteringProperties={FILTERING_PROPERTIES}
            freeTextFiltering={{
              filteringFunction: (item, filteringText) => {
                const text = filteringText.toLowerCase();
                return (
                  item.payee?.toLowerCase().includes(text) ||
                  item.narration.toLowerCase().includes(text) ||
                  item.postings.some((p) => p.account.toLowerCase().includes(text))
                );
              },
            }}
            i18nStrings={{
              filteringAriaLabel: 'Filter transactions',
              dismissAriaLabel: 'Dismiss',
              filteringPlaceholder: 'Search or filter transactions',
              groupValuesText: 'Values',
              groupPropertiesText: 'Properties',
              operatorsText: 'Operators',
              operationAndText: 'And',
              operationOrText: 'Or',
              operatorLessText: 'Less than',
              operatorLessOrEqualText: 'Less than or equal',
              operatorGreaterText: 'Greater than',
              operatorGreaterOrEqualText: 'Greater than or equal',
              operatorContainsText: 'Contains',
              operatorDoesNotContainText: 'Does not contain',
              operatorEqualsText: 'Equals',
              operatorDoesNotEqualText: 'Does not equal',
              editTokenHeader: 'Edit filter',
              propertyText: 'Property',
              operatorText: 'Operator',
              valueText: 'Value',
              cancelActionText: 'Cancel',
              applyActionText: 'Apply',
              allPropertiesText: 'All properties',
              tokenLimitShowMore: 'Show more',
              tokenLimitShowFewer: 'Show fewer',
              clearFiltersText: 'Clear filters',
              removeTokenButtonAriaLabel: (token) => `Remove token ${token.propertyKey} ${token.operator} ${token.value}`,
              enteredTextLabel: (text) => `Use: "${text}"`,
            }}
          />
        }
        empty={
          <Box textAlign="center" padding={{ vertical: 'xl' }}>
            No transactions found
          </Box>
        }
      />

      {isModalOpen && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
        />
      )}
    </SpaceBetween>
  );
}
