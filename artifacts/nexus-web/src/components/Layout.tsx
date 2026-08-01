import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  ArrowRightLeft,
  Send,
  User,
} from "lucide-react";
import { NexusLogo } from "./NexusLogo";

const TABS = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { path: "/accounts", icon: CreditCard, label: "Accounts" },
  { path: "/transactions", icon: ArrowRightLeft, label: "History" },
  { path: "/send", icon: Send, label: "Send" },
  { path: "/profile", icon: User, label: "Profile" },
];

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showLogo?: boolean;
  headerRight?: React.ReactNode;
}

export function Layout({ children, title, showLogo = true, headerRight }: LayoutProps) {
  const location = useLocation();
  const hideTabs = ["/accounts/add", "/transactions/"].some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <div className="flex flex-col h-full bg-bg max-w-md mx-auto relative">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3 bg-bg sticky top-0 z-10">
        {showLogo && <NexusLogo size="xs" />}
        {title && !showLogo && <span />}
        {title && (
          <h1 className="text-fg font-bold text-xl absolute left-1/2 -translate-x-1/2">
            {title}
          </h1>
        )}
        {headerRight ?? <span />}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Bottom nav */}
      {!hideTabs && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border flex z-20">
          {TABS.map(({ path, icon: Icon, label }) => {
            const active =
              path === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(path);
            return (
              <NavLink
                key={path}
                to={path}
                className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors"
              >
                <Icon
                  size={22}
                  className={active ? "text-gold" : "text-muted"}
                />
                <span
                  className={`text-[10px] font-semibold ${
                    active ? "text-gold" : "text-muted"
                  }`}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      )}
    </div>
  );
}
