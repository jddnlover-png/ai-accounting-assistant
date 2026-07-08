import type { DateFilter } from "./paymentTypes";

export function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString()}원`;
}

export function normalizeSearch(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

export function getRemainingAmount(statement: any) {
  const totalAmount = Number(statement.total_amount || 0);
  const paidAmount = Number(statement.paid_amount || 0);
  const savedRemainingAmount = Number(statement.remaining_amount || 0);

  if (statement.payment_status === "paid") return 0;
  if (savedRemainingAmount > 0) return savedRemainingAmount;

  return Math.max(totalAmount - paidAmount, 0);
}

export function getDisplayPaymentStatus(statement: any) {
  const totalAmount = Number(statement.total_amount || 0);
  const paidAmount = Number(statement.paid_amount || 0);
  const remainingAmount = getRemainingAmount(statement);

  if (paidAmount <= 0 && remainingAmount > 0) return "unpaid";
  if (paidAmount > 0 && remainingAmount > 0) return "partial";
  if (totalAmount > 0 && remainingAmount <= 0) return "paid";

  return statement.payment_status || "unpaid";
}

export function getStatusLabel(status: string) {
  if (status === "paid") return "입금완료";
  if (status === "partial") return "부분입금";
  return "미입금";
}

export function isWithinDateFilter(
  dateText: string,
  filter: DateFilter,
  customStartDate?: string,
  customEndDate?: string,
) {
  if (filter === "all") return true;

  const targetDate = new Date(dateText);
  if (Number.isNaN(targetDate.getTime())) return true;

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (filter === "7days") {
    const start = new Date(today);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return targetDate >= start && targetDate <= today;
  }

  if (filter === "thisMonth") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return targetDate >= start && targetDate <= today;
  }

  if (filter === "custom") {
    if (!customStartDate && !customEndDate) return true;

    const start = customStartDate ? new Date(customStartDate) : null;
    const end = customEndDate ? new Date(customEndDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    if (start && targetDate < start) return false;
    if (end && targetDate > end) return false;

    return true;
  }

  return true;
}