import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import AppLayout from '@cloudscape-design/components/app-layout';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import TopNavigation from '@cloudscape-design/components/top-navigation';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      type: 'section',
      text: 'Overview',
      items: [
        { type: 'link', text: 'Dashboard', href: '/' },
      ],
    },
    {
      type: 'section',
      text: 'Transactions',
      items: [
        { type: 'link', text: 'Transactions', href: '/transactions' },
        { type: 'link', text: 'Accounts', href: '/accounts' },
      ],
    },
    {
      type: 'section',
      text: 'Reports & Analysis',
      items: [
        { type: 'link', text: 'Reports', href: '/reports' },
        { type: 'link', text: 'Portfolio', href: '/portfolio' },
        { type: 'link', text: 'Budget', href: '/budget' },
      ],
    },
    {
      type: 'section',
      text: 'Settings',
      items: [
        { type: 'link', text: 'Import', href: '/import' },
        { type: 'link', text: 'Settings', href: '/settings' },
      ],
    },
  ];

  const activeHref = location.pathname;

  return (
    <AppLayout
      header={
        <TopNavigation
          identity={{
            href: '/',
            title: 'Friday',
            logo: {
              src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzE2ODk0RiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5GPC90ZXh0Pgo8L3N2Zz4K',
              alt: 'Friday',
            },
          }}
        />
      }
      navigation={
        <SideNavigation
          header={{
            href: '/',
            text: 'Friday',
          }}
          items={navItems.map((section) => {
            if (section.type === 'section') {
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
      }
      content={<Outlet />}
      toolsHide={true}
      navigationWidth={220}
    />
  );
}
