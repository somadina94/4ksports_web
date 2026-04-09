"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { persistAuthUser, persistToken, readAuthUser } from "@/src/lib/api";
import type { AuthUser } from "@/src/types/domain";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import ThemeToggle from "@/src/components/theme-toggle";

const menuItems = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Tickets", href: "/tickets" },
  { label: "Wallet", href: "/wallet" },
  { label: "Deposits", href: "/deposits" },
  { label: "Admin", href: "/admin", adminOnly: true },
  { label: "Login", href: "/auth/login" },
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

  return (
    <div className="min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-200/60 bg-white/75 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight">4K Sports</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {user ? `${user.username} (${user.role})` : "Not logged in"}
          </p>
          <ThemeToggle />
          {user && (
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1 rounded-xl border border-zinc-200 bg-white/75 p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            {menuItems
              .filter((item) => !(item.href === "/auth/login" && !!user))
              .filter((item) => !(item.adminOnly && user?.role !== "admin"))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm transition",
                    pathname === item.href
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                  )}
                >
                  {item.label}
                </Link>
              ))}
          </nav>
        </aside>
        <main className="grid gap-6">{children}</main>
      </div>
    </div>
  );
}
