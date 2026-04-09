import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-zinc-200/80 bg-zinc-50/80 py-10 dark:border-zinc-800 dark:bg-zinc-950/50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="max-w-md">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">4K Sportsbook</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Event odds, tickets, and balance features for users 18+. Play responsibly.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm">
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Legal</p>
            <Link
              href="/terms"
              className="text-zinc-700 underline-offset-4 hover:text-indigo-600 hover:underline dark:text-zinc-300 dark:hover:text-indigo-400"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              href="/privacy"
              className="text-zinc-700 underline-offset-4 hover:text-indigo-600 hover:underline dark:text-zinc-300 dark:hover:text-indigo-400"
            >
              Privacy Policy
            </Link>
          </div>
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Product</p>
            <Link href="/events" className="text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400">
              Events
            </Link>
            <Link href="/auth/login" className="text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 w-full max-w-7xl border-t border-zinc-200/60 px-4 pt-6 text-center text-xs text-zinc-500 dark:border-zinc-800/80 md:px-6">
        © {year} 4K Sportsbook. All rights reserved.
      </div>
    </footer>
  );
}
