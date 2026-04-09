"use client";

import { useEffect, useState, type ComponentType, type PropsWithChildren } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Home,
  PiggyBank,
  Shield,
  Ticket,
  Trophy,
  Wallet,
} from "lucide-react";
import { persistAuthUser, persistToken, readAuthUser } from "@/src/lib/api";
import type { AuthUser } from "@/src/types/domain";
import { Button } from "@/src/components/ui/button";
import ThemeToggle from "@/src/components/theme-toggle";
import AnnouncementTicker from "@/src/components/layout/announcement-ticker";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

type MenuItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const menuItems: MenuItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Tickets", href: "/tickets", icon: Ticket },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Deposits", href: "/deposits", icon: PiggyBank },
  { label: "Admin", href: "/admin", icon: Shield, adminOnly: true },
];

export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(readAuthUser());
  }, []);

  const handleLogout = () => {
    persistToken("");
    persistAuthUser(null);
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const visibleItems = menuItems.filter(
    (item) => !(item.adminOnly && user?.role !== "admin"),
  );

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border">
          <SidebarHeader className="gap-2 border-b border-sidebar-border pb-2">
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild tooltip="4K Sports">
                  <Link href="/">
                    <Trophy className="size-5 shrink-0" />
                    <span className="font-semibold tracking-tight">4K Sports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className="gap-2">
            <SidebarGroup className="gap-3">
              <SidebarGroupLabel className="px-1">Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.label}
                        >
                          <Link href={item.href}>
                            <Icon className="shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="min-h-svh bg-transparent">
          <div className="sticky top-0 z-30 border-b border-zinc-200/60 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 md:px-6">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                4K Sports
              </h1>
              <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                <p className="hidden text-xs text-zinc-600 sm:block dark:text-zinc-400">
                  {user ? `${user.username} (${user.role})` : "Not logged in"}
                </p>
                <ThemeToggle />
                {user ? (
                  <Button size="sm" variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/auth/login")}
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
            <AnnouncementTicker />
          </div>

          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
