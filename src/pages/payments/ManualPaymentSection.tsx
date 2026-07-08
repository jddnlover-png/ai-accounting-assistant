import { getDisplayPaymentStatus } from "./paymentUtils";

interface ManualPaymentSectionProps {
  selectedStatement: any;
  manualPayerName: string;
  setManualPayerName: (value: string) => void;
  manualAmount: string;
  setManualAmount: (value: string) => void;
  manualMethod: string;
  setManualMethod: (value: string) => void;
  manualMemo: string;
  setManualMemo: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function ManualPaymentSection({
  selectedStatement,
  manualPayerName,
  setManualPayerName,
  manualAmount,
  setManualAmount,
  manualMethod,
  setManualMethod,
  manualMemo,
  setManualMemo,
  isSubmitting,
  onSubmit,
}: ManualPaymentSectionProps) {
  return (
    <div className="border rounded-xl p-4 space-y-3">
      <h3 className="font-semibold">수기 입금처리</h3>

      <div className="grid grid-cols-1 gap-3">
        <input
          value={manualPayerName}
          onChange={(e) => setManualPayerName(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
          placeholder="입금자명"
        />

        <input
          value={manualAmount}
          onChange={(e) =>
            setManualAmount(e.target.value.replace(/[^0-9]/g, ""))
          }
          className="w-full border rounded-md px-3 py-2"
          inputMode="numeric"
          placeholder="입금액"
        />

        <select
          value={manualMethod}
          onChange={(e) => setManualMethod(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        >
          <option value="계좌이체">계좌이체</option>
          <option value="현금">현금</option>
          <option value="카드">카드</option>
          <option value="기타">기타</option>
        </select>
      </div>

      <textarea
        value={manualMemo}
        onChange={(e) => setManualMemo(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
        rows={3}
        placeholder="메모"
      />

      <div className="flex justify-end">
        {getDisplayPaymentStatus(selectedStatement) !== "paid" && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
          >
            입금처리
          </button>
        )}
      </div>
    </div>
  );
}