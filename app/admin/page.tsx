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
    createAnnouncement,
    deleteAnnouncement,
    adminAnnouncements,
    isApprovingDeposit,
    isRejectingDeposit,
    isCreatingPlatformWallet,
    isDeletingPlatformWallet,
    isCreatingAnnouncement,
    isDeletingAnnouncement,
    toasts,
    dismissToast,
  } = useSportsbook();
  const [walletForm, setWalletForm] = useState({
    label: "",
    network: "TRC20" as "TRC20" | "ERC20" | "BEP20",
    walletAddress: "",
  });
  const [announcementForm, setAnnouncementForm] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const tz = d.getTimezoneOffset() * 60000;
    return {
      body: "",
      expiresAt: new Date(d.getTime() - tz).toISOString().slice(0, 16),
    };
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
          <CardTitle>Announcements (ticker)</CardTitle>
          <CardDescription>
            Shown in the scrolling bar under the site header until the expiry date. First-time depositors
            receive a 200% bonus on their first approved deposit (see balance transactions).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="min-h-[88px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
            placeholder="Announcement text (news, promos, maintenance…)"
            value={announcementForm.body}
            onChange={(e) =>
              setAnnouncementForm((prev) => ({ ...prev, body: e.target.value }))
            }
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400" htmlFor="announcement-expires">
                Expires (local time)
              </label>
              <Input
                id="announcement-expires"
                type="datetime-local"
                value={announcementForm.expiresAt}
                onChange={(e) =>
                  setAnnouncementForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                }
              />
            </div>
            <Button
              disabled={isCreatingAnnouncement || !announcementForm.body.trim()}
              onClick={() =>
                createAnnouncement(announcementForm.body.trim(), announcementForm.expiresAt)
                  .then(() =>
                    setAnnouncementForm((prev) => ({
                      body: "",
                      expiresAt: prev.expiresAt,
                    }))
                  )
                  .catch(() => {})
              }
            >
              {isCreatingAnnouncement ? "Publishing..." : "Publish announcement"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>All announcements</CardTitle>
          <CardDescription>
            Every saved announcement (including expired). Only non-expired items with text appear on the public ticker.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {adminAnnouncements.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No announcements yet.</p>
          ) : (
            adminAnnouncements.map((item) => (
              <div
                key={item._id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-zinc-300 p-3 text-sm dark:border-zinc-800"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.body}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Expires: {new Date(item.expiresAt).toLocaleString()}
                    {new Date(item.expiresAt) <= new Date() ? " (expired)" : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isDeletingAnnouncement}
                  onClick={() => deleteAnnouncement(item._id).catch(() => {})}
                >
                  {isDeletingAnnouncement ? "Deleting..." : "Delete"}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
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
