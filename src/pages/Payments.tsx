import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useSalesStatements } from "../hooks/useSalesStatements";
import {
  useCreateCustomerPayment,
  useCreateStatementPayment,
  useDeleteStatementPayment,
  useStatementPayments,
  useUnpaidCustomerStatements,
} from "../hooks/usePayments";
import {
  matchDepositToTargets,
  parseDepositMessage,
  type MatchDepositTarget,
} from "../lib/paymentParser";

import type {
  DateFilter,
  MatchCandidate,
  PaymentFilter,
} from "./payments/paymentTypes";
import {
  formatCurrency,
  getDisplayPaymentStatus,
  getRemainingAmount,
  getStatusLabel,
  isWithinDateFilter,
  normalizeSearch,
} from "./payments/paymentUtils";
import PaymentHistoryList from "./payments/PaymentHistoryList";
import ManualPaymentSection from "./payments/ManualPaymentSection";
import MessagePaymentSection from "./payments/MessagePaymentSection";
import PaymentCustomerSection from "./payments/PaymentCustomerSection";


const PAYMENTS_STATE_STORAGE_KEY = "ai-bookkeeper.payments.state";

const paymentsPageCss = `
  .space-y-6 > * + * { margin-top: 24px; }
  .space-y-4 > * + * { margin-top: 16px; }
  .space-y-3 > * + * { margin-top: 12px; }
  .space-y-2 > * + * { margin-top: 8px; }
  .space-y-1 > * + * { margin-top: 4px; }

  .p-2 { padding: 8px; }
  .p-3 { padding: 12px; }
  .p-4 { padding: 16px; }
  .p-5 { padding: 20px; }
  .p-6 { padding: 24px; }
  .p-8 { padding: 32px; }

  .px-2\\.5 { padding-left: 10px; padding-right: 10px; }
  .px-3 { padding-left: 12px; padding-right: 12px; }
  .px-4 { padding-left: 16px; padding-right: 16px; }

  .py-1 { padding-top: 4px; padding-bottom: 4px; }
  .py-2 { padding-top: 8px; padding-bottom: 8px; }

  .mt-1 { margin-top: 4px; }
  .mt-2 { margin-top: 8px; }
  .mb-1 { margin-bottom: 4px; }
  .mb-2 { margin-bottom: 8px; }
  .ml-2 { margin-left: 8px; }
  .pb-4 { padding-bottom: 16px; }

  .block { display: block; }
  .inline-flex { display: inline-flex; }
  .flex { display: flex; }
  .grid { display: grid; }
  .w-full { width: 100%; }
  .min-w-\\[900px\\] { min-width: 900px; }

  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .items-center { align-items: center; }
  .items-start { align-items: flex-start; }
  .justify-between { justify-content: space-between; }
  .justify-end { justify-content: flex-end; }
  .flex-wrap { flex-wrap: wrap; }

  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .gap-5 { gap: 20px; }

  .overflow-x-auto { overflow-x: auto; }

  .border { border: 1px solid #e5e7eb; }
  .border-b { border-bottom: 1px solid #e5e7eb; }
  .border-dashed { border-style: dashed; }
  .border-blue-600 { border-color: #2563eb; }
  .border-red-200 { border-color: #fecaca; }
  .border-red-500 { border-color: #ef4444; }

  .rounded-md { border-radius: 8px; }
  .rounded-lg { border-radius: 10px; }
  .rounded-xl { border-radius: 12px; }
  .rounded-2xl { border-radius: 14px; }
  .rounded-full { border-radius: 999px; }

  .bg-white { background: #ffffff; }
  .bg-black { background: #111827; }
  .bg-gray-50 { background: #f9fafb; }
  .bg-gray-100 { background: #f3f4f6; }
  .bg-blue-50 { background: #eff6ff; }
  .bg-blue-600 { background: #2563eb; }
  .bg-green-50 { background: #ecfdf5; }
  .bg-amber-50 { background: #fffbeb; }
  .bg-red-50 { background: #fef2f2; }
  .bg-gray-900 { background: #111827; }

  .text-white { color: #ffffff; }
  .text-gray-500 { color: #6b7280; }
  .text-gray-600 { color: #4b5563; }
  .text-blue-600 { color: #2563eb; }
  .text-green-700 { color: #047857; }
  .text-amber-700 { color: #b45309; }
  .text-red-600 { color: #dc2626; }
  .text-red-700 { color: #b91c1c; }

  .text-left { text-align: left; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }

  .text-xs { font-size: 12px; line-height: 1.4; }
  .text-sm { font-size: 14px; line-height: 1.5; }
  .text-lg { font-size: 18px; line-height: 1.5; }
  .text-xl { font-size: 20px; line-height: 1.4; }
  .text-2xl { font-size: 30px; line-height: 1.25; }

  .font-medium { font-weight: 500; }
  .font-semibold { font-weight: 700; }
  .font-bold { font-weight: 800; }

  .shadow-sm { box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04); }
  .cursor-pointer { cursor: pointer; }
  .border-collapse { border-collapse: collapse; }

  .disabled\\:opacity-50:disabled { opacity: 0.5; }
  .hover\\:bg-blue-50:hover { background: #eff6ff; }
  .hover\\:bg-gray-50:hover { background: #f9fafb; }

  button { cursor: pointer; }
  input, select, textarea { box-sizing: border-box; outline: none; }
  th, td { border-bottom: 1px solid #f3f4f6; }

  @media (min-width: 768px) {
    .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }

  @media (min-width: 640px) {
    .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  @media (min-width: 1280px) {
    .xl\\:grid-cols-\\[minmax\\(0\\,1\\.15fr\\)_minmax\\(420px\\,0\\.85fr\\)\\] {
      grid-template-columns: minmax(0, 1.15fr) minmax(420px, 0.85fr);
    }
    .xl\\:sticky { position: sticky; }
    .xl\\:top-6 { top: 24px; }
  }
`;


function loadPaymentsState() {
  try {
    const saved = sessionStorage.getItem(PAYMENTS_STATE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}


const styles: Record<string, CSSProperties> = {
  page: {
    width: "100%",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "34px",
    fontWeight: 800,
    margin: 0,
    color: "#111827",
  },
  description: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "15px",
  },
  card: {
    width: "100%",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
    boxSizing: "border-box",
  },
};
export default function Payments() {
  const { data: statements, isLoading, refetch } = useSalesStatements();

  const createPayment = useCreateStatementPayment();
const createCustomerPayment = useCreateCustomerPayment();
const deletePayment = useDeleteStatementPayment();

const savedState = useMemo(() => loadPaymentsState(), []);

const [statusFilter, setStatusFilter] = useState<PaymentFilter>(
  savedState.statusFilter || "unpaid",
);
const [dateFilter, setDateFilter] = useState<DateFilter>(
  savedState.dateFilter || "thisMonth",
);
const [customStartDate, setCustomStartDate] = useState(
  savedState.customStartDate || "",
);
const [customEndDate, setCustomEndDate] = useState(
  savedState.customEndDate || "",
);
const [searchText, setSearchText] = useState(savedState.searchText || "");
const [selectedStatementId, setSelectedStatementId] = useState(
  savedState.selectedStatementId || "",
);

const statementPayments = useStatementPayments(selectedStatementId);

  const [manualAmount, setManualAmount] = useState("");
  const [manualPayerName, setManualPayerName] = useState("");
  const [manualMethod, setManualMethod] = useState("계좌이체");
  const [manualMemo, setManualMemo] = useState("");

  const [selectedCustomerId, setSelectedCustomerId] = useState(
  savedState.selectedCustomerId || "",
);
  const [selectedCustomerStatementIds, setSelectedCustomerStatementIds] =
    useState<string[]>([]);
  const [customerPaymentAmount, setCustomerPaymentAmount] = useState("");
  const [customerPayerName, setCustomerPayerName] = useState("");
  const [customerPaymentMethod, setCustomerPaymentMethod] =
    useState("계좌이체");
  const [customerPaymentMemo, setCustomerPaymentMemo] = useState("");

  const unpaidCustomerStatements =
    useUnpaidCustomerStatements(selectedCustomerId);

  const [rawMessage, setRawMessage] = useState(savedState.rawMessage || "");
const [parsedPayerName, setParsedPayerName] = useState(
  savedState.parsedPayerName || "",
);
const [parsedAmount, setParsedAmount] = useState(
  Number(savedState.parsedAmount || 0),
);
const [selectedMatchId, setSelectedMatchId] = useState(
  savedState.selectedMatchId || "",
);

useEffect(() => {
  sessionStorage.setItem(
    PAYMENTS_STATE_STORAGE_KEY,
    JSON.stringify({
  statusFilter,
  dateFilter,
  customStartDate,
  customEndDate,
  searchText,
  selectedStatementId,
  selectedCustomerId,
  rawMessage,
  parsedPayerName,
  parsedAmount,
  selectedMatchId,
}),
  );
}, [
    statusFilter,
  dateFilter,
  customStartDate,
  customEndDate,
  searchText,
  selectedStatementId,
  selectedCustomerId,
  rawMessage,
  parsedPayerName,
  parsedAmount,
  selectedMatchId,
]);

  const customerOptions = useMemo(() => {
    const map = new Map<string, string>();

    (statements || []).forEach((statement: any) => {
      if (statement.customer_id && statement.customer_name_snapshot) {
        map.set(statement.customer_id, statement.customer_name_snapshot);
      }
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [statements]);

  const selectedCustomerName =
    customerOptions.find((customer) => customer.id === selectedCustomerId)
      ?.name || "";

  const selectedCustomerStatements = useMemo(() => {
    return (unpaidCustomerStatements.data || []).filter((statement: any) =>
      selectedCustomerStatementIds.includes(statement.id),
    );
  }, [unpaidCustomerStatements.data, selectedCustomerStatementIds]);

  const selectedCustomerTotalRemaining = useMemo(() => {
    return selectedCustomerStatements.reduce((sum: number, statement: any) => {
      return sum + getRemainingAmount(statement);
    }, 0);
  }, [selectedCustomerStatements]);

  const countByStatus = useMemo(() => {
    const dateFiltered = (statements || []).filter((statement: any) =>
      isWithinDateFilter(
        statement.statement_date,
        dateFilter,
        customStartDate,
        customEndDate,
      ),
    );

    const result = {
      all: dateFiltered.length,
      unpaid: 0,
      partial: 0,
      paid: 0,
    };

    dateFiltered.forEach((statement: any) => {
      const status = getDisplayPaymentStatus(statement);

      if (status === "paid") result.paid += 1;
      else if (status === "partial") result.partial += 1;
      else result.unpaid += 1;
    });

    return result;
  }, [statements, dateFilter, customStartDate, customEndDate]);

  const paymentStatements = useMemo(() => {
    return (statements || []).filter((statement: any) => {
      const status = getDisplayPaymentStatus(statement);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesDate = isWithinDateFilter(
        statement.statement_date,
        dateFilter,
        customStartDate,
        customEndDate,
      );

      return matchesStatus && matchesDate;
    });
  }, [statements, statusFilter, dateFilter, customStartDate, customEndDate]);

  const filteredStatements = useMemo(() => {
    const keyword = normalizeSearch(searchText);

    if (!keyword) return paymentStatements;

    return paymentStatements.filter((statement: any) => {
      const totalAmount = Number(statement.total_amount || 0);
      const paidAmount = Number(statement.paid_amount || 0);
      const remainingAmount = getRemainingAmount(statement);
      const status = getDisplayPaymentStatus(statement);

      const searchableText = normalizeSearch(
        [
          statement.statement_date,
          statement.customer_name_snapshot,
          String(totalAmount),
          String(paidAmount),
          String(remainingAmount),
          formatCurrency(totalAmount),
          formatCurrency(paidAmount),
          formatCurrency(remainingAmount),
          status,
          getStatusLabel(status),
        ].join(" "),
      );

      return searchableText.includes(keyword);
    });
  }, [searchText, paymentStatements]);

  const selectedStatement = (statements || []).find(
    (item: any) => item.id === selectedStatementId,
  );

  const matchTargets: MatchDepositTarget[] = useMemo(() => {
    return (statements || [])
      .filter((statement: any) => getDisplayPaymentStatus(statement) !== "paid")
      .map((statement: any) => ({
        id: statement.id,
        customerName: statement.customer_name_snapshot,
        remainingAmount: getRemainingAmount(statement),
        totalAmount: Number(statement.total_amount || 0),
        statementDate: statement.statement_date,
      }))
      .filter((target) => target.remainingAmount > 0);
  }, [statements]);

  const singleMatchResults = useMemo(() => {
  return matchDepositToTargets(
    {
      payerName: parsedPayerName,
      amount: parsedAmount,
      rawMessage,
    },
    matchTargets,
  ).map((result) => ({
    ...result,
    id: `statement:${result.target.id}`,
    type: "statement" as const,
  }));
}, [parsedPayerName, parsedAmount, rawMessage, matchTargets]);

const customerGroupMatchResults = useMemo(() => {
  if (!parsedAmount || parsedAmount <= 0) return [];

  const customerMap = new Map<string, any>();

  (statements || []).forEach((statement: any) => {
    const status = getDisplayPaymentStatus(statement);
    const remainingAmount = getRemainingAmount(statement);

    if (status === "paid" || remainingAmount <= 0 || !statement.customer_id) {
      return;
    }

    const current = customerMap.get(statement.customer_id) || {
      customerId: statement.customer_id,
      customerName: statement.customer_name_snapshot || "",
      statementIds: [],
      statementCount: 0,
      totalRemainingAmount: 0,
      statements: [],
    };

    current.statementIds.push(statement.id);
    current.statementCount += 1;
    current.totalRemainingAmount += remainingAmount;
    current.statements.push(statement);

    customerMap.set(statement.customer_id, current);
  });

  return Array.from(customerMap.values())
    .filter((group) => group.statementCount >= 2)
    .map((group) => {
      const normalizedPayer = normalizeSearch(parsedPayerName || "");
      const normalizedCustomer = normalizeSearch(group.customerName || "");

      const isNameMatched =
        !!normalizedPayer &&
        (normalizedCustomer.includes(normalizedPayer) ||
          normalizedPayer.includes(normalizedCustomer));

      const isAmountMatched = group.totalRemainingAmount === parsedAmount;

      return {
        ...group,
        id: `customer:${group.customerId}`,
        type: "customer_group" as const,
        isNameMatched,
        isAmountMatched,
        matchStatus: isNameMatched && isAmountMatched ? "strong" : "amount",
      };
    })
    .filter((group) => group.isAmountMatched)
    .sort((a, b) => {
      if (a.isNameMatched && !b.isNameMatched) return -1;
      if (!a.isNameMatched && b.isNameMatched) return 1;
      return b.statementCount - a.statementCount;
    });
}, [statements, parsedAmount, parsedPayerName]);

const matchResults: MatchCandidate[] = useMemo(() => {
  return [...customerGroupMatchResults, ...singleMatchResults];
}, [customerGroupMatchResults, singleMatchResults]);

const selectedMatch = matchResults.find((item) => item.id === selectedMatchId);

  useEffect(() => {
    if (!selectedMatchId && matchResults.length > 0) {
      setSelectedMatchId(matchResults[0].id);
    }
  }, [selectedMatchId, matchResults]);

  const handleSelectStatement = (statement: any) => {
    const remainingAmount = getRemainingAmount(statement);

    setSelectedStatementId(statement.id);
    setManualAmount(String(remainingAmount));
    setManualPayerName(statement.customer_name_snapshot || "");
    setManualMemo("");
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setSelectedCustomerStatementIds([]);
    setCustomerPaymentAmount("");
    setCustomerPayerName(
      customerOptions.find((customer) => customer.id === customerId)?.name || "",
    );
    setCustomerPaymentMemo("");
  };

  const handleToggleCustomerStatement = (statementId: string) => {
  setSelectedCustomerStatementIds((prev) => {
    const nextIds = prev.includes(statementId)
      ? prev.filter((id) => id !== statementId)
      : [...prev, statementId];

    const total = (unpaidCustomerStatements.data || [])
      .filter((statement: any) => nextIds.includes(statement.id))
      .reduce(
        (sum: number, statement: any) => sum + getRemainingAmount(statement),
        0,
      );

    setCustomerPaymentAmount(total > 0 ? String(total) : "");

    return nextIds;
  });
};

  const handleSelectAllCustomerStatements = () => {
  const statements = unpaidCustomerStatements.data || [];
  const ids = statements.map((statement: any) => statement.id);

  const isAllSelected =
    ids.length > 0 &&
    ids.every((id: string) => selectedCustomerStatementIds.includes(id));

  if (isAllSelected) {
    setSelectedCustomerStatementIds([]);
    setCustomerPaymentAmount("");
    return;
  }

  setSelectedCustomerStatementIds(ids);

  const total = statements.reduce(
    (sum: number, statement: any) => sum + getRemainingAmount(statement),
    0,
  );

  setCustomerPaymentAmount(String(total));
};

  const handleCustomerPaymentSubmit = async () => {
    if (!selectedCustomerId) {
      alert("거래처를 선택해주세요.");
      return;
    }

    if (selectedCustomerStatementIds.length === 0) {
      alert("입금 처리할 거래명세표를 선택해주세요.");
      return;
    }

    const amount = Number(customerPaymentAmount.replace(/[^0-9]/g, ""));

    if (!amount || amount <= 0) {
      alert("입금액을 입력해주세요.");
      return;
    }

    if (amount > selectedCustomerTotalRemaining) {
      alert("입금액이 선택한 거래명세표의 총 미수금보다 큽니다.");
      return;
    }

    try {
      const result = await createCustomerPayment.mutateAsync({
        customer_id: selectedCustomerId,
        sales_statement_ids: selectedCustomerStatementIds,
        payment_amount: amount,
        payment_method: customerPaymentMethod,
        payer_name: customerPayerName || selectedCustomerName,
        memo: customerPaymentMemo,
      });

      alert(
        `거래처 기준 입금처리가 완료되었습니다.\n배분 건수: ${result.allocations.length}건`,
      );

      setSelectedCustomerStatementIds([]);
      setCustomerPaymentAmount("");
      setCustomerPayerName(selectedCustomerName);
      setCustomerPaymentMemo("");

      await unpaidCustomerStatements.refetch();
await statementPayments.refetch();
refetch();
    } catch (error: any) {
      console.error("거래처 기준 입금처리 오류:", error);
      alert(error?.message || "입금처리 중 오류가 발생했습니다.");
    }
  };

  const handleManualSubmit = async () => {
    if (!selectedStatement) {
      alert("입금처리할 거래명세표를 먼저 선택해주세요.");
      return;
    }

    const status = getDisplayPaymentStatus(selectedStatement);

    if (status === "paid") {
      alert("이미 입금완료된 거래명세표입니다.");
      return;
    }

    const amount = Number(manualAmount.replace(/[^0-9]/g, ""));

    if (!amount || amount <= 0) {
      alert("입금액을 입력해주세요.");
      return;
    }

    const remainingAmount = getRemainingAmount(selectedStatement);

    if (amount > remainingAmount) {
      alert("입금액이 남은 금액보다 큽니다.");
      return;
    }

    try {
      await createPayment.mutateAsync({
        sales_statement_id: selectedStatement.id,
        customer_id: selectedStatement.customer_id,
        payment_input_type: "manual",
        payment_amount: amount,
        payment_method: manualMethod,
        payer_name: manualPayerName || selectedStatement.customer_name_snapshot,
        memo: manualMemo,
      });

      alert("수기 입금처리가 완료되었습니다.");

      setSelectedStatementId("");
      setManualAmount("");
      setManualPayerName("");
      setManualMemo("");

            await unpaidCustomerStatements.refetch();
      await statementPayments.refetch();
      await refetch();
    } catch (error: any) {
      console.error("입금처리 오류:", error);
      alert(error?.message || "입금처리 중 오류가 발생했습니다.");
    }
  };

  const handleParseMessage = (text: string) => {
    setRawMessage(text);

    const parsed = parseDepositMessage(text);

    setParsedPayerName(parsed.payerName);
    setParsedAmount(parsed.amount);

    setSelectedMatchId("");
  };

  const handleParsedSubmit = async () => {
  if (!selectedMatch) {
    alert("매칭할 입금 후보를 선택해주세요.");
    return;
  }

  if (!parsedAmount || parsedAmount <= 0) {
    alert("입금액을 확인해주세요.");
    return;
  }

  if (!selectedMatch.isAmountMatched) {
    alert("입금액과 매칭 후보의 잔액이 일치하지 않습니다.");
    return;
  }

  try {
    if (selectedMatch.type === "customer_group") {
      await createCustomerPayment.mutateAsync({
        customer_id: selectedMatch.customerId,
        sales_statement_ids: selectedMatch.statementIds,
        payment_amount: parsedAmount,
        payment_method: "문자/카톡",
        payer_name: parsedPayerName,
        raw_message: rawMessage,
        parsed_payer_name: parsedPayerName,
        parsed_amount: parsedAmount,
        memo: "문자/카톡 거래처 합산 자동매칭",
      });

      alert(
        `문자/카톡 합산 입금처리가 완료되었습니다.\n배분 건수: ${selectedMatch.statementCount}건`,
      );
    } else {
      const statement = (statements || []).find(
        (item: any) => item.id === selectedMatch.target.id,
      );

      if (!statement) {
        alert("거래명세표를 찾을 수 없습니다.");
        return;
      }

      await createPayment.mutateAsync({
        sales_statement_id: statement.id,
        customer_id: statement.customer_id,
        payment_input_type: "parsed_text",
        payment_amount: parsedAmount,
        payment_method: "문자/카톡",
        payer_name: parsedPayerName,
        raw_message: rawMessage,
        parsed_payer_name: parsedPayerName,
        parsed_amount: parsedAmount,
        memo: "문자/카톡 입금내역 자동매칭",
      });

      alert("문자/카톡 입금처리가 완료되었습니다.");
    }

    setRawMessage("");
    setParsedPayerName("");
    setParsedAmount(0);
    setSelectedMatchId("");

    sessionStorage.removeItem(PAYMENTS_STATE_STORAGE_KEY);

    refetch();
  } catch (error: any) {
    console.error(error);
    alert(error?.message || "입금처리 중 오류가 발생했습니다.");
  }
};

  const handleCancelPayment = async (payment: any) => {
    if (!selectedStatement) {
      alert("입금취소할 거래명세표를 먼저 선택해주세요.");
      return;
    }

    if (!confirm("선택한 입금내역을 삭제하고 입금상태를 다시 계산할까요?")) {
      return;
    }

    try {
      await deletePayment.mutateAsync({
        paymentId: payment.id,
        salesStatementId: selectedStatement.id,
        sourceTable: payment.source_table,
        paymentOriginalId: payment.payment_id,
      });

      alert("입금내역이 삭제되었습니다.");

            await statementPayments.refetch();
      await unpaidCustomerStatements.refetch();
      await refetch();

      setSelectedStatementId("");
    } catch (error: any) {
      console.error("입금취소 오류:", error);
      alert(error?.message || "입금취소 중 오류가 발생했습니다.");
    }
  };

      return (
    <>
      <style>{paymentsPageCss}</style>

      <div style={styles.page}>
      <div style={styles.header}>
  <h1 style={styles.title}>입금관리</h1>
  <p style={styles.description}>
    거래처 기준 입금처리, 수기 입금처리, 문자/카톡 자동매칭을 함께 관리합니다.
  </p>
</div>

                  <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(360px, 0.65fr) minmax(0, 1.35fr)",
          gap: "20px",
          alignItems: "start",
        }}
      >
                <div className="space-y-4">
          <PaymentCustomerSection
  cardStyle={styles.card}
  customerOptions={customerOptions}
  selectedCustomerId={selectedCustomerId}
  customerPayerName={customerPayerName}
  setCustomerPayerName={setCustomerPayerName}
  customerPaymentAmount={customerPaymentAmount}
  setCustomerPaymentAmount={setCustomerPaymentAmount}
  customerPaymentMethod={customerPaymentMethod}
  setCustomerPaymentMethod={setCustomerPaymentMethod}
  selectedCustomerStatementIds={selectedCustomerStatementIds}
  selectedCustomerTotalRemaining={selectedCustomerTotalRemaining}
  unpaidCustomerStatements={unpaidCustomerStatements}
  isSubmitting={createCustomerPayment.isPending}
  onSelectCustomer={handleSelectCustomer}
  onSelectAllCustomerStatements={handleSelectAllCustomerStatements}
  onToggleCustomerStatement={handleToggleCustomerStatement}
  onSubmit={handleCustomerPaymentSubmit}
/>

                    <MessagePaymentSection
  cardStyle={styles.card}
  rawMessage={rawMessage}
  parsedPayerName={parsedPayerName}
  setParsedPayerName={setParsedPayerName}
  parsedAmount={parsedAmount}
  setParsedAmount={setParsedAmount}
  matchResults={matchResults}
  selectedMatchId={selectedMatchId}
  setSelectedMatchId={setSelectedMatchId}
  isSubmitting={createPayment.isPending}
  onParseMessage={handleParseMessage}
  onSubmit={handleParsedSubmit}
/>
      </div>

        <section className="border rounded-2xl p-5 bg-white space-y-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
  <h2 className="text-xl font-semibold">거래명세표 목록</h2>
  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
    총 {filteredStatements.length}건
  </span>
</div>
              <p className="text-sm text-gray-500 mt-1">
                행의 선택 버튼을 클릭하면 오른쪽 상세패널에서 입금처리와 입금내역을 확인합니다.
              </p>
            </div>

            
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setStatusFilter("all")} className={`px-3 py-2 rounded-md border ${statusFilter === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-white"}`}>전체 {countByStatus.all}</button>
            <button type="button" onClick={() => setStatusFilter("unpaid")} className={`px-3 py-2 rounded-md border ${statusFilter === "unpaid" ? "bg-blue-600 text-white border-blue-600" : "bg-white"}`}>미입금 {countByStatus.unpaid}</button>
            <button type="button" onClick={() => setStatusFilter("partial")} className={`px-3 py-2 rounded-md border ${statusFilter === "partial" ? "bg-blue-600 text-white border-blue-600" : "bg-white"}`}>부분입금 {countByStatus.partial}</button>
            <button type="button" onClick={() => setStatusFilter("paid")} className={`px-3 py-2 rounded-md border ${statusFilter === "paid" ? "bg-blue-600 text-white border-blue-600" : "bg-white"}`}>입금완료 {countByStatus.paid}</button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setDateFilter("7days")} className={`px-3 py-2 rounded-md border ${dateFilter === "7days" ? "bg-gray-900 text-white border-gray-900" : "bg-white"}`}>최근 7일</button>
            <button type="button" onClick={() => setDateFilter("thisMonth")} className={`px-3 py-2 rounded-md border ${dateFilter === "thisMonth" ? "bg-gray-900 text-white border-gray-900" : "bg-white"}`}>이번 달</button>
            <button type="button" onClick={() => setDateFilter("custom")} className={`px-3 py-2 rounded-md border ${dateFilter === "custom" ? "bg-gray-900 text-white border-gray-900" : "bg-white"}`}>기간선택</button>
            <button type="button" onClick={() => setDateFilter("all")} className={`px-3 py-2 rounded-md border ${dateFilter === "all" ? "bg-gray-900 text-white border-gray-900" : "bg-white"}`}>전체 기간</button>

            {dateFilter === "custom" && (
              <div className="flex flex-wrap items-center gap-2 ml-2">
                <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="border rounded-md px-3 py-2" />
                <span className="text-sm text-gray-500">~</span>
                <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="border rounded-md px-3 py-2" />
              </div>
            )}
          </div>

          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="예: 테스트상사, 134200, 2026-05-11, 입금완료"
            className="w-full border rounded-md px-3 py-2"
          />

          {isLoading ? (
            <div className="text-sm text-gray-500">불러오는 중...</div>
          ) : filteredStatements.length === 0 ? (
            <div className="border rounded-md p-4 text-sm text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full min-w-[900px] text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">작성일</th>
                    <th className="text-left p-3">거래처</th>
                    <th className="text-right p-3">총액</th>
                    <th className="text-right p-3">입금액</th>
                    <th className="text-right p-3">남은금액</th>
                    <th className="text-left p-3">상태</th>
                    <th className="text-center p-3">선택</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStatements.map((statement: any) => {
                    const totalAmount = Number(statement.total_amount || 0);
                    const paidAmount = Number(statement.paid_amount || 0);
                    const remainingAmount = getRemainingAmount(statement);
                    const status = getDisplayPaymentStatus(statement);
                    const isSelected = selectedStatementId === statement.id;
                    const isPaid = status === "paid";

                    return (
                      <tr
                        key={statement.id}
                        className={`border-b cursor-pointer ${isSelected ? "bg-blue-50" : "bg-white hover:bg-gray-50"}`}
                        onClick={() => handleSelectStatement(statement)}
                      >
                        <td className="p-3">{statement.statement_date}</td>
                        <td className="p-3 font-medium">{statement.customer_name_snapshot}</td>
                        <td className="p-3 text-right">{formatCurrency(totalAmount)}</td>
                        <td className="p-3 text-right">{formatCurrency(paidAmount)}</td>
                        <td className="p-3 text-right font-semibold">{formatCurrency(remainingAmount)}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              status === "paid"
                                ? "bg-green-50 text-green-700"
                                : status === "partial"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                            }`}
                          >
                            {getStatusLabel(status)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectStatement(statement);
                            }}
                            className={`px-3 py-1 rounded-md border ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white"
                            }`}
                          >
                            {isSelected ? "선택됨" : isPaid ? "완료건 선택" : "선택"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
                    )}
        </section>
      </div>

                {selectedStatement && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              background: "rgba(15, 23, 42, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
          >
                        <div
              className="border rounded-2xl p-5 space-y-4 bg-white shadow-sm"
              style={{
                width: "720px",
                maxWidth: "calc(100vw - 48px)",
                maxHeight: "calc(100vh - 48px)",
                overflowY: "auto",
              }}
            >
                    <div className="flex items-start justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="text-xl font-semibold">입금 상세</h2>
              <p className="text-sm text-gray-500 mt-1">
                선택한 거래명세표의 입금처리와 입금내역을 확인합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStatementId("")}
              className="px-3 py-2 rounded-md border bg-white"
            >
              닫기
            </button>
          </div>

          
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    getDisplayPaymentStatus(selectedStatement) === "paid"
                      ? "bg-green-50 text-green-700"
                      : getDisplayPaymentStatus(selectedStatement) === "partial"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                  }`}
                >
                  {getStatusLabel(getDisplayPaymentStatus(selectedStatement))}
                </span>
                <span className="text-sm text-gray-500">
                  작성일 {selectedStatement.statement_date}
                </span>
              </div>

              <h3 className="text-2xl font-bold">
                {selectedStatement.customer_name_snapshot}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="border rounded-xl p-3 bg-gray-50">
                  <div className="text-gray-500 font-medium">총액</div>
                  <div className="mt-1 font-bold text-lg">
                    {formatCurrency(Number(selectedStatement.total_amount || 0))}
                  </div>
                </div>

                <div className="border rounded-xl p-3 bg-green-50">
                  <div className="text-gray-500 font-medium">입금액</div>
                  <div className="mt-1 font-bold text-lg text-green-700">
                    {formatCurrency(Number((selectedStatement as any).paid_amount || 0))}
                  </div>
                </div>

                <div className="border rounded-xl p-3 bg-red-50">
                  <div className="text-gray-500 font-medium">미수금</div>
                  <div className="mt-1 font-bold text-lg text-red-700">
                    {formatCurrency(getRemainingAmount(selectedStatement))}
                  </div>
                </div>
              </div>

              <ManualPaymentSection
  selectedStatement={selectedStatement}
  manualPayerName={manualPayerName}
  setManualPayerName={setManualPayerName}
  manualAmount={manualAmount}
  setManualAmount={setManualAmount}
  manualMethod={manualMethod}
  setManualMethod={setManualMethod}
  manualMemo={manualMemo}
  setManualMemo={setManualMemo}
  isSubmitting={createPayment.isPending}
  onSubmit={handleManualSubmit}
/>

              <PaymentHistoryList
  payments={statementPayments.data}
  isDeleting={deletePayment.isPending}
  onCancelPayment={handleCancelPayment}
/>
            </>
          </div>
        </div>
      )}
    </div>
  </>
  );
}