import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { PdfPrintSettings } from "../../types/pdfSettings";

interface PdfFooterSectionProps {
  pdfPrintSettings: PdfPrintSettings;
  setPdfPrintSettings: Dispatch<SetStateAction<PdfPrintSettings>>;
}

export default function PdfFooterSection({
  pdfPrintSettings,
  setPdfPrintSettings,
}: PdfFooterSectionProps) {
  const [localMemoText, setLocalMemoText] = useState(
    pdfPrintSettings.footer.memoText ?? ""
  );

  useEffect(() => {
    setLocalMemoText(pdfPrintSettings.footer.memoText ?? "");
  }, []);

  const updateMemoText = (value: string) => {
    setPdfPrintSettings((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        memoText: value,
      },
    }));
  };

  return (
    <div className="rounded-xl border p-4">
      <h4 className="mb-3 text-sm font-bold">하단 메모</h4>

      <textarea
        value={localMemoText}
        onChange={(event) => {
          setLocalMemoText(event.target.value);
        }}
        onBlur={() => {
          updateMemoText(localMemoText);
        }}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        rows={4}
        placeholder={`예: 항상 이용해 주셔서 감사합니다.\n입금계좌: 농협 000-0000-0000 예금주 테스트회사`}
      />

      <p className="mt-2 text-xs text-gray-500">
        입력한 내용은 PDF 하단 로고 영역 옆에 표시됩니다.
      </p>
    </div>
  );
}