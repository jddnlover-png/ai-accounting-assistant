import type { Dispatch, SetStateAction } from "react";
import type { PdfDocumentType, PdfPrintSettings } from "../../types/pdfSettings";

interface PdfDocumentSectionProps {
  pdfPrintSettings: PdfPrintSettings;
  setPdfPrintSettings: Dispatch<SetStateAction<PdfPrintSettings>>;
}

const documentTypeOptions: { value: PdfDocumentType; label: string }[] = [
  { value: "statement", label: "거래명세표" },
  { value: "delivery", label: "납품서" },
  { value: "shipment", label: "출고증" },
  { value: "receipt", label: "인수증" },
  { value: "estimate", label: "견적서" },
  { value: "purchaseOrder", label: "발주서" },
  { value: "custom", label: "직접 입력" },
];

export default function PdfDocumentSection({
  pdfPrintSettings,
  setPdfPrintSettings,
}: PdfDocumentSectionProps) {
  const documentType = pdfPrintSettings.document.type;

  return (
    <div className="rounded-xl border p-4">
      <h4 className="mb-3 text-sm font-bold">문서</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">문서 유형</label>
          <select
            value={documentType}
            onChange={(event) =>
              setPdfPrintSettings((prev) => ({
                ...prev,
                document: {
                  ...prev.document,
                  type: event.target.value as PdfDocumentType,
                },
              }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            {documentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {documentType === "custom" && (
          <div>
            <label className="mb-1 block text-sm font-medium">문서 제목</label>
            <input
              value={pdfPrintSettings.document.customTitle}
              onChange={(event) =>
                setPdfPrintSettings((prev) => ({
                  ...prev,
                  document: {
                    ...prev.document,
                    customTitle: event.target.value,
                  },
                }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="예: 현장 납품 확인서"
            />
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500">
  문서 유형과 제목을 설정합니다. 변경 내용은 PDF 미리보기에 즉시 반영됩니다.
</p>
    </div>
  );
}