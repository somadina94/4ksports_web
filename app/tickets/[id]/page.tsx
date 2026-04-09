"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/src/components/layout/app-shell";
import { useSportsbook } from "@/src/hooks/useSportsbook";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import type { Ticket, TicketSelectionDetail } from "@/src/types/domain";

const formatMarket = (marketType: string) => {
  if (marketType === "match_winner") return "Match winner (1X2)";
  if (marketType === "total_goals") return "Total goals";
  if (marketType === "btts") return "Both teams to score";
  return marketType;
};

const formatPick = (selection: TicketSelectionDetail) => {
  const { marketType, pick, line } = selection;
  if (marketType === "match_winner") {
    if (pick === "home") return "Home";
    if (pick === "away") return "Away";
    if (pick === "draw") return "Draw";
  }
  if (marketType === "total_goals" && line != null) {
    return `${pick === "over" ? "Over" : "Under"} ${line}`;
  }
  if (marketType === "btts") return pick === "yes" ? "Yes" : "No";
  return pick;
};

const formatEventDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

export default function TicketDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { token, loadTicketDetail } = useSportsbook();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [selections, setSelections] = useState<TicketSelectionDetail[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    if (!token) {
      setLoading(false);
      setError("Sign in to view this ticket.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    loadTicketDetail(id)
      .then((res) => {
        if (!cancelled) {
          setTicket(res.data.ticket);
          setSelections(res.data.selections);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message ?? "Could not load ticket.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, token, loadTicketDetail]);

  return (
    <AppShell>
      <div className="mb-4">
        <Link href="/tickets" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Back to tickets
        </Link>
      </div>

      {loading && <p className="text-zinc-400">Loading…</p>}
      {error && !loading && <p className="text-red-400">{error}</p>}

      {!loading && !error && ticket && (
        <>
          <Card className="mb-4">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
              <CardTitle>Ticket</CardTitle>
              <Badge>{ticket.status}</Badge>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>
                <span className="text-zinc-400">Type:</span>{" "}
                {ticket.type === "single" ? "Single" : "Accumulator"}
              </p>
              <p>
                <span className="text-zinc-400">Stake:</span> {ticket.stake} USDT
              </p>
              <p>
                <span className="text-zinc-400">Total odds:</span> {ticket.totalOdds}
              </p>
              <p>
                <span className="text-zinc-400">Potential payout:</span>{" "}
                {ticket.potentialPayout} USDT
              </p>
              <p>
                <span className="text-zinc-400">Placed:</span> {formatEventDate(ticket.placedAt)}
              </p>
              {ticket.settledAt && (
                <p>
                  <span className="text-zinc-400">Settled:</span>{" "}
                  {formatEventDate(ticket.settledAt)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selections</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {selections.map((sel) => {
                const snap = sel.snapshot;
                const ev = sel.event;
                const showScore =
                  ev && (ev.status === "finished" || ev.scores.home > 0 || ev.scores.away > 0);

                return (
                  <div
                    key={sel._id}
                    className="rounded-lg border border-zinc-800 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {snap.homeTeam} <span className="text-zinc-500">vs</span> {snap.awayTeam}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Kickoff (at bet): {formatEventDate(snap.eventDate)}
                        </p>
                      </div>
                      <Badge>{sel.status}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-zinc-300">
                      {formatMarket(snap.marketType)} · {formatPick(sel)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">Odds @ placement: {sel.odds}</p>
                    {ev && (
                      <p className="mt-2 text-sm text-zinc-500">
                        Event status: {ev.status}
                        {showScore
                          ? ` · Score ${ev.scores.home}–${ev.scores.away}`
                          : ""}
                      </p>
                    )}
                    {!ev && (
                      <p className="mt-2 text-xs text-zinc-600">
                        Current match data unavailable (event may have been removed from the feed).
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </AppShell>
  );
}
