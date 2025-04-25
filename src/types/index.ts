export type Member = string;

export interface Settlement {
  id: string;
  title: string;
  members: string[];
  amount: number;
  memberAmounts?: {[key: string]: number};
}

export interface SettlementGroup {
  settlements: Settlement[];
  totalAmount: number;
}
