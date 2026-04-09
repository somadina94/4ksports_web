"use client";

import { useState } from "react";
import AppShell from "@/src/components/layout/app-shell";
import { useSportsbook } from "@/src/hooks/useSportsbook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { Input } from "@/src/components/ui/input";
import ToastStack from "@/src/components/ui/toast-stack";

export default function AdminPage() {
  const {
    user,
    adminDepositRequests,
    approveDeposit,
    rejectDeposit,
    adminPlatformWallets,
    createAdminPlatformWallet,
    deleteAdminPlatformWallet,
    isApprovingDeposit,
    isRejectingDeposit,
    isCreatingPlatformWallet,
    isDeletingPlatformWallet,
    toasts,
    dismissToast,
  } = useSportsbook();
  const [walletForm, setWalletForm] = useState({
    label: "",
    network: "TRC20" as "TRC20" | "ERC20" | "BEP20",
    walletAddress: "",
  });

  if (!user || user.role !== "admin") {
    return (
      <AppShell>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>Log in with an admin account to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login"><Button>Go to Login</Button></Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <Card>
        <CardHeader>
          <CardTitle>Admin Deposit Queue</CardTitle>
          <CardDescription>Approve or reject pending user deposit requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {adminDepositRequests.map((request) => (
            <div key={request._id} className="rounded-lg border border-zinc-800 p-3 text-sm">
              <p>{request.amount} USDT - {request.status}</p>
              <p className="text-zinc-400">{request.txHash}</p>
              {request.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={isApprovingDeposit}
                    onClick={() => approveDeposit(request._id).catch(() => {})}
                  >
                    {isApprovingDeposit ? "Approving..." : "Approve"}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={isRejectingDeposit}
                    onClick={() => rejectDeposit(request._id).catch(() => {})}
                  >
                    {isRejectingDeposit ? "Rejecting..." : "Reject"}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Platform Wallet Management</CardTitle>
          <CardDescription>Create and manage deposit addresses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-3">
            <Input
              placeholder="Label (e.g. Main TRC20)"
              value={walletForm.label}
              onChange={(e) => setWalletForm((prev) => ({ ...prev, label: e.target.value }))}
            />
            <select
              className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
              value={walletForm.network}
              onChange={(e) =>
                setWalletForm((prev) => ({
                  ...prev,
                  network: e.target.value as "TRC20" | "ERC20" | "BEP20",
                }))
              }
            >
              <option value="TRC20">TRC20</option>
              <option value="ERC20">ERC20</option>
              <option value="BEP20">BEP20</option>
            </select>
            <Input
              placeholder="Wallet address"
              value={walletForm.walletAddress}
              onChange={(e) =>
                setWalletForm((prev) => ({ ...prev, walletAddress: e.target.value }))
              }
            />
          </div>
          <Button
            disabled={isCreatingPlatformWallet}
            onClick={() =>
              createAdminPlatformWallet(walletForm)
                .then(() =>
                  setWalletForm({ label: "", network: "TRC20", walletAddress: "" })
                )
                .catch(() => {})
            }
          >
            {isCreatingPlatformWallet ? "Creating..." : "Create Platform Wallet"}
          </Button>
          <div className="space-y-2">
            {adminPlatformWallets.map((wallet) => (
              <div
                key={wallet._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{wallet.label} ({wallet.network})</p>
                  <p className="text-zinc-400 break-all">{wallet.walletAddress}</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isDeletingPlatformWallet}
                  onClick={() => deleteAdminPlatformWallet(wallet._id).catch(() => {})}
                >
                  {isDeletingPlatformWallet ? "Deleting..." : "Delete"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
