export type ParsedDepositMessage = {
  payerName: string;
  amount: number;
  rawMessage: string;
};

export type MatchDepositTarget = {
  id: string;
  customerName: string;
  remainingAmount: number;
  totalAmount?: number;
  statementDate?: string | null;
};

export type DepositMatchResult = {
  target: MatchDepositTarget;
  isNameMatched: boolean;
  isAmountMatched: boolean;
  matchScore: number;
  matchStatus: "strong" | "weak" | "none";
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeName(value?: string | null) {
  return (value || "").replace(/\s+/g, "").trim();
}

export function normalizeAmount(value: string | number | null | undefined) {
  if (typeof value === "number") return value;
  const onlyNumbers = String(value || "").replace(/[^0-9]/g, "");
  return onlyNumbers ? Number(onlyNumbers) : 0;
}

export function parseDepositMessage(text: string, customerName?: string | null): ParsedDepositMessage {
  const normalized = text.replace(/\s+/g, " ").trim();

  const amountMatch =
    normalized.match(/([\d,]+)\s*원\b/) ||
    normalized.match(/(?:입금액|입금|금액)[:\s]*([\d,]{3,})\b/) ||
    normalized.match(/\b([\d,]{4,})\b/);

  const parsedAmount = amountMatch ? normalizeAmount(amountMatch[1]) : 0;

  let parsedPayerName = "";

  const safeCustomerName = (customerName || "").trim();
  const blockedNames = ["고객", "테스트"];

  if (safeCustomerName) {
    const customerPattern = new RegExp(escapeRegExp(safeCustomerName));
    if (customerPattern.test(normalized)) {
      parsedPayerName = safeCustomerName;
    }
  }

  if (!parsedPayerName) {
    const payerPatterns = [
      /입금자명[:\s]*([가-힣a-zA-Z0-9]{2,20})/,
      /보낸분[:\s]*([가-힣a-zA-Z0-9]{2,20})/,
      /보낸사람[:\s]*([가-힣a-zA-Z0-9]{2,20})/,
      /^([가-힣a-zA-Z0-9]{2,20})\s+[\d,]+(?:\s*원)?/,
      /([가-힣a-zA-Z0-9]{2,20})(?=\s*(?:에서|에게|님|씨)?\s*[\d,]+(?:\s*원)?)/,
      /([가-힣a-zA-Z0-9]{2,20})(?=에게\s*[\d,]+(?:\s*원)?이\s*입금되었습니다)/,
      /([가-힣a-zA-Z0-9]{2,20})(?=에서\s*[\d,]+(?:\s*원)?이?\s*입금)/,
    ];

    for (const pattern of payerPatterns) {
      const match = normalized.match(pattern);
      if (match?.[1]) {
        parsedPayerName = match[1].trim();
        break;
      }
    }
  }

  if (parsedPayerName !== safeCustomerName && blockedNames.includes(parsedPayerName)) {
    parsedPayerName = "";
  }

  return {
    payerName: parsedPayerName,
    amount: parsedAmount,
    rawMessage: text,
  };
}

export function matchDepositToTargets(
  parsed: ParsedDepositMessage,
  targets: MatchDepositTarget[],
): DepositMatchResult[] {
  const parsedName = normalizeName(parsed.payerName);
  const parsedAmount = normalizeAmount(parsed.amount);

  return targets
    .map((target) => {
      const targetName = normalizeName(target.customerName);
      const targetAmount = normalizeAmount(target.remainingAmount);

      const isAmountMatched = parsedAmount > 0 && targetAmount > 0 && parsedAmount === targetAmount;

      const isNameMatched =
        !!parsedName &&
        !!targetName &&
        (parsedName === targetName || parsedName.includes(targetName) || targetName.includes(parsedName));

      let matchScore = 0;

      if (isAmountMatched) matchScore += 70;
      if (isNameMatched) matchScore += 30;

      const matchStatus: DepositMatchResult["matchStatus"] =
        isAmountMatched && isNameMatched ? "strong" : isAmountMatched ? "weak" : "none";

      return {
        target,
        isNameMatched,
        isAmountMatched,
        matchScore,
        matchStatus,
      };
    })
    .filter((result) => result.matchStatus !== "none")
    .sort((a, b) => b.matchScore - a.matchScore);
}