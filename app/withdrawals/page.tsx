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
import type { UserSavedWallet } from "@/src/types/domain";

function walletOptionLabel(w: UserSavedWallet) {
  const tag = w.label?.trim() || "Address";
  return `${tag} · ${w.network}`;
}

export default function WithdrawalsPage() {
  const {
    userSavedWallets,
    withdrawalRequests,
    wallet,
    createUserWallet,
    submitWithdrawal,
    isCreatingUserWallet,
    isSubmittingWithdrawal,
    toasts,
    dismissToast,
  } = useSportsbook();

  const [addForm, setAddForm] = useState({
    label: "",
    network: "TRC20" as UserSavedWallet["network"],
    walletAddress: "",
  });
  const [withdrawForm, setWithdrawForm] = useState({
    userWalletId: "",
    amount: "",
  });

  const selectedWallet = useMemo(
    () => userSavedWallets.find((w) => w._id === withdrawForm.userWalletId),
    [userSavedWallets, withdrawForm.userWalletId],
  );

  return (
    <AppShell>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <RequireAuth>
      <Card>
        <CardHeader>
          <CardTitle>Your withdrawal addresses</CardTitle>
          <CardDescription>
            Save one or more external USDT addresses. You will pick one when requesting a withdrawal.
            An admin reviews and processes payouts manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Label (e.g. My TRC20)"
            value={addForm.label}
            onChange={(e) => setAddForm((p) => ({ ...p, label: e.target.value }))}
          />
          <select
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            value={addForm.network}
            onChange={(e) =>
              setAddForm((p) => ({ ...p, network: e.target.value as UserSavedWallet["network"] }))
            }
          >
            <option value="TRC20">TRC20</option>
            <option value="ERC20">ERC20</option>
            <option value="BEP20">BEP20</option>
          </select>
          <Input
            placeholder="Wallet address"
            value={addForm.walletAddress}
            onChange={(e) => setAddForm((p) => ({ ...p, walletAddress: e.target.value }))}
          />
          <Button
            disabled={isCreatingUserWallet || !addForm.walletAddress.trim()}
            onClick={() =>
              createUserWallet({
                network: addForm.network,
                walletAddress: addForm.walletAddress.trim(),
                label: addForm.label.trim(),
              })
                .then(() =>
                  setAddForm((p) => ({ ...p, walletAddress: "", label: "" })),
                )
                .catch(() => {})
            }
          >
            {isCreatingUserWallet ? "Saving..." : "Save address"}
          </Button>
          {userSavedWallets.length > 0 && (
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              {userSavedWallets.map((w) => (
                <li key={w._id} className="break-all rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{walletOptionLabel(w)}</span>
                  <div className="mt-1 font-mono text-xs">{w.walletAddress}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request withdrawal</CardTitle>
          <CardDescription>
            Available balance excludes locked stake and pending withdrawals. Withdrawals require an
            approved first deposit, total stakes above your first deposit plus welcome bonus, and at least
            one winning bet—otherwise the server will reject the request with an explanation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {wallet && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Balance {wallet.balance.toFixed(2)} USDT · Locked {wallet.lockedBalance.toFixed(2)} USDT
            </p>
          )}
          <select
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            value={withdrawForm.userWalletId}
            onChange={(e) =>
              setWithdrawForm((p) => ({ ...p, userWalletId: e.target.value }))
            }
          >
            <option value="">Select saved address</option>
            {userSavedWallets.map((w) => (
              <option key={w._id} value={w._id}>
                {walletOptionLabel(w)}
              </option>
            ))}
          </select>
          {selectedWallet && (
            <p className="break-all text-xs text-zinc-500 dark:text-zinc-400">
              {selectedWallet.walletAddress}
            </p>
          )}
          <Input
            type="number"
            min={0.01}
            step="any"
            placeholder="Amount (USDT)"
            value={withdrawForm.amount}
            onChange={(e) => setWithdrawForm((p) => ({ ...p, amount: e.target.value }))}
          />
          <Button
            disabled={
              isSubmittingWithdrawal ||
              !withdrawForm.userWalletId ||
              Number(withdrawForm.amount) < 0.01
            }
            onClick={() =>
              submitWithdrawal({
                userWalletId: withdrawForm.userWalletId,
                amount: Number(withdrawForm.amount),
              })
                .then(() => setWithdrawForm({ userWalletId: "", amount: "" }))
                .catch(() => {})
            }
          >
            {isSubmittingWithdrawal ? "Submitting..." : "Submit withdrawal request"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My withdrawal requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {withdrawalRequests.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No requests yet.</p>
          ) : (
            withdrawalRequests.map((req) => (
              <div
                key={req._id}
                className="rounded-lg border border-zinc-300 p-3 text-sm dark:border-zinc-800"
              >
                <p className="font-medium">
                  {req.amount} USDT · {req.network}
                </p>
                <p className="break-all text-zinc-600 dark:text-zinc-400">{req.destinationAddress}</p>
                <Badge className="mt-2">{req.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      </RequireAuth>
    </AppShell>
  );
}
