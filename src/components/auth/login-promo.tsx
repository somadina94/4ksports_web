"use client";

import Link from "next/link";
import { Sparkles, Shield, Trophy } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function LoginPromo() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-violet-100 p-8 shadow-lg dark:border-indigo-900/50 dark:from-indigo-950/80 dark:via-zinc-950 dark:to-violet-950/50 md:p-12">
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/10" />
      <div className="relative mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md dark:bg-indigo-500">
          <Trophy className="size-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">
          Sign in to continue
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Access your wallet, deposits, withdrawals, and tickets with one secure login. New here?
          Create an account in seconds—only a username and password.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/auth/login" className="inline-flex">
            <Button className="w-full rounded-xl px-8 sm:w-auto">Log in</Button>
          </Link>
          <Link href="/auth/login" className="inline-flex">
            <Button variant="outline" className="w-full rounded-xl border-indigo-300 bg-white/80 dark:border-indigo-800 dark:bg-zinc-900/80 sm:w-auto">
              Create account
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-500">
          <Link href="/events" className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400">
            Browse events
          </Link>
          {" · "}
          <Link href="/" className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400">
            Home
          </Link>
        </p>
        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
          <div className="flex gap-3 rounded-xl border border-white/60 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <Shield className="mt-0.5 size-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Private by design</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">We only ask for a username and password.</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-white/60 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">18+ only</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Sports betting for adults. Play responsibly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
