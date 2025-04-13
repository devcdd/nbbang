export type Member = string;

export interface Settlement {
  id: string;
  title: string;
  description?: string;
  members: Member[];
  amount: number;
}

export interface SettlementGroup {
  settlements: Settlement[];
  totalAmount: number;
}
