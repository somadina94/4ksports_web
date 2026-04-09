"use client";

import AppShell from "@/src/components/layout/app-shell";
import { useSportsbook } from "@/src/hooks/useSportsbook";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

export default function TicketsPage() {
  const { tickets } = useSportsbook();

  return (
    <AppShell>
      <Card>
        <CardHeader><CardTitle>My Tickets</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="rounded-lg border border-zinc-800 p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{ticket.type.toUpperCase()}</p>
                <Badge>{ticket.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                Stake {ticket.stake} | Odds {ticket.totalOdds} | Payout {ticket.potentialPayout}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
