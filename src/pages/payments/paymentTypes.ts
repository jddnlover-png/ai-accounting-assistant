import type { MatchDepositTarget } from "../../lib/paymentParser";

export type PaymentFilter = "all" | "unpaid" | "partial" | "paid";

export type DateFilter = "7days" | "thisMonth" | "custom" | "all";

export type MatchCandidate =
  | {
      id: string;
      type: "statement";
      target: MatchDepositTarget;
      isNameMatched: boolean;
      isAmountMatched: boolean;
      matchStatus: string;
    }
  | {
      id: string;
      type: "customer_group";
      customerId: string;
      customerName: string;
      statementIds: string[];
      statementCount: number;
      totalRemainingAmount: number;
      statements: any[];
      isNameMatched: boolean;
      isAmountMatched: boolean;
      matchStatus: string;
    };