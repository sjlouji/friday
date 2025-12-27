import { useState, useEffect, useMemo } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Grid from "@cloudscape-design/components/grid";
import Box from "@cloudscape-design/components/box";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import SpaceBetween from "@cloudscape-design/components/space-between";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Table from "@cloudscape-design/components/table";
import Select from "@cloudscape-design/components/select";
import Tabs from "@cloudscape-design/components/tabs";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import { format, subMonths } from "date-fns";
import { formatIndianCurrency } from "@/lib/utils/currency";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Portfolio() {
  const { transactions, portfolios, loadAll } = useBeancountStore();
  const [timeRange, setTimeRange] = useState<"1M" | "3M" | "6M" | "1Y" | "ALL">(
    "1Y"
  );

  useEffect(() => {
    loadAll();
  }, []);

  const portfolioData = portfolios.map((portfolio) => {
    const totalCost = portfolio.positions.reduce(
      (sum, pos) =>
        sum + parseFloat(pos.cost.number) * parseFloat(pos.quantity),
      0
    );
    const totalValue = portfolio.positions.reduce(
      (sum, pos) =>
        sum + parseFloat(pos.value.number) * parseFloat(pos.quantity),
      0
    );
    const gain = totalValue - totalCost;
    const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0;

    return {
      ...portfolio,
      totalCost,
      totalValue,
      gain,
      gainPercent,
    };
  });

  const allPositions = portfolios.flatMap((p) =>
    p.positions.map((pos) => ({
      ...pos,
      portfolio: p.account,
      value: parseFloat(pos.value.number) * parseFloat(pos.quantity),
    }))
  );

  const chartData = allPositions.map((pos) => ({
    name: pos.commodity,
    value: pos.value,
  }));

  const COLORS = [
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
  ];

  const totalPortfolioValue = portfolioData.reduce(
    (sum, p) => sum + p.totalValue,
    0
  );
  const totalCost = portfolioData.reduce((sum, p) => sum + p.totalCost, 0);
  const totalGain = portfolioData.reduce((sum, p) => sum + p.gain, 0);
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const holdingsByCommodity = useMemo(() => {
    const grouped: Record<
      string,
      { quantity: number; cost: number; value: number }
    > = {};
    allPositions.forEach((pos) => {
      if (!grouped[pos.commodity]) {
        grouped[pos.commodity] = { quantity: 0, cost: 0, value: 0 };
      }
      grouped[pos.commodity].quantity += parseFloat(pos.quantity);
      grouped[pos.commodity].cost +=
        parseFloat(pos.cost.number) * parseFloat(pos.quantity);
      grouped[pos.commodity].value += pos.value;
    });
    return grouped;
  }, [allPositions]);

  const holdingsByAccount = useMemo(() => {
    const grouped: Record<
      string,
      { cost: number; value: number; gain: number }
    > = {};
    portfolioData.forEach((p) => {
      grouped[p.account] = {
        cost: p.totalCost,
        value: p.totalValue,
        gain: p.gain,
      };
    });
    return grouped;
  }, [portfolioData]);

  const holdingsByCurrency = useMemo(() => {
    const grouped: Record<string, number> = {};
    allPositions.forEach((pos) => {
      const currency = pos.cost.currency || "INR";
      grouped[currency] = (grouped[currency] || 0) + pos.value;
    });
    return grouped;
  }, [allPositions]);

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: "Portfolio", href: "/portfolio" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header variant="h1" description="Track your investments and holdings">
        Portfolio
      </Header>

      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
        <Container
          variant="stacked"
          header={<Header variant="h2">Total Portfolio Value</Header>}
        >
          <Box variant="h1">{formatIndianCurrency(totalPortfolioValue)}</Box>
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">Total Cost Basis</Header>}
        >
          <Box variant="h1">{formatIndianCurrency(totalCost)}</Box>
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">Total Gain/Loss</Header>}
        >
          <Box
            variant="h1"
            color={totalGain >= 0 ? "text-status-success" : "text-status-error"}
          >
            {totalGain >= 0 ? "+" : ""}
            {formatIndianCurrency(totalGain)}
          </Box>
          <StatusIndicator type={totalGain >= 0 ? "success" : "error"}>
            {totalGainPercent >= 0 ? "+" : ""}
            {totalGainPercent.toFixed(2)}% Return
          </StatusIndicator>
        </Container>
      </Grid>

      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        <Container
          variant="stacked"
          header={<Header variant="h2">Asset Allocation</Header>}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Container>

        <Container
          variant="stacked"
          header={<Header variant="h2">Holdings Value</Header>}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </Container>
      </Grid>

      <Tabs
        tabs={[
          {
            label: "Portfolio Summary",
            id: "summary",
            content: (
              <Container
                variant="stacked"
                header={<Header variant="h2">Portfolio by Account</Header>}
              >
                {portfolioData.length === 0 ? (
                  <Box textAlign="center" padding={{ vertical: "xl" }}>
                    No portfolio data available
                  </Box>
                ) : (
                  <Table
                    columnDefinitions={[
                      {
                        id: "account",
                        header: "Account",
                        cell: (item) => item.account,
                      },
                      {
                        id: "cost",
                        header: "Total Cost",
                        cell: (item) => formatIndianCurrency(item.totalCost),
                      },
                      {
                        id: "value",
                        header: "Current Value",
                        cell: (item) => formatIndianCurrency(item.totalValue),
                      },
                      {
                        id: "gain",
                        header: "Gain/Loss",
                        cell: (item) => (
                          <Box
                            color={
                              item.gain >= 0
                                ? "text-status-success"
                                : "text-status-error"
                            }
                          >
                            {item.gain >= 0 ? "+" : ""}
                            {formatIndianCurrency(item.gain)}
                          </Box>
                        ),
                      },
                      {
                        id: "return",
                        header: "Return %",
                        cell: (item) => (
                          <StatusIndicator
                            type={item.gainPercent >= 0 ? "success" : "error"}
                          >
                            {item.gainPercent >= 0 ? "+" : ""}
                            {item.gainPercent.toFixed(2)}%
                          </StatusIndicator>
                        ),
                      },
                    ]}
                    items={portfolioData}
                  />
                )}
              </Container>
            ),
          },
          {
            label: "Holdings",
            id: "holdings",
            content: (
              <Container
                variant="stacked"
                header={<Header variant="h2">All Holdings</Header>}
              >
                {allPositions.length === 0 ? (
                  <Box textAlign="center" padding={{ vertical: "xl" }}>
                    No holdings data available
                  </Box>
                ) : (
                  <Table
                    columnDefinitions={[
                      {
                        id: "commodity",
                        header: "Symbol",
                        cell: (item) => item.commodity,
                        sortingField: "commodity",
                      },
                      {
                        id: "quantity",
                        header: "Quantity",
                        cell: (item) => parseFloat(item.quantity).toFixed(4),
                      },
                      {
                        id: "cost",
                        header: "Cost Basis",
                        cell: (item) =>
                          `${formatIndianCurrency(parseFloat(item.cost.number))} ${item.cost.currency}`,
                      },
                      {
                        id: "value",
                        header: "Current Value",
                        cell: (item) => formatIndianCurrency(item.value),
                      },
                      {
                        id: "portfolio",
                        header: "Portfolio",
                        cell: (item) => item.portfolio,
                      },
                    ]}
                    items={allPositions}
                    sortingColumn={{ sortingField: "commodity" }}
                  />
                )}
              </Container>
            ),
          },
          {
            label: "By Commodity",
            id: "by-commodity",
            content: (
              <Container
                variant="stacked"
                header={<Header variant="h2">Holdings by Commodity</Header>}
              >
                <KeyValuePairs
                  items={Object.entries(holdingsByCommodity)
                    .sort((a, b) => b[1].value - a[1].value)
                    .map(([commodity, data]) => ({
                      label: `${commodity} (${data.quantity.toFixed(4)} units)`,
                      value: `${formatIndianCurrency(data.value)} (Cost: ${formatIndianCurrency(data.cost)})`,
                    }))}
                />
              </Container>
            ),
          },
          {
            label: "By Account",
            id: "by-account",
            content: (
              <Container
                variant="stacked"
                header={<Header variant="h2">Holdings by Account</Header>}
              >
                <KeyValuePairs
                  items={Object.entries(holdingsByAccount)
                    .sort((a, b) => b[1].value - a[1].value)
                    .map(([account, data]) => ({
                      label: account,
                      value: `${formatIndianCurrency(data.value)} (Gain: ${formatIndianCurrency(data.gain)})`,
                    }))}
                />
              </Container>
            ),
          },
          {
            label: "By Currency",
            id: "by-currency",
            content: (
              <Container
                variant="stacked"
                header={<Header variant="h2">Holdings by Currency</Header>}
              >
                <KeyValuePairs
                  items={Object.entries(holdingsByCurrency)
                    .sort((a, b) => b[1] - a[1])
                    .map(([currency, value]) => ({
                      label: currency,
                      value: formatIndianCurrency(value),
                    }))}
                />
              </Container>
            ),
          },
        ]}
      />
    </SpaceBetween>
  );
}
