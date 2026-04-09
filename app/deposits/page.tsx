"use client";

import { useMemo, useState } from "react";
import AppShell from "@/src/components/layout/app-shell";
import { useSportsbook } from "@/src/hooks/useSportsbook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import ToastStack from "@/src/components/ui/toast-stack";

export default function DepositsPage() {
  const { platformWallets, depositRequests, submitDeposit, isSubmittingDeposit, toasts, dismissToast } = useSportsbook();
  const [form, setForm] = useState({
    platformWalletId: "",
    amount: "20",
    txHash: "",
  });
  const selected = useMemo(
    () => platformWallets.find((wallet) => wallet._id === form.platformWalletId),
    [platformWallets, form.platformWalletId],
  );

  return (
    <AppShell>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <Card>
        <CardHeader>
          <CardTitle>Create Deposit Request</CardTitle>
          <CardDescription>Select a platform wallet address and submit payment proof.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
          <Input value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="Amount" />
          <Input value={form.txHash} onChange={(e) => setForm((prev) => ({ ...prev, txHash: e.target.value }))} placeholder="Tx hash" />
          <Button
            disabled={isSubmittingDeposit}
            onClick={() =>
              selected &&
              submitDeposit({
                ...form,
                network: selected.network,
                amount: Number(form.amount),
              }).catch(() => {})
            }
          >
            {isSubmittingDeposit ? "Submitting..." : "Submit Deposit Request"}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>My Deposit Requests</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {depositRequests.map((request) => (
            <div key={request._id} className="rounded-lg border border-zinc-800 p-3 text-sm">
              <p>{request.amount} USDT - {request.network}</p>
              <p className="text-zinc-400">{request.txHash}</p>
              <Badge>{request.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
