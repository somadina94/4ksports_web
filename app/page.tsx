import AppShell from "@/src/components/layout/app-shell";
import EventsBetSlipBoard from "@/src/components/features/events-betslip-board";
import HomeQuickActions from "@/src/components/features/home-quick-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

export default function Home() {
  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to 4K Sportsbook</CardTitle>
          <CardDescription>
            Quick access for users. Browse events, pick odds, place tickets, manage wallet and deposits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HomeQuickActions />
        </CardContent>
      </Card>
      <EventsBetSlipBoard />
    </AppShell>
  );
}
