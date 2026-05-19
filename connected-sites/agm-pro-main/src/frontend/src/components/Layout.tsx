import { UserRole } from "@/backend";
import { AgmYearSwitcher } from "@/components/AgmYearSwitcher";
import { SyncStatus } from "@/components/SyncStatus";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-backend";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ClipboardList,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  Menu,
  Presentation,
  Settings,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const BRAND_LOGO = "/assets/images/bcb-logo.png";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/shareholders", label: "Shareholders", icon: Users },
  {
    path: "/import",
    label: "Import",
    icon: Upload,
    roles: [UserRole.SuperAdmin, UserRole.Admin, UserRole.RegistrationOfficer],
  },
  {
    path: "/registration",
    label: "Registration",
    icon: ClipboardList,
    roles: [UserRole.SuperAdmin, UserRole.Admin, UserRole.RegistrationOfficer],
  },
  {
    path: "/board",
    label: "Board View",
    icon: Presentation,
    roles: [
      UserRole.SuperAdmin,
      UserRole.Admin,
      UserRole.ReportsViewer,
      UserRole.BoardViewer,
    ],
  },
  {
    path: "/reports",
    label: "Reports",
    icon: FileBarChart2,
    roles: [
      UserRole.SuperAdmin,
      UserRole.Admin,
      UserRole.RegistrationOfficer,
      UserRole.ReportsViewer,
    ],
  },
  {
    path: "/admin",
    label: "Admin",
    icon: Settings,
    roles: [UserRole.SuperAdmin, UserRole.Admin],
  },
];

const MOBILE_QUICK_PATHS = [
  "/",
  "/registration",
  "/shareholders",
  "/reports",
];

const ROLE_LABEL: Record<string, string> = {
  SuperAdmin: "Super Admin",
  Admin: "Admin",
  RegistrationOfficer: "Officer",
  ReportsViewer: "Reports Viewer",
  BoardViewer: "Board Viewer",
  Viewer: "Viewer",
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { data: settings } = useSettings();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );
  const mobileQuickItems = visibleItems.filter((item) =>
    MOBILE_QUICK_PATHS.includes(item.path),
  );

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path));

  return (
    <div className="app-shell-surface min-h-screen">
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 flex flex-col w-[92vw] max-w-80 glass-card-elevated border-r border-border/40 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/30 px-4 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-primary/25 bg-white ring-2 ring-primary/10">
              <img
                src={BRAND_LOGO}
                alt="Bawjiase Community Bank logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold leading-tight text-foreground">
                AGM Portal
              </div>
              <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                {settings?.agmName ?? "Annual General Meeting"}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "mb-1 flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                  isActive(item.path)
                    ? "bg-primary/15 text-primary"
                    : "text-foreground/70 hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/30 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <ThemeToggle />
            <SyncStatus />
          </div>
          <AgmYearSwitcher />
          {user ? (
            <div className="rounded-xl border border-border/40 bg-muted/35 px-3 py-3">
              <div className="text-sm font-semibold text-foreground truncate">
                {user.username}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {ROLE_LABEL[user.role] ?? user.role}
              </div>
            </div>
          ) : null}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={logout}
            data-ocid="nav.logout_button"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 glass-card border-b border-border/30 lg:border-none lg:bg-transparent lg:backdrop-blur-0">
          <div className="flex min-h-14 items-center justify-between gap-2 px-3 sm:px-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg hover:bg-muted/60"
              aria-label="Open menu"
              data-ocid="nav.mobile_menu_button"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-sm font-semibold text-foreground">
                AGM Portal
              </div>
              <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                {settings?.agmName ?? "Annual General Meeting"}
              </div>
            </div>

            <ThemeToggle />
          </div>

          <div className="hidden lg:block px-4 pt-4">
            <div className="glass-card-elevated rounded-2xl border border-border/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <Link to="/" className="flex w-[240px] shrink-0 items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-primary/25 bg-white ring-2 ring-primary/10">
                    <img
                      src={BRAND_LOGO}
                      alt="Bawjiase Community Bank logo"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-sm font-bold leading-tight text-foreground">
                      AGM PORTAL
                    </div>
                    <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                      {settings?.agmName ?? "Annual General Meeting"}
                    </div>
                  </div>
                </Link>

                <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto px-2">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-[12px] font-semibold whitespace-nowrap transition-smooth xl:text-sm",
                          isActive(item.path)
                            ? "bg-primary/15 text-primary"
                            : "text-foreground/70 hover:bg-muted/60 hover:text-foreground",
                        )}
                        data-ocid={`topnav.${item.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="flex w-[300px] shrink-0 items-center justify-end gap-2">
                  <div className="max-w-[120px] shrink-0">
                    <AgmYearSwitcher />
                  </div>
                  <SyncStatus />
                  <ThemeToggle />
                  {user ? (
                    <div className="flex items-center gap-2 rounded-full border border-border/40 bg-muted/30 py-1.5 pl-1.5 pr-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="max-w-[84px] truncate text-xs font-bold text-foreground">
                          {user.username}
                        </div>
                        <div className="text-[10px] uppercase text-muted-foreground">
                          {ROLE_LABEL[user.role] ?? user.role}
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={logout}
                    data-ocid="desktop.logout_button"
                    aria-label="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 pb-24 sm:p-4 sm:pb-24 lg:p-6">
          <div className="mb-3 lg:hidden">
            <AgmYearSwitcher />
          </div>
          {children}
        </main>

        {mobileQuickItems.length > 0 && (
          <nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
            <div
              className="glass-card-elevated grid gap-1 border-t border-border/70 bg-card/95 px-2 py-2 backdrop-blur-xl"
              style={{
                gridTemplateColumns: `repeat(${mobileQuickItems.length}, minmax(0, 1fr))`,
              }}
            >
              {mobileQuickItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(item.path));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex min-h-[60px] flex-col items-center justify-center gap-1.5 border px-1 pt-1 pb-1.5 text-center",
                      isActive
                        ? "border-primary/35 bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(58,110,255,0.26)]"
                        : "border-transparent bg-transparent text-foreground/68",
                    )}
                    data-ocid={`mobile.nav.${item.label.toLowerCase().replace(/ /g, "-")}.link`}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center border",
                        isActive
                          ? "border-primary-foreground/18 bg-primary-foreground/10"
                          : "border-border/55 bg-background/45",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span
                      className={cn(
                        "font-display text-[10px] font-semibold uppercase tracking-[0.22em] leading-none",
                        isActive
                          ? "text-primary-foreground"
                          : "text-foreground/68",
                      )}
                    >
                      {item.label === "Registration"
                        ? "Register"
                        : item.label === "Shareholders"
                          ? "People"
                          : item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
