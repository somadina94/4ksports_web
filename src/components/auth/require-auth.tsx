"use client";

import { type PropsWithChildren, useEffect, useState } from "react";
import { readToken } from "@/src/lib/api";
import LoginPromo from "@/src/components/auth/login-promo";

export default function RequireAuth({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(readToken()));
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-[40vh] animate-pulse rounded-xl border border-zinc-200 bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-900/30" />
    );
  }

  if (!authed) {
    return <LoginPromo />;
  }

  return <>{children}</>;
}
