import { useState, useMemo } from "react";
import { Account } from "@/types/beancount";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { formatIndianCurrency } from "@/lib/utils/currency";

interface AccountNode {
  name: string;
  fullName: string;
  account?: Account;
  children: Record<string, AccountNode>;
  balance: number;
  currency: string;
  level: number;
}

interface AccountTreeProps {
  accounts: Account[];
  balances: Record<string, { number: string; currency: string }>;
  onEdit: (account: Account) => void;
  onDelete: (name: string) => void;
}

export default function AccountTree({
  accounts,
  balances,
  onEdit,
  onDelete,
}: AccountTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const tree = useMemo(() => {
    const root: Record<string, AccountNode> = {};

    accounts.forEach((account) => {
      const parts = account.name.split(":");
      let current = root;

      parts.forEach((part, index) => {
        const fullName = parts.slice(0, index + 1).join(":");
        const isLeaf = index === parts.length - 1;

        if (!current[part]) {
          current[part] = {
            name: part,
            fullName,
            children: {},
            balance: 0,
            currency: "INR",
            level: index,
            ...(isLeaf ? { account } : {}),
          };
        }

        if (isLeaf && current[part].account) {
          current[part].account = account;
        }

        current = current[part].children;
      });
    });

    const calculateBalances = (node: AccountNode): void => {
      if (node.account) {
        const balance = balances[node.account.name];
        if (balance) {
          node.balance = parseFloat(balance.number);
          node.currency = balance.currency;
        }
      }

      Object.values(node.children).forEach((child) => {
        calculateBalances(child);
        node.balance += child.balance;
        if (child.currency && !node.currency) {
          node.currency = child.currency;
        }
      });
    };

    Object.values(root).forEach((node) => calculateBalances(node));

    return root;
  }, [accounts, balances]);

  const toggleNode = (fullName: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(fullName)) {
      newExpanded.delete(fullName);
    } else {
      newExpanded.add(fullName);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: AccountNode): JSX.Element => {
    const hasChildren = Object.keys(node.children).length > 0;
    const isExpanded = expandedNodes.has(node.fullName);
    const indent = node.level * 24;

    return (
      <Box key={node.fullName}>
        <Box
          padding={{ left: `${indent}px`, vertical: "xs" }}
          borderBottom="dashed"
        >
          <SpaceBetween direction="horizontal" size="m">
            <SpaceBetween direction="horizontal" size="xs">
              {hasChildren ? (
                <Button
                  variant="icon"
                  iconName={isExpanded ? "angle-down" : "angle-right"}
                  onClick={() => toggleNode(node.fullName)}
                  ariaLabel={isExpanded ? "Collapse" : "Expand"}
                />
              ) : (
                <Box width="24px" />
              )}
              <Box fontWeight={hasChildren ? "bold" : "normal"}>
                {node.name}
              </Box>
              {node.account && (
                <Box variant="small" color="text-body-secondary">
                  ({node.account.type})
                </Box>
              )}
            </SpaceBetween>
            <SpaceBetween direction="horizontal" size="m">
              <Box>
                {formatIndianCurrency(node.balance, node.currency)}
              </Box>
              {node.account && (
                <SpaceBetween direction="horizontal" size="xs">
                  <Button
                    variant="inline-link"
                    onClick={() => onEdit(node.account!)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="inline-link"
                    onClick={() => onDelete(node.account!.name)}
                  >
                    Delete
                  </Button>
                </SpaceBetween>
              )}
            </SpaceBetween>
          </SpaceBetween>
        </Box>
        {hasChildren && isExpanded && (
          <Box>
            {Object.values(node.children)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((child) => renderNode(child))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {Object.values(tree)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((node) => renderNode(node))}
    </Box>
  );
}

