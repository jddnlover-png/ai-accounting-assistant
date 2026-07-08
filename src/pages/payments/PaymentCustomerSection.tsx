import type { CSSProperties } from "react";
import {
  formatCurrency,
  getDisplayPaymentStatus,
  getRemainingAmount,
  getStatusLabel,
} from "./paymentUtils";

interface PaymentCustomerSectionProps {
  cardStyle: CSSProperties;
  customerOptions: any[];
  selectedCustomerId: string;
  customerPayerName: string;
  setCustomerPayerName: (value: string) => void;
  customerPaymentAmount: string;
  setCustomerPaymentAmount: (value: string) => void;
  customerPaymentMethod: string;
  setCustomerPaymentMethod: (value: string) => void;
  selectedCustomerStatementIds: string[];
  selectedCustomerTotalRemaining: number;
  unpaidCustomerStatements: any;
  isSubmitting: boolean;
  onSelectCustomer: (customerId: string) => void;
  onSelectAllCustomerStatements: () => void;
  onToggleCustomerStatement: (statementId: string) => void;
  onSubmit: () => void;
}

export default function PaymentCustomerSection({
  cardStyle,
  customerOptions,
  selectedCustomerId,
  customerPayerName,
  setCustomerPayerName,
  customerPaymentAmount,
  setCustomerPaymentAmount,
  customerPaymentMethod,
  setCustomerPaymentMethod,
  selectedCustomerStatementIds,
  selectedCustomerTotalRemaining,
  unpaidCustomerStatements,
  isSubmitting,
  onSelectCustomer,
  onSelectAllCustomerStatements,
  onToggleCustomerStatement,
  onSubmit,
}: PaymentCustomerSectionProps) {
  return (
    <div
      style={{
        ...cardStyle,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <h2 className="text-lg font-semibold">거래처 기준 입금처리</h2>

      <p className="text-sm text-gray-500">
        거래처를 선택한 뒤 여러 미수 거래명세표에 입금액을 오래된 순서로 자동 배분합니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">거래처</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => onSelectCustomer(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">거래처 선택</option>
            {customerOptions.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">입금자명</label>
          <input
            value={customerPayerName}
            onChange={(e) => setCustomerPayerName(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            placeholder="입금자명"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">입금액</label>
          <input
            value={customerPaymentAmount}
            onChange={(e) =>
              setCustomerPaymentAmount(e.target.value.replace(/[^0-9]/g, ""))
            }
            className="w-full border rounded-md px-3 py-2"
            inputMode="numeric"
            placeholder="입금액"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">입금방법</label>
          <select
            value={customerPaymentMethod}
            onChange={(e) => setCustomerPaymentMethod(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="계좌이체">계좌이체</option>
            <option value="현금">현금</option>
            <option value="카드">카드</option>
            <option value="기타">기타</option>
          </select>
        </div>
      </div>

      {!selectedCustomerId ? (
        <div className="border rounded-md p-4 text-sm text-gray-500">
          거래처를 선택하면 미입금 거래명세표가 표시됩니다.
        </div>
      ) : unpaidCustomerStatements.isLoading ? (
        <div className="text-sm text-gray-500">
          미수 거래명세표 불러오는 중...
        </div>
      ) : unpaidCustomerStatements.data.length === 0 ? (
        <div className="border rounded-md p-4 text-sm text-gray-500">
          이 거래처의 미입금 거래명세표가 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium text-gray-700">
              선택 미수금{" "}
              <span className="font-bold text-blue-600">
                {formatCurrency(selectedCustomerTotalRemaining)}
              </span>
            </div>

            <button
              type="button"
              onClick={onSelectAllCustomerStatements}
              className="px-3 py-2 rounded-md border bg-white"
            >
              전체 선택 및 총액 입력
            </button>
          </div>

          <div
            className="overflow-x-auto border rounded-md"
            style={{ maxHeight: "130px", overflowY: "auto" }}
          >
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-center p-2">선택</th>
                  <th className="text-left p-2">작성일</th>
                  <th className="text-right p-2">총액</th>
                  <th className="text-right p-2">입금액</th>
                  <th className="text-right p-2">남은금액</th>
                  <th className="text-left p-2">상태</th>
                </tr>
              </thead>

              <tbody>
                {unpaidCustomerStatements.data.map((statement: any) => {
                  const totalAmount = Number(statement.total_amount || 0);
                  const paidAmount = Number(statement.paid_amount || 0);
                  const remainingAmount = getRemainingAmount(statement);
                  const status = getDisplayPaymentStatus(statement);
                  const checked = selectedCustomerStatementIds.includes(
                    statement.id,
                  );

                  return (
                    <tr
                      key={statement.id}
                      className={`border-b ${
                        checked ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleCustomerStatement(statement.id)}
                        />
                      </td>
                      <td className="p-2">{statement.statement_date}</td>
                      <td className="p-2 text-right">
                        {formatCurrency(totalAmount)}
                      </td>
                      <td className="p-2 text-right">
                        {formatCurrency(paidAmount)}
                      </td>
                      <td className="p-2 text-right font-semibold">
                        {formatCurrency(remainingAmount)}
                      </td>
                      <td className="p-2">{getStatusLabel(status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
            >
              거래처 기준 입금처리
            </button>
          </div>
        </div>
      )}
    </div>
  );
}