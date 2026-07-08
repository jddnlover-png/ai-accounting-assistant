import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type PaymentStatus = "unpaid" | "partial" | "paid";

export interface CreateStatementPaymentPayload {
  sales_statement_id: string;
  customer_id?: string | null;
  payment_input_type?: "manual" | "parsed_text";
  payment_amount: number;
  payment_method?: string | null;
  payer_name?: string | null;
  raw_message?: string | null;
  parsed_payer_name?: string | null;
  parsed_amount?: number | null;
  memo?: string | null;
}

export interface CreateCustomerPaymentPayload {
  customer_id: string;
  sales_statement_ids: string[];
  payment_amount: number;
  payment_method?: string | null;
  payer_name?: string | null;
  raw_message?: string | null;
  parsed_payer_name?: string | null;
  parsed_amount?: number | null;
  memo?: string | null;
}

export function calculatePaymentStatus(
  totalAmount: number,
  paidAmount: number,
): PaymentStatus {
  if (paidAmount <= 0) return "unpaid";
  if (paidAmount >= totalAmount) return "paid";
  return "partial";
}

function getStatementDateValue(statement: any) {
  return (
    statement.statement_date ||
    statement.issue_date ||
    statement.date ||
    statement.created_at ||
    ""
  );
}

function getStatementRemainingAmount(statement: any) {
  const totalAmount = Number(statement.total_amount || 0);
  const paidAmount = Number(statement.paid_amount || 0);
  const remainingAmount = statement.remaining_amount;

  if (remainingAmount !== null && remainingAmount !== undefined) {
    return Math.max(Number(remainingAmount || 0), 0);
  }

  return Math.max(totalAmount - paidAmount, 0);
}

async function recalculateStatementPaymentStatus(salesStatementId: string) {
  const { data: statement, error: statementError } = await supabase
    .from("sales_statements")
    .select("*")
    .eq("id", salesStatementId)
    .single();

  if (statementError || !statement) {
    throw statementError || new Error("거래명세표를 찾을 수 없습니다.");
  }

  const { data: oldPayments, error: oldPaymentsError } = await supabase
    .from("statement_payments")
    .select("payment_amount")
    .eq("sales_statement_id", salesStatementId);

  if (oldPaymentsError) {
    throw oldPaymentsError;
  }

  const { data: allocations, error: allocationsError } = await supabase
    .from("payment_allocations")
    .select("allocated_amount")
    .eq("sales_statement_id", salesStatementId);

  if (allocationsError) {
    throw allocationsError;
  }

  const statementData = statement as any;
  const totalAmount = Number(statementData.total_amount || 0);

  const oldPaidAmount = (oldPayments || []).reduce((sum, payment: any) => {
    return sum + Number(payment.payment_amount || 0);
  }, 0);

  const allocatedPaidAmount = (allocations || []).reduce((sum, allocation: any) => {
    return sum + Number(allocation.allocated_amount || 0);
  }, 0);

  const paidAmount = oldPaidAmount + allocatedPaidAmount;
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);
  const paymentStatus = calculatePaymentStatus(totalAmount, paidAmount);

  const { error: updateError } = await supabase
    .from("sales_statements")
    .update({
      paid_amount: paidAmount,
      remaining_amount: remainingAmount,
      payment_status: paymentStatus,
      paid_at: paymentStatus === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", salesStatementId);

  if (updateError) {
    throw updateError;
  }

  return {
    paidAmount,
    remainingAmount,
    paymentStatus,
  };
}

export function useCreateStatementPayment() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async (payload: CreateStatementPaymentPayload) => {
    setIsPending(true);

    try {
      const {
        sales_statement_id,
        customer_id,
        payment_input_type = "manual",
        payment_amount,
        payment_method,
        payer_name,
        raw_message,
        parsed_payer_name,
        parsed_amount,
        memo,
      } = payload;

      const { data: statement, error: statementError } = await supabase
        .from("sales_statements")
        .select("*")
        .eq("id", sales_statement_id)
        .single();

      if (statementError || !statement) {
        throw statementError || new Error("거래명세표를 찾을 수 없습니다.");
      }

      const statementData = statement as any;

      const { error: paymentInsertError } = await supabase
        .from("statement_payments")
        .insert({
          organization_id: statementData.organization_id,
          sales_statement_id,
          customer_id: customer_id || statementData.customer_id,
          payment_input_type,
          payment_amount,
          payment_method,
          payer_name,
          raw_message,
          parsed_payer_name,
          parsed_amount,
          memo,
          payment_date: new Date().toISOString(),
        });

      if (paymentInsertError) {
        throw paymentInsertError;
      }

      await recalculateStatementPaymentStatus(sales_statement_id);

      return true;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    mutateAsync,
    isPending,
  };
}

export function useCreateCustomerPayment() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async (payload: CreateCustomerPaymentPayload) => {
    setIsPending(true);

    try {
      const {
        customer_id,
        sales_statement_ids,
        payment_amount,
        payment_method,
        payer_name,
        raw_message,
        parsed_payer_name,
        parsed_amount,
        memo,
      } = payload;

      if (!customer_id) {
        throw new Error("거래처를 선택해주세요.");
      }

      if (!sales_statement_ids.length) {
        throw new Error("입금 처리할 거래명세표를 선택해주세요.");
      }

      if (payment_amount <= 0) {
        throw new Error("입금액은 0보다 커야 합니다.");
      }

      const { data: statements, error: statementsError } = await supabase
        .from("sales_statements")
        .select("*")
        .in("id", sales_statement_ids);

      if (statementsError) {
        throw statementsError;
      }

      if (!statements || statements.length === 0) {
        throw new Error("입금 처리할 거래명세표를 찾을 수 없습니다.");
      }

      const sortedStatements = [...statements]
        .filter((statement: any) => statement.customer_id === customer_id)
        .sort((a: any, b: any) => {
          const dateCompare = String(getStatementDateValue(a)).localeCompare(
            String(getStatementDateValue(b)),
          );

          if (dateCompare !== 0) return dateCompare;

          return String(a.created_at || "").localeCompare(String(b.created_at || ""));
        });

      if (!sortedStatements.length) {
        throw new Error("선택한 거래처의 거래명세표가 없습니다.");
      }

      const organizationId = (sortedStatements[0] as any).organization_id;
      const statementIds = sortedStatements.map((statement: any) => statement.id);

      const { data: legacyPayments, error: legacyPaymentsError } = await supabase
        .from("statement_payments")
        .select("sales_statement_id, payment_amount")
        .in("sales_statement_id", statementIds);

      if (legacyPaymentsError) {
        throw legacyPaymentsError;
      }

      const { data: existingAllocations, error: existingAllocationsError } =
        await supabase
          .from("payment_allocations")
          .select("sales_statement_id, allocated_amount")
          .in("sales_statement_id", statementIds);

      if (existingAllocationsError) {
        throw existingAllocationsError;
      }

      const paidAmountByStatementId = new Map<string, number>();

      (legacyPayments || []).forEach((payment: any) => {
        const statementId = payment.sales_statement_id;
        const currentAmount = paidAmountByStatementId.get(statementId) || 0;

        paidAmountByStatementId.set(
          statementId,
          currentAmount + Number(payment.payment_amount || 0),
        );
      });

      (existingAllocations || []).forEach((allocation: any) => {
        const statementId = allocation.sales_statement_id;
        const currentAmount = paidAmountByStatementId.get(statementId) || 0;

        paidAmountByStatementId.set(
          statementId,
          currentAmount + Number(allocation.allocated_amount || 0),
        );
      });

      let remainingPaymentAmount = payment_amount;

      const allocationPreviewRows: any[] = [];

      for (const statement of sortedStatements as any[]) {
        if (remainingPaymentAmount <= 0) break;

        const totalAmount = Number(statement.total_amount || 0);
        const alreadyPaidAmount = paidAmountByStatementId.get(statement.id) || 0;
        const statementRemainingAmount = Math.max(
          totalAmount - alreadyPaidAmount,
          0,
        );

        if (statementRemainingAmount <= 0) continue;

        const allocatedAmount = Math.min(
          statementRemainingAmount,
          remainingPaymentAmount,
        );

        allocationPreviewRows.push({
          organization_id: organizationId,
          sales_statement_id: statement.id,
          allocated_amount: allocatedAmount,
        });

        remainingPaymentAmount -= allocatedAmount;
      }

      if (!allocationPreviewRows.length) {
        throw new Error("배분할 미수금이 없습니다.");
      }

      const { data: payment, error: paymentInsertError } = await supabase
        .from("payments")
        .insert({
          organization_id: organizationId,
          customer_id,
          payment_date: new Date().toISOString(),
          payment_amount,
          payment_method: payment_method || "transfer",
          payer_name,
          raw_message,
          parsed_payer_name,
          parsed_amount,
          memo,
        })
        .select("*")
        .single();

      if (paymentInsertError || !payment) {
        throw paymentInsertError || new Error("입금 저장에 실패했습니다.");
      }

      const allocationRows = allocationPreviewRows.map((allocation) => ({
        ...allocation,
        payment_id: payment.id,
      }));

      const { error: allocationInsertError } = await supabase
        .from("payment_allocations")
        .insert(allocationRows);

      if (allocationInsertError) {
        await supabase.from("payments").delete().eq("id", payment.id);
        throw allocationInsertError;
      }

      for (const allocation of allocationRows) {
        await recalculateStatementPaymentStatus(allocation.sales_statement_id);
      }

      return {
        payment,
        allocations: allocationRows,
        unallocatedAmount: remainingPaymentAmount,
      };
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    mutateAsync,
    isPending,
  };
}

export function useUnpaidCustomerStatements(customerId?: string | null) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!customerId) {
      setData([]);
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from("sales_statements")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("거래처 미수 거래명세표 조회 오류:", error);
      setData([]);
    } else {
      const unpaidStatements = (data || []).filter((statement: any) => {
        const remainingAmount = getStatementRemainingAmount(statement);
        const paymentStatus = statement.payment_status || "unpaid";

        return remainingAmount > 0 || paymentStatus !== "paid";
      });

      setData(unpaidStatements);
    }

    setIsLoading(false);
  }, [customerId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    isLoading,
    refetch,
  };
}

export function useStatementPayments(salesStatementId?: string | null) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!salesStatementId) {
      setData([]);
      return;
    }

    setIsLoading(true);

    const { data: oldPayments, error: oldPaymentsError } = await supabase
      .from("statement_payments")
      .select("*")
      .eq("sales_statement_id", salesStatementId)
      .order("payment_date", { ascending: false });

    const { data: allocations, error: allocationsError } = await supabase
      .from("payment_allocations")
      .select("*, payments(*)")
      .eq("sales_statement_id", salesStatementId)
      .order("created_at", { ascending: false });

    if (oldPaymentsError || allocationsError) {
      console.error("입금내역 조회 오류:", oldPaymentsError || allocationsError);
      setData([]);
    } else {
      const legacyRows = (oldPayments || []).map((payment: any) => ({
        ...payment,
        source_table: "statement_payments",
        display_amount: Number(payment.payment_amount || 0),
      }));

      const allocationPaymentIds = Array.from(
  new Set((allocations || []).map((allocation: any) => allocation.payment_id)),
);

let groupedAllocations: any[] = [];

if (allocationPaymentIds.length > 0) {
  const { data: allAllocations, error: allAllocationsError } = await supabase
    .from("payment_allocations")
    .select("*, sales_statements(*)")
    .in("payment_id", allocationPaymentIds);

  if (allAllocationsError) {
    console.error("묶음 입금 배분내역 조회 오류:", allAllocationsError);
  } else {
    groupedAllocations = allAllocations || [];
  }
}

const allocationRows = (allocations || []).map((allocation: any) => {
  const samePaymentAllocations = groupedAllocations.filter(
    (item: any) => item.payment_id === allocation.payment_id,
  );

  const groupTotalAllocatedAmount = samePaymentAllocations.reduce(
    (sum: number, item: any) => sum + Number(item.allocated_amount || 0),
    0,
  );

  return {
    ...allocation,
    source_table: "payment_allocations",
    display_amount: Number(allocation.allocated_amount || 0),
    payment_date: allocation.payments?.payment_date,
    payment_method: allocation.payments?.payment_method,
    payer_name: allocation.payments?.payer_name,
    memo: allocation.payments?.memo,
    group_allocations: samePaymentAllocations,
    group_allocation_count: samePaymentAllocations.length,
    group_total_allocated_amount: groupTotalAllocatedAmount,
    group_payment_total_amount: Number(allocation.payments?.payment_amount || 0),
  };
});

      setData([...legacyRows, ...allocationRows]);
    }

    setIsLoading(false);
  }, [salesStatementId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    isLoading,
    refetch,
  };
}

export function useDeleteStatementPayment() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(
    async ({
      paymentId,
      salesStatementId,
      sourceTable = "statement_payments",
      paymentOriginalId,
    }: {
      paymentId: string;
      salesStatementId: string;
      sourceTable?: "statement_payments" | "payment_allocations";
      paymentOriginalId?: string;
    }) => {
      setIsPending(true);

      try {
        if (sourceTable === "payment_allocations") {
          const targetPaymentId = paymentOriginalId || paymentId;

          const { data: relatedAllocations, error: relatedAllocationsError } =
            await supabase
              .from("payment_allocations")
              .select("sales_statement_id")
              .eq("payment_id", targetPaymentId);

          if (relatedAllocationsError) {
            throw relatedAllocationsError;
          }

          const affectedStatementIds = Array.from(
            new Set(
              (relatedAllocations || []).map(
                (allocation: any) => allocation.sales_statement_id,
              ),
            ),
          );

          const { error: deleteError } = await supabase
            .from("payments")
            .delete()
            .eq("id", targetPaymentId);

          if (deleteError) {
            throw deleteError;
          }

          for (const affectedStatementId of affectedStatementIds) {
            await recalculateStatementPaymentStatus(affectedStatementId);
          }

          return true;
        }

        const { error: deleteError } = await supabase
          .from("statement_payments")
          .delete()
          .eq("id", paymentId);

        if (deleteError) {
          throw deleteError;
        }

        await recalculateStatementPaymentStatus(salesStatementId);

        return true;
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return {
    mutateAsync,
    isPending,
  };
}