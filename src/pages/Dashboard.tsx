import { useEffect, useState } from 'react';
import { useBeancountStore } from '@/store/beancountStore';
import { format } from 'date-fns';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import Grid from '@cloudscape-design/components/grid';
import SpaceBetween from '@cloudscape-design/components/space-between';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Spinner from '@cloudscape-design/components/spinner';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { transactions, accounts, fetchDashboard, loadAll, loading } = useBeancountStore();
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    loadAll();
    fetchDashboard().then(setDashboardData);
  }, []);

  const netWorth = dashboardData?.netWorth || 0;
  const totalAssets = dashboardData?.totalAssets || 0;
  const totalLiabilities = dashboardData?.totalLiabilities || 0;

  const monthlyIncome = transactions
    .filter(t => t.postings.some(p => p.account.startsWith('Income')))
    .reduce((sum, t) => {
      const incomePosting = t.postings.find(p => p.account.startsWith('Income'));
      return sum + (incomePosting?.amount ? parseFloat(incomePosting.amount.number) : 0);
    }, 0);

  const monthlyExpenses = transactions
    .filter(t => t.postings.some(p => p.account.startsWith('Expenses')))
    .reduce((sum, t) => {
      const expensePosting = t.postings.find(p => p.account.startsWith('Expenses'));
      return sum + (expensePosting?.amount ? parseFloat(expensePosting.amount.number) : 0);
    }, 0);

  const recentTransactions = transactions.slice(-5).reverse();

  const expenseByCategory = transactions
    .filter(t => t.postings.some(p => p.account.startsWith('Expenses')))
    .reduce((acc, t) => {
      const expensePosting = t.postings.find(p => p.account.startsWith('Expenses'));
      if (expensePosting) {
        const category = expensePosting.account.split(':')[1] || 'Other';
        acc[category] = (acc[category] || 0) + (expensePosting.amount ? parseFloat(expensePosting.amount.number) : 0);
      }
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value: Math.abs(value),
  }));

  const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

  const monthlyData = transactions.reduce((acc, t) => {
    const month = format(new Date(t.date), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = { income: 0, expenses: 0, net: 0 };
    }
    t.postings.forEach(p => {
      if (p.account.startsWith('Income') && p.amount) {
        acc[month].income += parseFloat(p.amount.number);
      }
      if (p.account.startsWith('Expenses') && p.amount) {
        acc[month].expenses += Math.abs(parseFloat(p.amount.number));
      }
    });
    acc[month].net = acc[month].income - acc[month].expenses;
    return acc;
  }, {} as Record<string, { income: number; expenses: number; net: number }>);

  const monthlyChartData = Object.entries(monthlyData)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-6)
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.net,
    }));

  const dailyData = transactions.reduce((acc, t) => {
    const day = format(new Date(t.date), 'MMM d');
    if (!acc[day]) {
      acc[day] = { amount: 0 };
    }
    t.postings.forEach(p => {
      if (p.account.startsWith('Expenses') && p.amount) {
        acc[day].amount += Math.abs(parseFloat(p.amount.number));
      }
    });
    return acc;
  }, {} as Record<string, { amount: number }>);

  const dailyChartData = Object.entries(dailyData)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-30)
    .map(([day, data]) => ({
      day,
      amount: data.amount,
    }));

  const breadcrumbs = [
    { text: 'Friday', href: '/' },
    { text: 'Dashboard', href: '/' },
  ];

  if (loading && !dashboardData) {
    return (
      <Box textAlign="center" padding={{ vertical: 'xxl' }}>
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header variant="h1" description="Overview of your finances">
        Dashboard
      </Header>

      <Grid gridDefinition={[{ colspan: 3 }, { colspan: 3 }, { colspan: 3 }, { colspan: 3 }]}>
        <Container variant="stacked" header={<Header variant="h2">Net Worth</Header>}>
          <Box variant="h1" color="text-status-success">
            ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Box>
        </Container>
        <Container variant="stacked" header={<Header variant="h2">Total Assets</Header>}>
          <Box variant="h1" color="text-status-success">
            ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Box>
        </Container>
        <Container variant="stacked" header={<Header variant="h2">Monthly Income</Header>}>
          <Box variant="h1" color="text-status-info">
            ${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Box>
        </Container>
        <Container variant="stacked" header={<Header variant="h2">Monthly Expenses</Header>}>
          <Box variant="h1" color="text-status-error">
            ${monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Box>
        </Container>
      </Grid>

      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        <Container variant="stacked" header={<Header variant="h2">Income vs Expenses</Header>}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="#3b82f6" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </Container>

        <Container variant="stacked" header={<Header variant="h2">Net Cash Flow</Header>}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="net" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Net" />
            </AreaChart>
          </ResponsiveContainer>
        </Container>
      </Grid>

      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        <Container variant="stacked" header={<Header variant="h2">Expenses Trend</Header>}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#ef4444" name="Daily Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </Container>

        <Container variant="stacked" header={<Header variant="h2">Expenses by Category</Header>}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Container>
      </Grid>

      <Container
        variant="stacked"
        header={
          <Header variant="h2" counter={`(${recentTransactions.length})`}>
            Recent Transactions
          </Header>
        }
      >
        {recentTransactions.length === 0 ? (
          <Box textAlign="center" padding={{ vertical: 'xl' }}>
            No transactions yet
          </Box>
        ) : (
          <SpaceBetween direction="vertical" size="s">
            {recentTransactions.map((transaction) => (
              <Box key={transaction.id}>
                <SpaceBetween direction="horizontal" size="l">
                  <Box>
                    <Box variant="strong">{transaction.payee || transaction.narration}</Box>
                    <Box variant="small" color="text-body-secondary">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    {transaction.postings.map((posting, idx) => (
                      <Box
                        key={idx}
                        variant="strong"
                        color={
                          posting.account.startsWith('Expenses') || posting.account.startsWith('Assets')
                            ? 'text-status-error'
                            : 'text-status-success'
                        }
                      >
                        {posting.amount
                          ? `${posting.account.startsWith('Expenses') || posting.account.startsWith('Assets') ? '-' : '+'}$${parseFloat(posting.amount.number).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '-'}
                      </Box>
                    ))}
                  </Box>
                </SpaceBetween>
              </Box>
            ))}
          </SpaceBetween>
        )}
      </Container>
    </SpaceBetween>
  );
}
