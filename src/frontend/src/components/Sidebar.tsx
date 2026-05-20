import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  History,
  LayoutDashboard,
  ScanSearch,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Analysis", href: "/analyze", icon: ScanSearch },
  { label: "History", href: "/history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const isMobile = useIsMobile();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const sidebarContent = (
    <nav
      className="flex flex-col h-full bg-sidebar border-r border-sidebar-border"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border flex-shrink-0">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5"
          onClick={isMobile ? onClose : undefined}
        >
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <TrendingUp className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="font-display font-bold text-foreground text-base tracking-tight">
            ForexLens AI
          </span>
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            aria-label="Close sidebar"
            data-ocid="sidebar.close_button"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20 shadow-sm"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              )}
              data-ocid={`sidebar.nav.item.${i + 1}`}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />
              {item.label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border flex-shrink-0">
        <p className="text-[10px] text-muted-foreground/50 text-center font-body leading-relaxed">
          Powered by GPT-4o Vision
        </p>
      </div>
    </nav>
  );

  if (isMobile) {
    return (
      <>
        {open && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            role="button"
            tabIndex={-1}
            aria-label="Close sidebar overlay"
          />
        )}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
          data-ocid="sidebar"
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside className="hidden md:flex w-60 flex-shrink-0" data-ocid="sidebar">
      {sidebarContent}
    </aside>
  );
}
