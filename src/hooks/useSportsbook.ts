"use client";

import { useEffect, useMemo, useState } from "react";
import {
  apiFetch,
  persistAuthUser,
  persistToken,
  readAuthUser,
  readToken,
} from "@/src/lib/api";
import type {
  ApiResponse,
  AuthUser,
  BalanceTransaction,
  BalanceWallet,
  DepositRequest,
  EventItem,
  PlatformWallet,
  Ticket,
} from "@/src/types/domain";

export type SelectionDraft = {
  eventId: string;
  marketType: "match_winner" | "total_goals" | "btts";
  pick: string;
  line?: number;
  odds: number;
  eventLabel: string;
  label: string;
};

type ToastItem = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

export const useSportsbook = () => {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [wallet, setWallet] = useState<BalanceWallet | null>(null);
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [platformWallets, setPlatformWallets] = useState<PlatformWallet[]>([]);
  const [adminPlatformWallets, setAdminPlatformWallets] = useState<PlatformWallet[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [adminDepositRequests, setAdminDepositRequests] = useState<DepositRequest[]>([]);
  const [selections, setSelections] = useState<SelectionDraft[]>([]);
  const [stake, setStake] = useState("10");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isPlacingTicket, setIsPlacingTicket] = useState(false);
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);
  const [isApprovingDeposit, setIsApprovingDeposit] = useState(false);
  const [isRejectingDeposit, setIsRejectingDeposit] = useState(false);
  const [isCreatingPlatformWallet, setIsCreatingPlatformWallet] = useState(false);
  const [isDeletingPlatformWallet, setIsDeletingPlatformWallet] = useState(false);

  const pushToast = (type: ToastItem["type"], message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const totalOdds = useMemo(() => {
    if (!selections.length) return 0;
    return Number(
      selections.reduce((acc, selection) => acc * selection.odds, 1).toFixed(4),
    );
  }, [selections]);

  const potentialPayout = useMemo(() => {
    if (!selections.length) return 0;
    return Number((Number(stake || 0) * totalOdds).toFixed(2));
  }, [selections, stake, totalOdds]);

  const loadPublic = async () => {
    setIsLoadingPublic(true);
    try {
      const [eventsRes, platformRes] = await Promise.all([
        apiFetch<ApiResponse<{ events: EventItem[] }>>("/events/upcoming"),
        apiFetch<ApiResponse<{ wallets: PlatformWallet[] }>>("/platform-wallets"),
      ]);
      setEvents(eventsRes.data.events);
      setPlatformWallets(platformRes.data.wallets);
    } finally {
      setIsLoadingPublic(false);
    }
  };

  const loadPrivate = async (authToken: string) => {
    const [ticketsRes, walletRes, txRes, myDepRes, adminDepRes, adminWalletsRes] = await Promise.all([
      apiFetch<ApiResponse<{ tickets: Ticket[] }>>("/tickets/me", { token: authToken }),
      apiFetch<ApiResponse<{ wallet: BalanceWallet }>>("/balance-wallet/me", {
        token: authToken,
      }),
      apiFetch<ApiResponse<{ transactions: BalanceTransaction[] }>>(
        "/balance-transactions/me",
        {
          token: authToken,
        },
      ),
      apiFetch<ApiResponse<{ requests: DepositRequest[] }>>("/deposit-requests/me", {
        token: authToken,
      }),
      apiFetch<ApiResponse<{ requests: DepositRequest[] }>>("/admin/deposit-requests", {
        token: authToken,
      }).catch(() => ({ status: "fail", data: { requests: [] } })),
      apiFetch<ApiResponse<{ wallets: PlatformWallet[] }>>("/admin/platform-wallets", {
        token: authToken,
      }).catch(() => ({ status: "fail", data: { wallets: [] } })),
    ]);
    setTickets(ticketsRes.data.tickets);
    setWallet(walletRes.data.wallet);
    setTransactions(txRes.data.transactions);
    setDepositRequests(myDepRes.data.requests);
    setAdminDepositRequests(adminDepRes.data.requests);
    setAdminPlatformWallets(adminWalletsRes.data.wallets);
  };

  const login = async (username: string, password: string) => {
    setIsAuthSubmitting(true);
    try {
      const res = await apiFetch<
        ApiResponse<{ user: AuthUser }> & {
          token: string;
        }
      >("/users/login", {
        method: "POST",
        body: { username, password },
      });
      setToken(res.token);
      setUser(res.data.user);
      persistToken(res.token);
      persistAuthUser(res.data.user);
      await loadPrivate(res.token);
      pushToast("success", `Welcome back ${res.data.user.username}`);
      return res.data.user;
    } catch (error: any) {
      pushToast("error", error.message ?? "Login failed");
      throw error;
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const signup = async (username: string, password: string, passwordConfirm: string) => {
    setIsAuthSubmitting(true);
    try {
      const res = await apiFetch<
        ApiResponse<{ user: AuthUser }> & {
          token: string;
        }
      >("/users/signup", {
        method: "POST",
        body: { username, password, passwordConfirm },
      });
      setToken(res.token);
      setUser(res.data.user);
      persistToken(res.token);
      persistAuthUser(res.data.user);
      await loadPrivate(res.token);
      pushToast("success", "Account created successfully");
      return res.data.user;
    } catch (error: any) {
      pushToast("error", error.message ?? "Signup failed");
      throw error;
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    setTickets([]);
    setWallet(null);
    setTransactions([]);
    setDepositRequests([]);
    setAdminDepositRequests([]);
    persistToken("");
    persistAuthUser(null);
  };

  const placeSingleTicket = async () => {
    if (!token || !selections.length)
      throw new Error("Select one or more odds and login first.");
    setIsPlacingTicket(true);
    try {
      await apiFetch("/tickets", {
        method: "POST",
        token,
        body: {
          type: selections.length === 1 ? "single" : "accumulator",
          stake: Number(stake),
          selections: selections.map((selection) => ({
            eventId: selection.eventId,
            marketType: selection.marketType,
            pick: selection.pick,
            line: selection.line,
          })),
        },
      });
      await loadPrivate(token);
      setSelections([]);
      pushToast("success", "Ticket placed successfully");
    } catch (error: any) {
      pushToast("error", error.message ?? "Failed to place ticket");
      throw error;
    } finally {
      setIsPlacingTicket(false);
    }
  };

  const submitDeposit = async (payload: {
    platformWalletId: string;
    amount: number;
    network: string;
    txHash: string;
    proofImageUrl?: string;
  }) => {
    if (!token) throw new Error("Login required.");
    setIsSubmittingDeposit(true);
    try {
      await apiFetch("/deposit-requests", {
        method: "POST",
        token,
        body: payload,
      });
      await loadPrivate(token);
      pushToast("success", "Deposit request submitted");
    } catch (error: any) {
      pushToast("error", error.message ?? "Failed to submit deposit");
      throw error;
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const approveDeposit = async (id: string) => {
    if (!token) throw new Error("Admin login required.");
    setIsApprovingDeposit(true);
    try {
      await apiFetch(`/admin/deposit-requests/${id}/approve`, {
        method: "PATCH",
        token,
      });
      await loadPrivate(token);
      pushToast("success", "Deposit approved");
    } catch (error: any) {
      pushToast("error", error.message ?? "Failed to approve deposit");
      throw error;
    } finally {
      setIsApprovingDeposit(false);
    }
  };

  const rejectDeposit = async (id: string) => {
    if (!token) throw new Error("Admin login required.");
    setIsRejectingDeposit(true);
    try {
      await apiFetch(`/admin/deposit-requests/${id}/reject`, {
        method: "PATCH",
        token,
      });
      await loadPrivate(token);
      pushToast("success", "Deposit rejected");
    } catch (error: any) {
      pushToast("error", error.message ?? "Failed to reject deposit");
      throw error;
    } finally {
      setIsRejectingDeposit(false);
    }
  };

  const createAdminPlatformWallet = async (payload: {
    label: string;
    network: "TRC20" | "ERC20" | "BEP20";
    currency?: "USDT";
    walletAddress: string;
    isActive?: boolean;
  }) => {
    if (!token) throw new Error("Admin login required.");
    setIsCreatingPlatformWallet(true);
    try {
      await apiFetch("/admin/platform-wallets", {
        method: "POST",
        token,
        body: {
          currency: payload.currency ?? "USDT",
          isActive: payload.isActive ?? true,
          ...payload,
        },
      });
      await loadPublic();
      await loadPrivate(token);
      pushToast("success", "Platform wallet created");
    } catch (error: any) {
      pushToast("error", error.message ?? "Failed to create wallet");
      throw error;
    } finally {
      setIsCreatingPlatformWallet(false);
    }
  };

  const deleteAdminPlatformWallet = async (id: string) => {
    if (!token) throw new Error("Admin login required.");
    setIsDeletingPlatformWallet(true);
    try {
      await apiFetch(`/admin/platform-wallets/${id}`, {
        method: "DELETE",
        token,
      });
      await loadPublic();
      await loadPrivate(token);
      pushToast("success", "Platform wallet deleted");
    } catch (error: any) {
      pushToast("error", error.message ?? "Failed to delete wallet");
      throw error;
    } finally {
      setIsDeletingPlatformWallet(false);
    }
  };

  const selectOdd = (
    event: EventItem,
    marketType: SelectionDraft["marketType"],
    pick: string,
    odds: number | null,
    line?: number,
  ) => {
    if (!odds || odds <= 1) return;
    const nextSelection: SelectionDraft = {
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
    };

    setSelections((prev) => {
      const sameSelectionIdx = prev.findIndex(
        (item) =>
          item.eventId === event._id &&
          item.marketType === marketType &&
          item.pick === pick &&
          (item.line ?? null) === (line ?? null),
      );
      if (sameSelectionIdx >= 0) {
        return prev.filter((_, idx) => idx !== sameSelectionIdx);
      }

      // Keep one active selection per event by replacing existing event pick.
      const withoutSameEvent = prev.filter((item) => item.eventId !== event._id);
      return [...withoutSameEvent, nextSelection];
    });
  };

  const clearSelection = () => setSelections([]);
  const removeSelection = (selectionToRemove: SelectionDraft) => {
    setSelections((prev) =>
      prev.filter(
        (item) =>
          !(
            item.eventId === selectionToRemove.eventId &&
            item.marketType === selectionToRemove.marketType &&
            item.pick === selectionToRemove.pick &&
            (item.line ?? null) === (selectionToRemove.line ?? null)
          ),
      ),
    );
  };

  useEffect(() => {
    const savedToken = readToken();
    const savedUser = readAuthUser();
    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(savedUser);

    loadPublic().catch((err) => setErrorMessage(err.message));
    if (savedToken) {
      loadPrivate(savedToken).catch(() => {
        logout();
      });
    }

    const savedSelection =
      typeof window !== "undefined" ? localStorage.getItem("sportsbook_selection") : null;
    const savedStake =
      typeof window !== "undefined" ? localStorage.getItem("sportsbook_stake") : null;
    if (savedSelection) {
      try {
        const parsed = JSON.parse(savedSelection);
        if (Array.isArray(parsed)) setSelections(parsed as SelectionDraft[]);
      } catch {}
    }
    if (savedStake) setStake(savedStake);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selections.length) localStorage.removeItem("sportsbook_selection");
    else localStorage.setItem("sportsbook_selection", JSON.stringify(selections));
  }, [selections]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("sportsbook_stake", stake);
  }, [stake]);

  return {
    token,
    user,
    errorMessage,
    setErrorMessage,
    toasts,
    dismissToast,
    isAuthSubmitting,
    isPlacingTicket,
    isSubmittingDeposit,
    isApprovingDeposit,
    isRejectingDeposit,
    isCreatingPlatformWallet,
    isDeletingPlatformWallet,
    isLoadingPublic,
    events,
    tickets,
    wallet,
    transactions,
    platformWallets,
    adminPlatformWallets,
    depositRequests,
    adminDepositRequests,
    selections,
    stake,
    setStake,
    totalOdds,
    potentialPayout,
    login,
    signup,
    logout,
    loadPublic,
    loadPrivate,
    placeSingleTicket,
    submitDeposit,
    approveDeposit,
    rejectDeposit,
    createAdminPlatformWallet,
    deleteAdminPlatformWallet,
    selectOdd,
    clearSelection,
    removeSelection,
  };
};
