import type { CSSProperties } from "react";
import type { MatchCandidate } from "./paymentTypes";
import { formatCurrency } from "./paymentUtils";

interface MessagePaymentSectionProps {
  cardStyle: CSSProperties;
  rawMessage: string;
  parsedPayerName: string;
  setParsedPayerName: (value: string) => void;
  parsedAmount: number;
  setParsedAmount: (value: number) => void;
  matchResults: MatchCandidate[];
  selectedMatchId: string;
  setSelectedMatchId: (value: string) => void;
  isSubmitting: boolean;
  onParseMessage: (value: string) => void;
  onSubmit: () => void;
}

export default function MessagePaymentSection({
  cardStyle,
  rawMessage,
  parsedPayerName,
  setParsedPayerName,
  parsedAmount,
  setParsedAmount,
  matchResults,
  selectedMatchId,
  setSelectedMatchId,
  isSubmitting,
  onParseMessage,
  onSubmit,
}: MessagePaymentSectionProps) {
  return (
    <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "8px" }}>
      <div>
        <h2 className="text-lg font-semibold">문자/카톡 자동매칭</h2>
        <p className="text-sm text-gray-500 mt-1">
          은행 문자 또는 카톡 입금내역을 붙여넣으면 입금자명과 금액을 추출해 매칭합니다.
        </p>
      </div>

      <textarea
        value={rawMessage}
        onChange={(e) => onParseMessage(e.target.value)}
        onPaste={(e) => {
          const pastedText = e.clipboardData.getData("text");
          setTimeout(() => onParseMessage(pastedText), 0);
        }}
        placeholder="은행 문자 또는 카톡 입금내역을 붙여넣으세요."
        className="w-full border rounded-md px-3 py-2"
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={parsedPayerName}
          onChange={(e) => setParsedPayerName(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
          placeholder="파싱된 입금자명"
        />

        <input
          value={parsedAmount ? String(parsedAmount) : ""}
          onChange={(e) =>
            setParsedAmount(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)
          }
          className="w-full border rounded-md px-3 py-2"
          inputMode="numeric"
          placeholder="파싱된 입금액"
        />
      </div>

      <div>
        <h3 className="font-semibold mb-2">매칭 후보</h3>

        {matchResults.length === 0 ? (
          <div className="border rounded-md p-4 text-sm text-gray-500">
            아직 매칭 후보가 없습니다. 문자/카톡 입금내역을 붙여넣어주세요.
          </div>
        ) : (
          <div className="space-y-2" style={{ maxHeight: "180px", overflowY: "auto" }}>
            {matchResults.map((result) => (
              <label
                key={result.id}
                className="flex items-center justify-between border rounded-md p-3 cursor-pointer hover:bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="match"
                    checked={selectedMatchId === result.id}
                    onChange={() => setSelectedMatchId(result.id)}
                  />

                  {result.type === "customer_group" ? (
                    <div>
                      <div className="font-medium">
                        {result.customerName} 합산 매칭
                      </div>
                      <div className="text-sm text-gray-500">
                        미수 {result.statementCount}건 / 합계{" "}
                        {formatCurrency(result.totalRemainingAmount)}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium">{result.target.customerName}</div>
                      <div className="text-sm text-gray-500">
                        작성일 {result.target.statementDate} / 남은금액{" "}
                        {formatCurrency(result.target.remainingAmount)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-sm text-right">
                  <div>
                    {result.matchStatus === "strong" ? "강한 매칭" : "금액 매칭"}
                  </div>
                  <div className="text-gray-500">
                    이름 {result.isNameMatched ? "일치" : "불일치"} / 금액{" "}
                    {result.isAmountMatched ? "일치" : "불일치"}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50"
        >
          선택한 건 입금처리
        </button>
      </div>
    </div>
  );
}