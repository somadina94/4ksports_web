"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, ChevronUp } from "lucide-react";
import { useSportsbook } from "@/src/hooks/useSportsbook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import ToastStack from "@/src/components/ui/toast-stack";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function EventsBetSlipBoard() {
  const [mobileSlipOpen, setMobileSlipOpen] = useState(false);
  const {
    events,
    selections,
    selectOdd,
    clearSelection,
    removeSelection,
    stake,
    setStake,
    totalOdds,
    potentialPayout,
    placeSingleTicket,
    setErrorMessage,
    errorMessage,
    toasts,
    dismissToast,
    isPlacingTicket,
    user,
    isLoadingPublic,
    loadPublic,
  } = useSportsbook();

  const oddClass = (eventId: string, marketType: string, pick: string, line?: number) => {
    const active = selections.some(
      (selection) =>
        selection.eventId === eventId &&
        selection.marketType === marketType &&
        selection.pick === pick &&
        (selection.line ?? null) === (line ?? null),
    );
    return active
      ? "bg-indigo-600 text-white border-indigo-500"
      : "bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";
  };

  const formatOdd = (value: number | null) => {
    if (!value) return "-";
    return value.toFixed(2);
  };

  const betSlipBody = (
    <div className="space-y-3">
      {selections.length ? (
        <div className="space-y-2">
          {selections.map((selection, index) => (
            <div
              key={`${selection.eventId}-${selection.marketType}-${selection.pick}-${selection.line ?? "no-line"}`}
              className="rounded-lg border border-zinc-300 p-3 dark:border-zinc-800"
            >
              <p className="font-semibold">
                {index + 1}. {selection.eventLabel}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{selection.label}</p>
              <p className="mt-1">Odds: {selection.odds}</p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() => removeSelection(selection)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button size="sm" variant="secondary" onClick={clearSelection}>
            Clear Slip
          </Button>
        </div>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Pick an odd from events.</p>
      )}
      <Input value={stake} onChange={(e) => setStake(e.target.value)} placeholder="Stake" />
      <p>Total odds: {totalOdds ? totalOdds.toFixed(4) : "-"}</p>
      <p>Potential payout: {potentialPayout.toFixed(2)} USDT</p>
      {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
      <Button
        disabled={isPlacingTicket}
        onClick={() =>
          placeSingleTicket()
            .then(() => setMobileSlipOpen(false))
            .catch((err) => setErrorMessage(err.message))
        }
      >
        {isPlacingTicket ? "Placing..." : "Place Ticket"}
      </Button>
      {!user && (
        <Link href="/auth/login">
          <Button variant="secondary">Go to Login</Button>
        </Link>
      )}
    </div>
  );

  const slipSummaryLine =
    selections.length === 0
      ? "Tap to build your slip"
      : `${selections.length} pick${selections.length === 1 ? "" : "s"} · ${totalOdds ? totalOdds.toFixed(2) : "—"} comb.`;

  return (
    <div className="grid gap-6 pb-28 lg:grid-cols-12 lg:pb-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <Card className="lg:col-span-8">
        <CardHeader>
          <CardTitle>Events & Odds</CardTitle>
          <CardDescription>Click odds to add to bet slip.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPublic && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading events...</p>
          )}
          {!isLoadingPublic && events.length === 0 && (
            <div className="rounded-lg border border-zinc-300 p-3 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
              No events available right now.
              <div className="mt-2">
                <Button size="sm" variant="secondary" onClick={() => loadPublic().catch((err) => setErrorMessage(err.message))}>
                  Refresh Events
                </Button>
              </div>
            </div>
          )}
          {events.map((event) => (
            <div key={event._id} className="rounded-xl border border-zinc-300 p-4 dark:border-zinc-800">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{event.homeTeam} vs {event.awayTeam}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{event.league.name} • {new Date(event.eventDate).toLocaleString()}</p>
                </div>
                <Badge>{event.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button className={`rounded-md border p-2 text-left ${oddClass(event._id, "match_winner", "home")}`} onClick={() => selectOdd(event, "match_winner", "home", event.odds.odds_home)}>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Home (1)</div>
                  <div className="text-sm font-semibold">{formatOdd(event.odds.odds_home)}</div>
                </button>
                <button className={`rounded-md border p-2 text-left ${oddClass(event._id, "match_winner", "draw")}`} onClick={() => selectOdd(event, "match_winner", "draw", event.odds.odds_draw)}>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Draw (X)</div>
                  <div className="text-sm font-semibold">{formatOdd(event.odds.odds_draw)}</div>
                </button>
                <button className={`rounded-md border p-2 text-left ${oddClass(event._id, "match_winner", "away")}`} onClick={() => selectOdd(event, "match_winner", "away", event.odds.odds_away)}>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Away (2)</div>
                  <div className="text-sm font-semibold">{formatOdd(event.odds.odds_away)}</div>
                </button>
                <button className={`rounded-md border p-2 text-left ${oddClass(event._id, "btts", "yes")}`} onClick={() => selectOdd(event, "btts", "yes", event.odds.odds_btts_yes)}>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">BTTS Yes</div>
                  <div className="text-sm font-semibold">{formatOdd(event.odds.odds_btts_yes)}</div>
                </button>
                <button className={`rounded-md border p-2 text-left ${oddClass(event._id, "btts", "no")}`} onClick={() => selectOdd(event, "btts", "no", event.odds.odds_btts_no)}>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">BTTS No</div>
                  <div className="text-sm font-semibold">{formatOdd(event.odds.odds_btts_no)}</div>
                </button>
                <button className={`rounded-md border p-2 text-left ${oddClass(event._id, "total_goals", "over", 1.5)}`} onClick={() => selectOdd(event, "total_goals", "over", event.odds.odds_over_15, 1.5)}>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Over 1.5</div>
                  <div className="text-sm font-semibold">{formatOdd(event.odds.odds_over_15)}</div>
                </button>
                <button className={`rounded-md border p-2 text-left ${oddClass(event._id, "total_goals", "under", 1.5)}`} onClick={() => selectOdd(event, "total_goals", "under", event.odds.odds_under_15, 1.5)}>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Under 1.5</div>
                  <div className="text-sm font-semibold">{formatOdd(event.odds.odds_under_15)}</div>
                </button>
                <button className={`rounded-md border p-2 text-left ${oddClass(event._id, "total_goals", "over", 2.5)}`} onClick={() => selectOdd(event, "total_goals", "over", event.odds.odds_over_25, 2.5)}>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Over 2.5</div>
                  <div className="text-sm font-semibold">{formatOdd(event.odds.odds_over_25)}</div>
                </button>
                <button className={`rounded-md border p-2 text-left ${oddClass(event._id, "total_goals", "under", 2.5)}`} onClick={() => selectOdd(event, "total_goals", "under", event.odds.odds_under_25, 2.5)}>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Under 2.5</div>
                  <div className="text-sm font-semibold">{formatOdd(event.odds.odds_under_25)}</div>
                </button>
                <button className={`rounded-md border p-2 text-left ${oddClass(event._id, "total_goals", "over", 3.5)}`} onClick={() => selectOdd(event, "total_goals", "over", event.odds.odds_over_35, 3.5)}>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Over 3.5</div>
                  <div className="text-sm font-semibold">{formatOdd(event.odds.odds_over_35)}</div>
                </button>
                <button className={`rounded-md border p-2 text-left ${oddClass(event._id, "total_goals", "under", 3.5)}`} onClick={() => selectOdd(event, "total_goals", "under", event.odds.odds_under_35, 3.5)}>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Under 3.5</div>
                  <div className="text-sm font-semibold">{formatOdd(event.odds.odds_under_35)}</div>
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="hidden lg:col-span-4 lg:block">
        <CardHeader>
          <CardTitle>Bet Slip</CardTitle>
          <CardDescription>
            {user ? `Logged in as ${user.username}` : "Login to place ticket."}
          </CardDescription>
        </CardHeader>
        <CardContent>{betSlipBody}</CardContent>
      </Card>

      {/* Mobile: sticky bottom bar + bottom sheet */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileSlipOpen(true)}
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
            <ClipboardList className="size-5" />
            {selections.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-900">
                {selections.length}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Bet slip</p>
            <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{slipSummaryLine}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Open
            <ChevronUp className="size-4" />
          </div>
        </button>

        <Sheet open={mobileSlipOpen} onOpenChange={setMobileSlipOpen}>
          <SheetContent
            side="bottom"
            showCloseButton
            className="max-h-[min(92dvh,100%)] gap-0 overflow-hidden rounded-t-2xl border-zinc-200 p-0 dark:border-zinc-800"
          >
            <SheetHeader className="border-b border-zinc-200 px-4 pb-3 pt-2 text-left dark:border-zinc-800">
              <SheetTitle>Bet slip</SheetTitle>
              <SheetDescription>
                {user ? `Logged in as ${user.username}` : "Login to place ticket."}
              </SheetDescription>
            </SheetHeader>
            <div className="max-h-[min(78dvh,80vh)] overflow-y-auto px-4 py-4">{betSlipBody}</div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
