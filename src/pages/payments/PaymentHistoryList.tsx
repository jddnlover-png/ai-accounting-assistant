import { formatCurrency } from "./paymentUtils";

interface PaymentHistoryListProps {
  payments: any[];
  isDeleting: boolean;
  onCancelPayment: (payment: any) => void;
}

export default function PaymentHistoryList({
  payments,
  isDeleting,
  onCancelPayment,
}: PaymentHistoryListProps) {
  return (
    <div className="border rounded-xl p-4 space-y-3">
      <h3 className="font-semibold">입금내역</h3>

      {payments.length === 0 ? (
        <div className="border rounded-md p-4 text-sm text-gray-500">
          아직 등록된 입금내역이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((payment: any) => {
            const amount = Number(
              payment.display_amount ||
                payment.payment_amount ||
                payment.allocated_amount ||
                0,
            );

            return (
              <div
                key={payment.id}
                className="border rounded-md p-3 text-sm space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString()
                        : "-"}{" "}
                      / {payment.payment_method || "-"} /{" "}
                      {formatCurrency(amount)}
                    </div>

                    <div className="text-gray-500 mt-1">
                      입금자: {payment.payer_name || "-"} / 방식:{" "}
                      {payment.source_table === "payment_allocations"
                        ? "거래처 기준 자동배분"
                        : payment.payment_input_type === "parsed_text"
                          ? "문자/카톡"
                          : "수기"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onCancelPayment(payment)}
                    disabled={isDeleting}
                    className="px-3 py-1 rounded-md border border-red-500 text-red-600 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>

                {payment.source_table === "payment_allocations" && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                    <div className="font-semibold">묶음 입금건입니다.</div>

                    <div className="mt-1">
                      입금건 전체금액:{" "}
                      {formatCurrency(payment.group_payment_total_amount)}
                      {" / "}
                      배분건수: {payment.group_allocation_count}건
                      {" / "}
                      배분합계:{" "}
                      {formatCurrency(payment.group_total_allocated_amount)}
                    </div>

                    {payment.group_allocations?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {payment.group_allocations.map((allocation: any) => (
                          <div key={allocation.id}>
                            - {allocation.sales_statements?.statement_date || "-"} /{" "}
                            {allocation.sales_statements?.customer_name_snapshot ||
                              "-"}{" "}
                            /{" "}
                            {formatCurrency(
                              Number(allocation.allocated_amount || 0),
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 font-medium">
                      이 입금내역을 삭제하면 위 배분내역이 함께 취소됩니다.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}