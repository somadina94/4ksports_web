"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, persistToken, readToken } from "@/src/lib/api";
import type {
  ApiResponse,
  BalanceTransaction,
  BalanceWallet,
  DepositRequest,
  EventItem,
  PlatformWallet,
  Ticket,
} from "@/src/types/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

type SelectionDraft = {
  eventId: string;
  marketType: "match_winner" | "total_goals" | "btts";
  pick: string;
  line?: number;
  odds: number;
  eventLabel: string;
  label: string;
};

export default function SportsbookDashboard() {
  const [token, setToken] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authForm, setAuthForm] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
  });
  const [authUser, setAuthUser] = useState<{ username: string; role: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [wallet, setWallet] = useState<BalanceWallet | null>(null);
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [platformWallets, setPlatformWallets] = useState<PlatformWallet[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [adminDepositRequests, setAdminDepositRequests] = useState<DepositRequest[]>([]);

  const [stake, setStake] = useState("10");
  const [selection, setSelection] = useState<SelectionDraft | null>(null);

  const [depositForm, setDepositForm] = useState({
    platformWalletId: "",
    amount: "20",
    network: "TRC20",
    txHash: "",
    proofImageUrl: "",
  });

  const potentialPayout = useMemo(() => {
    if (!selection) return 0;
    const parsedStake = Number(stake || 0);
    if (!parsedStake || !selection.odds) return 0;
    return Number((parsedStake * selection.odds).toFixed(2));
  }, [selection, stake]);

  const loadPublic = async () => {
    const eventsRes = await apiFetch<ApiResponse<{ events: EventItem[] }>>("/events/upcoming");
    const platformRes = await apiFetch<ApiResponse<{ wallets: PlatformWallet[] }>>(
      "/platform-wallets",
    );
    setEvents(eventsRes.data.events);
    setPlatformWallets(platformRes.data.wallets);
    setDepositForm((prev) => ({
      ...prev,
      platformWalletId: prev.platformWalletId || platformRes.data.wallets[0]?._id || "",
    }));
  };

  const loadPrivate = async (authToken: string) => {
    const [ticketsRes, walletRes, txRes, myDepRes, adminDepRes] = await Promise.all([
      apiFetch<ApiResponse<{ tickets: Ticket[] }>>("/tickets/me", { token: authToken }),
      apiFetch<ApiResponse<{ wallet: BalanceWallet }>>("/balance-wallet/me", {
        token: authToken,
      }),
      apiFetch<ApiResponse<{ transactions: BalanceTransaction[] }>>(
        "/balance-transactions/me",
        { token: authToken },
      ),
      apiFetch<ApiResponse<{ requests: DepositRequest[] }>>("/deposit-requests/me", {
        token: authToken,
      }),
      apiFetch<ApiResponse<{ requests: DepositRequest[] }>>("/admin/deposit-requests", {
        token: authToken,
      }).catch(() => ({ status: "fail", data: { requests: [] } })),
    ]);
    setTickets(ticketsRes.data.tickets);
    setWallet(walletRes.data.wallet);
    setTransactions(txRes.data.transactions);
    setDepositRequests(myDepRes.data.requests);
    setAdminDepositRequests(adminDepRes.data.requests);
  };

  const runAuth = async () => {
    setErrorMessage("");
    if (!authForm.username || !authForm.password) {
      setErrorMessage("Username and password are required.");
      return;
    }
    if (
      authMode === "signup" &&
      (!authForm.passwordConfirm || authForm.password !== authForm.passwordConfirm)
    ) {
      setErrorMessage("Password and confirm password must match.");
      return;
    }

    const path = authMode === "login" ? "/users/login" : "/users/signup";
    const res = await apiFetch<
      ApiResponse<{ user: { username: string; role: string } }> & { token: string }
    >(path, {
      method: "POST",
      body:
        authMode === "login"
          ? { username: authForm.username, password: authForm.password }
          : {
              username: authForm.username,
              password: authForm.password,
              passwordConfirm: authForm.passwordConfirm,
            },
    });

    setToken(res.token);
    setAuthUser(res.data.user);
    persistToken(res.token);
    await loadPrivate(res.token);
  };

  const logout = () => {
    setToken("");
    setAuthUser(null);
    setTickets([]);
    setWallet(null);
    setTransactions([]);
    setDepositRequests([]);
    setAdminDepositRequests([]);
    persistToken("");
  };

  useEffect(() => {
    const saved = readToken();
    setToken(saved);
    loadPublic().catch(console.error);
    if (saved) {
      loadPrivate(saved).catch(() => {
        setToken("");
        persistToken("");
      });
    }
  }, []);

  const placeSingleTicket = async () => {
    if (!token) {
      setErrorMessage("Login required to place a ticket.");
      return;
    }
    if (!selection) {
      setErrorMessage("Select an odd first.");
      return;
    }

    await apiFetch("/tickets", {
      method: "POST",
      token,
      body: {
        type: "single",
        stake: Number(stake),
        selections: [
          {
            eventId: selection.eventId,
            marketType: selection.marketType,
            pick: selection.pick,
            line: selection.line,
          },
        ],
      },
    });
    await loadPrivate(token);
  };

  const submitDeposit = async () => {
    if (!token) {
      setErrorMessage("Login required to create deposit request.");
      return;
    }
    await apiFetch("/deposit-requests", {
      method: "POST",
      token,
      body: {
        ...depositForm,
        amount: Number(depositForm.amount),
      },
    });
    await loadPrivate(token);
  };

  const approveDeposit = async (id: string) => {
    if (!token) {
      setErrorMessage("Admin login required.");
      return;
    }
    await apiFetch(`/admin/deposit-requests/${id}/approve`, {
      method: "PATCH",
      token,
    });
    await loadPrivate(token);
  };

  const selectOdd = (
    event: EventItem,
    marketType: SelectionDraft["marketType"],
    pick: string,
    odds: number | null,
    line?: number,
  ) => {
    if (!odds || odds <= 1) return;
    setSelection({
      eventId: event._id,
      marketType,
      pick,
      line,
      odds,
      eventLabel: `${event.homeTeam} vs ${event.awayTeam}`,
      label:
        marketType === "match_winner"
          ? `1X2 • ${pick}`
          : marketType === "btts"
            ? `BTTS • ${pick}`
            : `Total Goals ${line} • ${pick}`,
    });
  };

  const oddButtonClass = (eventId: string, marketType: string, pick: string, line?: number) => {
    const isActive =
      selection &&
      selection.eventId === eventId &&
      selection.marketType === marketType &&
      selection.pick === pick &&
      (selection.line ?? null) === (line ?? null);

    return isActive
      ? "bg-indigo-600 text-white border-indigo-500"
      : "bg-zinc-900 text-zinc-100 border-zinc-700 hover:bg-zinc-800";
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card id="overview" className="lg:col-span-12">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Use username/password with your backend auth endpoints.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input
            value={authForm.username}
            onChange={(e) =>
              setAuthForm((prev) => ({ ...prev, username: e.target.value }))
            }
            placeholder="Username"
          />
          <Input
            type="password"
            value={authForm.password}
            onChange={(e) =>
              setAuthForm((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="Password"
          />
          {authMode === "signup" && (
            <Input
              type="password"
              value={authForm.passwordConfirm}
              onChange={(e) =>
                setAuthForm((prev) => ({ ...prev, passwordConfirm: e.target.value }))
              }
              placeholder="Confirm password"
            />
          )}
          <Button onClick={() => runAuth().catch((err) => setErrorMessage(err.message))}>
            {authMode === "login" ? "Login" : "Create account"}
          </Button>
          <Button variant="secondary" onClick={() => setAuthMode((p) => (p === "login" ? "signup" : "login"))}>
            Switch to {authMode === "login" ? "Signup" : "Login"}
          </Button>
          {token && (
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          )}
          {authUser && (
            <p className="md:col-span-5 text-sm text-zinc-400">
              Logged in as {authUser.username} ({authUser.role})
            </p>
          )}
          {errorMessage && (
            <p className="md:col-span-5 text-sm text-red-400">{errorMessage}</p>
          )}
        </CardContent>
      </Card>

      <Card id="events" className="lg:col-span-8">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Click any odd to add a pick to your bet slip.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="rounded-xl border border-zinc-800 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {event.homeTeam} vs {event.awayTeam}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {event.league.name} • {new Date(event.eventDate).toLocaleString()}
                  </p>
                </div>
                <Badge>{event.status}</Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-zinc-400">Match Winner</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      className={`rounded-md border px-3 py-2 text-sm ${oddButtonClass(event._id, "match_winner", "home")}`}
                      onClick={() => selectOdd(event, "match_winner", "home", event.odds.odds_home)}
                    >
                      1 • {event.odds.odds_home ?? "-"}
                    </button>
                    <button
                      className={`rounded-md border px-3 py-2 text-sm ${oddButtonClass(event._id, "match_winner", "draw")}`}
                      onClick={() => selectOdd(event, "match_winner", "draw", event.odds.odds_draw)}
                    >
                      X • {event.odds.odds_draw ?? "-"}
                    </button>
                    <button
                      className={`rounded-md border px-3 py-2 text-sm ${oddButtonClass(event._id, "match_winner", "away")}`}
                      onClick={() => selectOdd(event, "match_winner", "away", event.odds.odds_away)}
                    >
                      2 • {event.odds.odds_away ?? "-"}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-zinc-400">Total Goals</p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    <button
                      className={`rounded-md border px-3 py-2 text-sm ${oddButtonClass(event._id, "total_goals", "over", 1.5)}`}
                      onClick={() => selectOdd(event, "total_goals", "over", event.odds.odds_over_15, 1.5)}
                    >
                      Over 1.5 • {event.odds.odds_over_15 ?? "-"}
                    </button>
                    <button
                      className={`rounded-md border px-3 py-2 text-sm ${oddButtonClass(event._id, "total_goals", "under", 1.5)}`}
                      onClick={() => selectOdd(event, "total_goals", "under", event.odds.odds_under_15, 1.5)}
                    >
                      Under 1.5 • {event.odds.odds_under_15 ?? "-"}
                    </button>
                    <button
                      className={`rounded-md border px-3 py-2 text-sm ${oddButtonClass(event._id, "total_goals", "over", 2.5)}`}
                      onClick={() => selectOdd(event, "total_goals", "over", event.odds.odds_over_25, 2.5)}
                    >
                      Over 2.5 • {event.odds.odds_over_25 ?? "-"}
                    </button>
                    <button
                      className={`rounded-md border px-3 py-2 text-sm ${oddButtonClass(event._id, "total_goals", "under", 2.5)}`}
                      onClick={() => selectOdd(event, "total_goals", "under", event.odds.odds_under_25, 2.5)}
                    >
                      Under 2.5 • {event.odds.odds_under_25 ?? "-"}
                    </button>
                    <button
                      className={`rounded-md border px-3 py-2 text-sm ${oddButtonClass(event._id, "total_goals", "over", 3.5)}`}
                      onClick={() => selectOdd(event, "total_goals", "over", event.odds.odds_over_35, 3.5)}
                    >
                      Over 3.5 • {event.odds.odds_over_35 ?? "-"}
                    </button>
                    <button
                      className={`rounded-md border px-3 py-2 text-sm ${oddButtonClass(event._id, "total_goals", "under", 3.5)}`}
                      onClick={() => selectOdd(event, "total_goals", "under", event.odds.odds_under_35, 3.5)}
                    >
                      Under 3.5 • {event.odds.odds_under_35 ?? "-"}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-zinc-400">Both Teams To Score</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className={`rounded-md border px-3 py-2 text-sm ${oddButtonClass(event._id, "btts", "yes")}`}
                      onClick={() => selectOdd(event, "btts", "yes", event.odds.odds_btts_yes)}
                    >
                      Yes • {event.odds.odds_btts_yes ?? "-"}
                    </button>
                    <button
                      className={`rounded-md border px-3 py-2 text-sm ${oddButtonClass(event._id, "btts", "no")}`}
                      onClick={() => selectOdd(event, "btts", "no", event.odds.odds_btts_no)}
                    >
                      No • {event.odds.odds_btts_no ?? "-"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card id="betting" className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Bet Slip</CardTitle>
          <CardDescription>Select odds from matches and place your ticket.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {selection ? (
            <div className="rounded-lg border border-zinc-800 p-3">
              <p className="text-sm font-semibold">{selection.eventLabel}</p>
              <p className="mt-1 text-xs text-zinc-400">{selection.label}</p>
              <p className="mt-2 text-sm">Odds: <span className="font-semibold">{selection.odds}</span></p>
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-800 p-3 text-sm text-zinc-400">
              No selection yet. Click an odd from the events board.
            </div>
          )}
          <Input value={stake} onChange={(e) => setStake(e.target.value)} placeholder="Stake" />
          <div className="rounded-lg border border-zinc-800 p-3 text-sm">
            Potential payout: <span className="font-semibold">{potentialPayout.toFixed(2)} USDT</span>
          </div>
          <Button className="w-full" onClick={placeSingleTicket}>
            Place Ticket
          </Button>
        </CardContent>
      </Card>

      <Card id="wallet" className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Balance Wallet</CardTitle>
          <CardDescription>Internal USDT betting wallet balance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-3xl font-bold">{wallet ? wallet.balance.toFixed(2) : "0.00"} USDT</p>
          <p className="text-sm text-zinc-400">
            Locked: {wallet?.lockedBalance?.toFixed(2) ?? "0.00"} USDT
          </p>
        </CardContent>
      </Card>

      <Card id="tickets" className="lg:col-span-8">
        <CardHeader>
          <CardTitle>My Tickets</CardTitle>
          <CardDescription>Live view of your placed tickets and status.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="rounded-lg border border-zinc-800 p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{ticket.type.toUpperCase()}</p>
                <Badge variant={ticket.status === "won" ? "success" : ticket.status === "lost" ? "danger" : "default"}>
                  {ticket.status}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                Stake {ticket.stake} | Odds {ticket.totalOdds} | Payout {ticket.potentialPayout}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card id="deposits" className="lg:col-span-6">
        <CardHeader>
          <CardTitle>Create Deposit Request</CardTitle>
          <CardDescription>Select a platform wallet address and submit proof.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
            value={depositForm.platformWalletId}
            onChange={(e) =>
              setDepositForm((prev) => ({ ...prev, platformWalletId: e.target.value }))
            }
          >
            <option value="">Select platform wallet</option>
            {platformWallets.map((walletItem) => (
              <option key={walletItem._id} value={walletItem._id}>
                {walletItem.label} - {walletItem.network} - {walletItem.walletAddress.slice(0, 10)}...
              </option>
            ))}
          </select>
          <Input
            placeholder="Network (TRC20/ERC20/BEP20)"
            value={depositForm.network}
            onChange={(e) => setDepositForm((prev) => ({ ...prev, network: e.target.value }))}
          />
          <Input
            placeholder="Amount"
            value={depositForm.amount}
            onChange={(e) => setDepositForm((prev) => ({ ...prev, amount: e.target.value }))}
          />
          <Input
            placeholder="Tx hash"
            value={depositForm.txHash}
            onChange={(e) => setDepositForm((prev) => ({ ...prev, txHash: e.target.value }))}
          />
          <Input
            placeholder="Proof image url (optional)"
            value={depositForm.proofImageUrl}
            onChange={(e) =>
              setDepositForm((prev) => ({ ...prev, proofImageUrl: e.target.value }))
            }
          />
          <Button className="w-full" onClick={submitDeposit}>
            Submit Deposit Request
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-6">
        <CardHeader>
          <CardTitle>Platform Wallets</CardTitle>
          <CardDescription>Public deposit addresses managed by admin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {platformWallets.map((walletItem) => (
            <div key={walletItem._id} className="rounded-lg border border-zinc-800 p-3 text-sm">
              <p className="font-medium">{walletItem.label} <Badge>{walletItem.network}</Badge></p>
              <p className="mt-1 break-all text-zinc-400">{walletItem.walletAddress}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-6">
        <CardHeader>
          <CardTitle>My Deposit Requests</CardTitle>
        </CardHeader>
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

      <Card id="admin" className="lg:col-span-6">
        <CardHeader>
          <CardTitle>Admin Pending Deposits</CardTitle>
          <CardDescription>Only works with an admin JWT token.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {adminDepositRequests.map((request) => (
            <div key={request._id} className="rounded-lg border border-zinc-800 p-3 text-sm">
              <p>{request.amount} USDT - {request.status}</p>
              <p className="text-zinc-400">{request.txHash}</p>
              {request.status === "pending" && (
                <Button size="sm" onClick={() => approveDeposit(request._id)}>
                  Approve
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card id="transactions" className="lg:col-span-12">
        <CardHeader>
          <CardTitle>Balance Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Before</TableHead>
                <TableHead>After</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx._id}>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.balanceBefore}</TableCell>
                  <TableCell>{tx.balanceAfter}</TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
