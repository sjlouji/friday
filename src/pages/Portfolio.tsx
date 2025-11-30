import { useBeancountStore } from "@/store/beancountStore";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Grid from "@cloudscape-design/components/grid";
import Box from "@cloudscape-design/components/box";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import SpaceBetween from "@cloudscape-design/components/space-between";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
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
  const { transactions, portfolios } = useBeancountStore();

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
  const totalGain = portfolioData.reduce((sum, p) => sum + p.gain, 0);
  const totalGainPercent =
    portfolioData.reduce((sum, p) => sum + p.totalCost, 0) > 0
      ? (totalGain / portfolioData.reduce((sum, p) => sum + p.totalCost, 0)) *
        100
      : 0;

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
          <Box variant="h1">
            $
            {totalPortfolioValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Box>
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">Total Gain/Loss</Header>}
        >
          <Box
            variant="h1"
            color={totalGain >= 0 ? "text-status-success" : "text-status-error"}
          >
            {totalGain >= 0 ? "+" : ""}$
            {totalGain.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Box>
          <StatusIndicator type={totalGain >= 0 ? "success" : "error"}>
            {totalGain >= 0 ? "Positive" : "Negative"}
          </StatusIndicator>
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">Total Return</Header>}
        >
          <Box
            variant="h1"
            color={
              totalGainPercent >= 0
                ? "text-status-success"
                : "text-status-error"
            }
          >
            {totalGainPercent >= 0 ? "+" : ""}
            {totalGainPercent.toFixed(2)}%
          </Box>
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

      <Container
        variant="stacked"
        header={<Header variant="h2">Portfolio Details</Header>}
      >
        {portfolioData.length === 0 ? (
          <Box textAlign="center" padding={{ vertical: "xl" }}>
            No portfolio data available
          </Box>
        ) : (
          <SpaceBetween direction="vertical" size="m">
            {portfolioData.map((portfolio) => (
              <Container
                variant="stacked"
                key={portfolio.account}
                header={<Header variant="h3">{portfolio.account}</Header>}
              >
                <Box variant="h2">
                  $
                  {portfolio.totalValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Box>
                <StatusIndicator
                  type={portfolio.gain >= 0 ? "success" : "error"}
                >
                  {portfolio.gain >= 0 ? "+" : ""}${portfolio.gain.toFixed(2)} (
                  {portfolio.gainPercent >= 0 ? "+" : ""}
                  {portfolio.gainPercent.toFixed(2)}%)
                </StatusIndicator>
              </Container>
            ))}
          </SpaceBetween>
        )}
      </Container>
    </SpaceBetween>
  );
}
