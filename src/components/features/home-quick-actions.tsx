"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { readAuthUser } from "@/src/lib/api";
import type { AuthUser } from "@/src/types/domain";

export default function HomeQuickActions() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(readAuthUser());
  }, []);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Link href="/events"><Button className="w-full">Browse Events</Button></Link>
      <Link href="/events"><Button className="w-full">Open Bet Slip</Button></Link>
      <Link href="/wallet"><Button className="w-full">View Wallet</Button></Link>
      <Link href="/tickets"><Button variant="secondary" className="w-full">My Tickets</Button></Link>
      <Link href="/deposits"><Button variant="secondary" className="w-full">Deposits</Button></Link>
      <Link href="/withdrawals"><Button variant="secondary" className="w-full">Withdrawals</Button></Link>
      {!user && (
        <Link href="/auth/login"><Button variant="outline" className="w-full">Login</Button></Link>
      )}
    </div>
  );
}
