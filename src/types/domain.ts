export type ApiResponse<T> = {
  status: string;
  message?: string;
  data: T;
};

export type AuthUser = {
  username: string;
  role: "user" | "admin";
};

export type EventItem = {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  eventDate: string;
  status: string;
  league: { name: string; country?: string };
  odds: {
    odds_home: number | null;
    odds_draw: number | null;
    odds_away: number | null;
    odds_over_15: number | null;
    odds_over_25: number | null;
    odds_over_35: number | null;
    odds_under_15: number | null;
    odds_under_25: number | null;
    odds_under_35: number | null;
    odds_btts_yes: number | null;
    odds_btts_no: number | null;
  };
};

export type Ticket = {
  _id: string;
  type: "single" | "accumulator";
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  status: string;
  placedAt: string;
  settledAt?: string;
};

export type TicketSelectionSnapshot = {
  eventDate: string;
  homeTeam: string;
  awayTeam: string;
  marketType: string;
  pick: string;
  line?: number | null;
};

export type TicketEventSummary = {
  status: string;
  scores: { home: number; away: number };
  homeTeam: string;
  awayTeam: string;
};

export type TicketSelectionDetail = {
  _id: string;
  eventId: string;
  marketType: string;
  pick: string;
  line?: number | null;
  odds: number;
  status: string;
  snapshot: TicketSelectionSnapshot;
  settledAt?: string;
  event: TicketEventSummary | null;
};

export type BalanceWallet = {
  _id: string;
  balance: number;
  currency: string;
  lockedBalance: number;
};

export type BalanceTransaction = {
  _id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
};

export type PlatformWallet = {
  _id: string;
  label: string;
  network: "TRC20" | "ERC20" | "BEP20";
  currency: string;
  walletAddress: string;
  isActive: boolean;
};

export type DepositRequest = {
  _id: string;
  amount: number;
  network: string;
  txHash: string;
  status: string;
  createdAt: string;
};

export type Announcement = {
  _id: string;
  body: string;
  expiresAt: string;
  createdAt?: string;
};
