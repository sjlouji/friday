import { useState, useEffect } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import { format, startOfYear, endOfYear } from "date-fns";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Table from "@cloudscape-design/components/table";
import Button from "@cloudscape-design/components/button";
import Badge from "@cloudscape-design/components/badge";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Select from "@cloudscape-design/components/select";
import Grid from "@cloudscape-design/components/grid";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Transaction } from "@/types/beancount";
import { formatIndianCurrency } from "@/lib/utils/currency";

export default function Tax() {
  const { t } = useTranslation();
  const { transactions, accounts } = useBeancountStore();

  // Indian Financial Year: April 1 to March 31
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  // If current month is Jan-Mar, FY is previous year to current year
  // If current month is Apr-Dec, FY is current year to next year
  const fyStartYear = currentMonth >= 4 ? currentYear : currentYear - 1;
  const defaultTaxYear = fyStartYear.toString();

  const [taxYear, setTaxYear] = useState(defaultTaxYear);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Indian FY: April 1 to March 31
  const yearStart = new Date(`${taxYear}-04-01`);
  const yearEnd = new Date(`${parseInt(taxYear) + 1}-03-31`);

  const yearTransactions = transactions.filter(
    (t) => new Date(t.date) >= yearStart && new Date(t.date) <= yearEnd
  );

  // Indian Tax Categories - Income Tax Act sections and GST
  const taxCategories = {
    deduction: [
      "Expenses:Tax:80C", // PPF, ELSS, Life Insurance, etc.
      "Expenses:Tax:80D", // Health Insurance
      "Expenses:Tax:80G", // Donations
      "Expenses:Tax:24B", // Home Loan Interest
      "Expenses:Tax:80E", // Education Loan Interest
      "Expenses:Tax:80TTA", // Savings Account Interest
      "Expenses:Tax:80CCD", // NPS
      "Expenses:Tax:80DDB", // Medical Treatment
      "Expenses:Tax:80U", // Disability
      "Expenses:Tax:80GGB", // Company Donations
      "Expenses:Tax:80GGC", // Political Donations
      "Expenses:Home:PropertyTax",
      "Expenses:Home:Maintenance",
      "Expenses:Medical",
      "Expenses:Education",
      "Expenses:Business",
    ],
    income: [
      "Income:Salary",
      "Income:Salary:Allowances",
      "Income:Salary:Perquisites",
      "Income:Interest:FD",
      "Income:Interest:Savings",
      "Income:Interest:Other",
      "Income:Dividends",
      "Income:CapitalGains:STCG", // Short Term Capital Gains
      "Income:CapitalGains:LTCG", // Long Term Capital Gains
      "Income:Business:Profession",
      "Income:Business:Trade",
      "Income:Other:HouseProperty",
      "Income:Other:OtherSources",
    ],
    gst: [
      "Expenses:GST:Input:CGST",
      "Expenses:GST:Input:SGST",
      "Expenses:GST:Input:IGST",
      "Income:GST:Output:CGST",
      "Income:GST:Output:SGST",
      "Income:GST:Output:IGST",
    ],
  };

  const getTaxCategory = (account: string): string | null => {
    // Check GST first
    if (account.includes("GST")) {
      return "gst";
    }
    // Check specific tax sections
    for (const [category, accounts] of Object.entries(taxCategories)) {
      if (accounts.some((a) => account.includes(a.split(":")[1] || ""))) {
        return category;
      }
    }
    // Fallback to general categories
    if (account.startsWith("Expenses:Tax:")) return "deduction";
    if (account.startsWith("Expenses:")) return "deduction";
    if (account.startsWith("Income:")) return "income";
    return null;
  };

  const taxData = yearTransactions.reduce((acc, t) => {
    t.postings.forEach((p) => {
      const category = getTaxCategory(p.account);
      if (category && p.amount) {
        const amount = parseFloat(p.amount.number);
        if (!acc[category]) {
          acc[category] = {};
        }
        // Use full account path for better categorization
        const accountName =
          p.account.replace(/^(Expenses|Income):Tax?:?/, "") || p.account;
        if (!acc[category][accountName]) {
          acc[category][accountName] = 0;
        }
        acc[category][accountName] += Math.abs(amount);
      }
    });
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const totalDeductions = Object.values(taxData.deduction || {}).reduce(
    (sum, val) => sum + val,
    0
  );
  const totalIncome = Object.values(taxData.income || {}).reduce(
    (sum, val) => sum + val,
    0
  );
  const taxableIncome = totalIncome - totalDeductions;

  const deductionItems = Object.entries(taxData.deduction || {}).map(
    ([account, amount]) => ({
      label: account,
      value: formatIndianCurrency(amount),
    })
  );

  const incomeItems = Object.entries(taxData.income || {}).map(
    ([account, amount]) => ({
      label: account,
      value: formatIndianCurrency(amount),
    })
  );

  const gstItems = Object.entries(taxData.gst || {}).map(
    ([account, amount]) => ({
      label: account,
      value: formatIndianCurrency(amount),
    })
  );

  const chartData = [
    {
      category: "Income",
      amount: totalIncome,
    },
    {
      category: "Deductions",
      amount: totalDeductions,
    },
    {
      category: "Taxable Income",
      amount: taxableIncome,
    },
  ];

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: t("tax.title"), href: "/tax" },
  ];

  return (
    <SpaceBetween size="s">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Track Indian Income Tax deductions, GST, and income for tax planning (ITR)"
        actions={
          <Select
            selectedOption={{
              label: `FY ${taxYear}-${parseInt(taxYear) + 1}`,
              value: taxYear,
            }}
            onChange={(e) =>
              setTaxYear(e.detail.selectedOption.value || taxYear)
            }
            options={Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return {
                label: `FY ${year}-${year + 1} (AY ${year + 1}-${year + 2})`,
                value: year.toString(),
              };
            })}
          />
        }
      >
        Tax Planning (Indian)
      </Header>

      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
        <Container
          variant="stacked"
          header={<Header variant="h2">Total Income</Header>}
        >
          <Box variant="h1">{formatIndianCurrency(totalIncome)}</Box>
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">Total Deductions</Header>}
        >
          <Box variant="h1" color="text-status-success">
            {formatIndianCurrency(totalDeductions)}
          </Box>
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">Taxable Income</Header>}
        >
          <Box variant="h1">{formatIndianCurrency(taxableIncome)}</Box>
        </Container>
      </Grid>

      <Container
        variant="stacked"
        header={<Header variant="h2">Tax Summary</Header>}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </Container>

      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
        <Container
          variant="stacked"
          header={<Header variant="h2">Income Sources</Header>}
        >
          {incomeItems.length > 0 ? (
            <KeyValuePairs items={incomeItems} />
          ) : (
            <Box textAlign="center" padding={{ vertical: "xl" }}>
              No income data for FY {taxYear}-{parseInt(taxYear) + 1}
            </Box>
          )}
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">Tax Deductions (80C, 80D, etc.)</Header>}
        >
          {deductionItems.length > 0 ? (
            <KeyValuePairs items={deductionItems} />
          ) : (
            <Box textAlign="center" padding={{ vertical: "xl" }}>
              No deduction data for FY {taxYear}-{parseInt(taxYear) + 1}
            </Box>
          )}
        </Container>
        <Container
          variant="stacked"
          header={<Header variant="h2">GST (CGST/SGST/IGST)</Header>}
        >
          {gstItems.length > 0 ? (
            <KeyValuePairs items={gstItems} />
          ) : (
            <Box textAlign="center" padding={{ vertical: "xl" }}>
              No GST data for FY {taxYear}-{parseInt(taxYear) + 1}
            </Box>
          )}
        </Container>
      </Grid>

      <Container
        variant="stacked"
        header={<Header variant="h2">Tax Transactions</Header>}
      >
        <Table
          columnDefinitions={[
            {
              id: "date",
              header: "Date",
              cell: (item) => format(new Date(item.date), "MMM dd, yyyy"),
              sortingField: "date",
            },
            {
              id: "description",
              header: "Description",
              cell: (item) => `${item.payee || ""} ${item.narration}`.trim(),
            },
            {
              id: "account",
              header: "Account",
              cell: (item) => {
                const taxPosting = item.postings.find(
                  (p: any) =>
                    getTaxCategory(p.account) === selectedCategory ||
                    selectedCategory === "all"
                );
                return taxPosting?.account || "-";
              },
            },
            {
              id: "amount",
              header: "Amount",
              cell: (item) => {
                const taxPosting = item.postings.find(
                  (p: any) =>
                    getTaxCategory(p.account) === selectedCategory ||
                    selectedCategory === "all"
                );
                if (taxPosting?.amount) {
                  return formatIndianCurrency(
                    parseFloat(taxPosting.amount.number)
                  );
                }
                return "-";
              },
            },
            {
              id: "category",
              header: "Tax Category",
              cell: (item) => {
                const taxPosting = item.postings.find(
                  (p: any) =>
                    getTaxCategory(p.account) === selectedCategory ||
                    selectedCategory === "all"
                );
                if (taxPosting) {
                  const category = getTaxCategory(taxPosting.account);
                  return (
                    <Badge
                      color={
                        category === "deduction"
                          ? "green"
                          : category === "income"
                          ? "blue"
                          : "grey"
                      }
                    >
                      {category || "Other"}
                    </Badge>
                  );
                }
                return "-";
              },
            },
          ]}
          items={yearTransactions.filter((t) => {
            if (selectedCategory === "all") return true;
            return t.postings.some(
              (p) => getTaxCategory(p.account) === selectedCategory
            );
          })}
          sortingColumn={{ sortingField: "date", sortingDescending: true }}
        />
      </Container>
    </SpaceBetween>
  );
}
