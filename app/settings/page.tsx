"use client";

import { useState } from "react";
import AppShell from "@/src/components/layout/app-shell";
import RequireAuth from "@/src/components/auth/require-auth";
import { useSportsbook } from "@/src/hooks/useSportsbook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

export default function SettingsPage() {
  const { updatePassword } = useSportsbook();
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);

  return (
    <AppShell>
      <RequireAuth>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manage your account security.</p>
          </div>

          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>
                This is the only account credential you can update. We do not offer email or SMS recovery—
                store your password safely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="password"
                placeholder="Current password"
                value={pw.current}
                onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="New password"
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              />
              <Button
                disabled={
                  busy ||
                  !pw.current ||
                  !pw.next ||
                  pw.next !== pw.confirm ||
                  pw.next.length < 8
                }
                onClick={() => {
                  setBusy(true);
                  updatePassword({
                    passwordCurrent: pw.current,
                    password: pw.next,
                    passwordConfirm: pw.confirm,
                  })
                    .then(() => setPw({ current: "", next: "", confirm: "" }))
                    .catch(() => {})
                    .finally(() => setBusy(false));
                }}
              >
                {busy ? "Updating..." : "Update password"}
              </Button>
              <p className="text-xs text-zinc-500">Use at least 8 characters for your new password.</p>
            </CardContent>
          </Card>
        </div>
      </RequireAuth>
    </AppShell>
  );
}
