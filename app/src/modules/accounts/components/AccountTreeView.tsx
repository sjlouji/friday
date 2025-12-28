import * as React from "react";
import TreeView from "@cloudscape-design/components/tree-view";
import Icon from "@cloudscape-design/components/icon";
import { Account } from "@/types/beancount";
import { formatIndianCurrency } from "@/lib/utils/currency";

interface AccountTreeViewProps {
  accounts: Account[];
  balances: Record<string, { number: string; currency: string }>;
  onEdit: (account: Account) => void;
  onDelete: (name: string) => void;
}

interface TreeNode {
  id: string;
  content: string;
  iconName: "folder" | "file";
  nestedItems?: TreeNode[];
  account?: Account;
  balance?: { number: string; currency: string };
}

export default function AccountTreeView({
  accounts,
  balances,
  onEdit,
  onDelete,
}: AccountTreeViewProps) {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const buildTree = React.useMemo(() => {
    const root: Record<string, TreeNode> = {};

    accounts.forEach((account) => {
      const parts = account.name.split(":");
      let current = root;

      parts.forEach((part, index) => {
        const fullName = parts.slice(0, index + 1).join(":");
        const isLeaf = index === parts.length - 1;
        const nodeId = fullName;

        if (!current[part]) {
          current[part] = {
            id: nodeId,
            content: part,
            iconName: isLeaf ? "file" : "folder",
            nestedItems: [],
            ...(isLeaf ? { account, balance: balances[account.name] } : {}),
          };
        }

        if (isLeaf && current[part].account) {
          current[part].account = account;
          current[part].balance = balances[account.name];
        }

        if (!current[part].nestedItems) {
          current[part].nestedItems = [];
        }

        current = current[part].nestedItems as unknown as Record<string, TreeNode>;
      });
    });

    const calculateBalances = (node: TreeNode): void => {
      if (node.nestedItems && node.nestedItems.length > 0) {
        node.nestedItems.forEach((child) => {
          calculateBalances(child);
        });

        const totalBalance = node.nestedItems.reduce(
          (sum, child) => {
            const childBalance = child.balance
              ? parseFloat(child.balance.number)
              : 0;
            return sum + childBalance;
          },
          node.balance ? parseFloat(node.balance.number) : 0
        );

        const currency =
          node.balance?.currency ||
          node.nestedItems.find((n) => n.balance?.currency)?.balance?.currency ||
          "INR";

        node.balance = {
          number: totalBalance.toString(),
          currency,
        };
      }
    };

    const rootNodes = Object.values(root);
    rootNodes.forEach((node) => calculateBalances(node));

    return rootNodes;
  }, [accounts, balances]);

  const renderItem = (item: TreeNode) => {
    const balanceText = item.balance
      ? formatIndianCurrency(
          parseFloat(item.balance.number),
          item.balance.currency
        )
      : "";

    return {
      icon: <Icon name={item.iconName} ariaLabel={item.iconName} />,
      content: (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <span>{item.content}</span>
          {balanceText && (
            <span style={{ marginLeft: "16px", color: "var(--color-text-body-secondary)", fontSize: "14px" }}>
              {balanceText}
            </span>
          )}
        </div>
      ),
    };
  };

  const handleItemToggle = ({ detail }: any) => {
    setExpandedItems((prev) =>
      detail.expanded
        ? [...prev, detail.item.id]
        : prev.filter((id) => id !== detail.item.id)
    );
  };

  if (buildTree.length === 0) {
    return null;
  }

  return (
    <TreeView
      items={buildTree}
      expandedItems={expandedItems}
      renderItem={renderItem}
      getItemId={(item) => item.id}
      getItemChildren={(item) => item.nestedItems || []}
      onItemToggle={handleItemToggle}
      ariaLabel="Account hierarchy tree view"
    />
  );
}

