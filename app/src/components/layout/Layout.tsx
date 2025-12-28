import { useLocation, useNavigate, Outlet } from "react-router-dom";
import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from "@cloudscape-design/components/side-navigation";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import { useBeancountData } from "@/hooks/useBeancountData";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useBeancountData();

  const navItems = [
    {
      type: "section",
      text: "Overview",
      items: [{ type: "link", text: "Dashboard", href: "/" }],
    },
    {
      type: "section",
      text: "Transactions",
      items: [
        { type: "link", text: "Transactions", href: "/transactions" },
        { type: "link", text: "Recurring", href: "/recurring" },
        { type: "link", text: "Accounts", href: "/accounts" },
      ],
    },
    {
      type: "section",
      text: "Assets & Liabilities",
      items: [
        { type: "link", text: "Assets", href: "/assets" },
        { type: "link", text: "Debt", href: "/debt" },
        { type: "link", text: "Investments", href: "/portfolio" },
      ],
    },
    {
      type: "section",
      text: "Planning & Budgeting",
      items: [
        { type: "link", text: "Budget", href: "/budget" },
        { type: "link", text: "Bills", href: "/bills" },
        { type: "link", text: "Goals", href: "/goals" },
        { type: "link", text: "Tax Planning", href: "/tax" },
      ],
    },
    {
      type: "section",
      text: "Reports & Analysis",
      items: [
        { type: "link", text: "Reports", href: "/reports" },
        { type: "link", text: "Portfolio", href: "/portfolio" },
      ],
    },
    {
      type: "section",
      text: "Settings",
      items: [
        { type: "link", text: "Import", href: "/import" },
        { type: "link", text: "Settings", href: "/settings" },
      ],
    },
  ];

  const activeHref = location.pathname;

  return (
    <div
      className="app-layout-wrapper"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}
      >
        <TopNavigation
          identity={{
            href: "/",
            title: "Friday",
            logo: {
              src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0ZGNjkwMCIvPgo8cGF0aCBkPSJNMTIgMkw2IDdIMTJWMTdINkwxMiAyMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==",
              alt: "Friday",
            },
          }}
          utilities={[
            {
              type: "button",
              iconName: "settings",
              text: "Settings",
              href: "/settings",
              onClick: (e) => {
                e.preventDefault();
                navigate("/settings");
              },
            },
          ]}
          i18nStrings={{
            searchIconAriaLabel: "Search",
            searchDismissIconAriaLabel: "Close search",
            overflowMenuTriggerText: "More",
            overflowMenuTitleText: "All",
            overflowMenuBackIconAriaLabel: "Back",
            overflowMenuDismissIconAriaLabel: "Close menu",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "60px",
          height: "calc(100vh - 60px)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "fixed",
            left: 0,
            top: "60px",
            bottom: 0,
            width: "220px",
            zIndex: 999,
            overflowY: "auto",
          }}
        >
          <SideNavigation
            header={{
              href: "/",
              text: "Friday",
            }}
            items={navItems.map((section) => {
              if (section.type === "section") {
                return {
                  ...section,
                  items: section.items.map((item) => ({
                    ...item,
                    active: activeHref === item.href,
                  })),
                };
              }
              return {
                ...section,
                active: activeHref === section.href,
              };
            })}
            onFollow={(e) => {
              e.preventDefault();
              if (e.detail.href) {
                navigate(e.detail.href);
              }
            }}
          />
        </div>
        <div
          style={{
            marginLeft: "220px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <div
            className="content-scroll-area"
            style={{
              flex: 1,
              overflow: "auto",
              padding: "16px",
            }}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

