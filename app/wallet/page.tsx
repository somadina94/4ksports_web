"use client";

import AppShell from "@/src/components/layout/app-shell";
import { useSportsbook } from "@/src/hooks/useSportsbook";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

export default function WalletPage() {
  const { wallet, transactions } = useSportsbook();
  return (
    <AppShell>
      <Card>
        <CardHeader><CardTitle>Balance Wallet</CardTitle></CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{wallet ? wallet.balance.toFixed(2) : "0.00"} USDT</p>
          <p className="text-sm text-zinc-400">Locked: {wallet?.lockedBalance?.toFixed(2) ?? "0.00"} USDT</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Balance Transactions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Before</TableHead><TableHead>After</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx._id}>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.balanceBefore}</TableCell>
                  <TableCell>{tx.balanceAfter}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
