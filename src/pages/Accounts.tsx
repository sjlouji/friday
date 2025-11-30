import { useState, useEffect } from 'react';
import { useBeancountStore } from '@/store/beancountStore';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import Button from '@cloudscape-design/components/button';
import Cards from '@cloudscape-design/components/cards';
import Box from '@cloudscape-design/components/box';
import Badge from '@cloudscape-design/components/badge';
import SpaceBetween from '@cloudscape-design/components/space-between';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import { Account, AccountType } from '@/types/beancount';
import AccountModal from '@/components/AccountModal';

const accountTypeColors: Record<AccountType, 'blue' | 'red' | 'green' | 'grey'> = {
  Assets: 'green',
  Liabilities: 'red',
  Equity: 'blue',
  Income: 'blue',
  Expenses: 'grey',
};

export default function Accounts() {
  const { accounts, deleteAccount, fetchAccounts } = useBeancountStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAccounts();
      } catch (error: any) {
        console.error("Error loading accounts:", error);
        alert(`Failed to load accounts: ${error.message}\n\nPlease check that the Beancount file path is set correctly in Settings.`);
      }
    };
    loadData();
  }, []);

  const accountsByType = accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = [];
    }
    acc[account.type].push(account);
    return acc;
  }, {} as Record<AccountType, Account[]>);

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete account "${name}"?`)) {
      deleteAccount(name);
    }
  };

  const handleNew = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const breadcrumbs = [
    { text: 'Friday', href: '/' },
    { text: 'Accounts', href: '/accounts' },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Manage your chart of accounts"
        actions={
          <Button variant="primary" onClick={handleNew}>
            New Account
          </Button>
        }
      >
        Accounts
      </Header>

      {(['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'] as AccountType[]).map((type) => {
        const typeAccounts = accountsByType[type] || [];
        return (
          <Container
            key={type}
            variant="stacked"
            header={
              <Header
                variant="h2"
                counter={`(${typeAccounts.length})`}
                actions={
                  <Badge color={accountTypeColors[type]}>
                    {typeAccounts.length} accounts
                  </Badge>
                }
              >
                {type}
              </Header>
            }
          >
            {typeAccounts.length > 0 ? (
              <Cards
                cardDefinition={{
                  header: (item) => item.name,
                  sections: [
                    {
                      id: 'date',
                      header: 'Opened',
                      content: (item) => new Date(item.openDate).toLocaleDateString(),
                    },
                    {
                      id: 'closed',
                      header: 'Status',
                      content: (item) => item.closeDate ? `Closed: ${new Date(item.closeDate).toLocaleDateString()}` : 'Open',
                    },
                  ],
                }}
                cardsPerRow={[{ cards: 3 }]}
                items={typeAccounts.map((account) => ({
                  ...account,
                  actions: (
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button
                        variant="inline-link"
                        onClick={() => handleEdit(account)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="inline-link"
                        onClick={() => handleDelete(account.name)}
                      >
                        Delete
                      </Button>
                    </SpaceBetween>
                  ),
                }))}
              />
            ) : (
              <Box textAlign="center" padding={{ vertical: 'xl' }}>
                No {type.toLowerCase()} accounts yet
              </Box>
            )}
          </Container>
        );
      })}

      {isModalOpen && (
        <AccountModal
          account={editingAccount}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAccount(null);
          }}
        />
      )}
    </SpaceBetween>
  );
}
