import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, TrendingUp, User } from "lucide-react";

interface HeaderProps {
  onMenuOpen: () => void;
}

function truncatePrincipal(principal: string) {
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 8)}…${principal.slice(-5)}`;
}

export function Header({ onMenuOpen }: HeaderProps) {
  const { isAuthenticated, clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const principal = identity?.getPrincipal().toString() ?? "";

  const handleLogout = () => {
    clear();
    queryClient.clear();
  };

  return (
    <header
      className="h-16 border-b border-border bg-card flex items-center justify-between px-4 gap-4 flex-shrink-0"
      data-ocid="header"
    >
      {/* Left: mobile menu + title */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            type="button"
            onClick={onMenuOpen}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Open navigation"
            data-ocid="header.menu_button"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {isMobile && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-display font-bold text-foreground text-sm tracking-tight">
              ForexLens AI
            </span>
          </div>
        )}
      </div>

      {/* Right: user menu */}
      <div className="flex items-center gap-2 ml-auto">
        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 h-9 px-3 text-muted-foreground hover:text-foreground"
                data-ocid="header.user_menu"
              >
                <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                {!isMobile && (
                  <span className="font-mono text-xs">
                    {truncatePrincipal(principal)}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground font-body">
                  Signed in as
                </p>
                <p className="text-xs font-mono text-foreground truncate mt-0.5">
                  {principal}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive gap-2"
                data-ocid="header.logout_button"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
