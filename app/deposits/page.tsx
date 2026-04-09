"use client";

import { useMemo, useState } from "react";
import AppShell from "@/src/components/layout/app-shell";
import RequireAuth from "@/src/components/auth/require-auth";
import { useSportsbook } from "@/src/hooks/useSportsbook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import ToastStack from "@/src/components/ui/toast-stack";
import { MAX_DEPOSIT_AMOUNT, MIN_DEPOSIT_AMOUNT } from "@/src/lib/depositLimits";

export default function DepositsPage() {
  const { platformWallets, depositRequests, submitDeposit, isSubmittingDeposit, toasts, dismissToast } =
    useSportsbook();
  const [form, setForm] = useState({
    platformWalletId: "",
    amount: "20",
    txHash: "",
  });

  const selected = useMemo(
    () => platformWallets.find((wallet) => wallet._id === form.platformWalletId),
    [platformWallets, form.platformWalletId],
  );

  const amountNum = Number(form.amount);
  const amountOk =
    Number.isFinite(amountNum) &&
    amountNum >= MIN_DEPOSIT_AMOUNT &&
    amountNum <= MAX_DEPOSIT_AMOUNT;

  return (
    <AppShell>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <RequireAuth>
        <Card>
          <CardHeader>
            <CardTitle>Create Deposit Request</CardTitle>
            <CardDescription>
              Select a platform wallet address and submit payment proof. Your first approved deposit
              receives an extra 200% of that amount as a welcome bonus (credited on top of the deposit).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              role="status"
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
            >
              <strong className="font-semibold">Deposit limits:</strong> minimum{" "}
              <strong>{MIN_DEPOSIT_AMOUNT} USDT</strong>, maximum <strong>{MAX_DEPOSIT_AMOUNT} USDT</strong>{" "}
              per request. Requests outside this range will be rejected by the server.
            </div>
            <select
              className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
              value={form.platformWalletId}
              onChange={(e) => setForm((prev) => ({ ...prev, platformWalletId: e.target.value }))}
            >
              <option value="">Select platform wallet</option>
              {platformWallets.map((wallet) => (
                <option key={wallet._id} value={wallet._id}>
                  {wallet.label} - {wallet.network}
                </option>
              ))}
            </select>
            {selected && <p className="text-xs text-zinc-400 break-all">{selected.walletAddress}</p>}
            {selected && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(selected.walletAddress)}
                >
                  Copy Wallet Address
                </Button>
                <span className="text-xs text-zinc-400">{selected.network}</span>
              </div>
            )}
            <Input
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder={`Amount (${MIN_DEPOSIT_AMOUNT}–${MAX_DEPOSIT_AMOUNT} USDT)`}
              type="number"
              min={MIN_DEPOSIT_AMOUNT}
              max={MAX_DEPOSIT_AMOUNT}
              step="any"
            />
            {!amountOk && form.amount !== "" && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Enter an amount between {MIN_DEPOSIT_AMOUNT} and {MAX_DEPOSIT_AMOUNT} USDT.
              </p>
            )}
            <Input value={form.txHash} onChange={(e) => setForm((prev) => ({ ...prev, txHash: e.target.value }))} placeholder="Tx hash" />
            <Button
              disabled={isSubmittingDeposit || !selected || !amountOk || !form.txHash.trim()}
              onClick={() =>
                selected &&
                submitDeposit({
                  ...form,
                  network: selected.network,
                  amount: amountNum,
                }).catch(() => {})
              }
            >
              {isSubmittingDeposit ? "Submitting..." : "Submit Deposit Request"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Deposit Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {depositRequests.map((request) => (
              <div key={request._id} className="rounded-lg border border-zinc-800 p-3 text-sm">
                <p>
                  {request.amount} USDT - {request.network}
                </p>
                <p className="text-zinc-400">{request.txHash}</p>
                <Badge>{request.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </RequireAuth>
    </AppShell>
  );
}
