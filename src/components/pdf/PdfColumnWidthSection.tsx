import type { Dispatch, SetStateAction } from "react";
import type { PdfPrintSettings } from "../../types/pdfSettings";

interface PdfColumnWidthSectionProps {
  pdfPrintSettings: PdfPrintSettings;
  setPdfPrintSettings: Dispatch<SetStateAction<PdfPrintSettings>>;
}

export default function PdfColumnWidthSection({
  pdfPrintSettings,
  setPdfPrintSettings,
}: PdfColumnWidthSectionProps) {
  const columnWidthOptions: [keyof PdfPrintSettings["columnWidth"], string][] = [
    ["date", "월일"],
    ["product", "품목"],
    ["specification", "규격"],
    ["unit", "단위"],
    ["quantity", "수량"],
    ["unitPrice", "단가"],
    ["supplyAmount", "공급가액"],
    ["taxAmount", "세액"],
    ["memo", "비고"],
  ];

  return (
  <div>
    <p className="mb-3 text-xs text-gray-500">
      품목, 규격, 단위, 비고 등의 PDF 표 폭을 조정합니다.
    </p>

    <div className="grid grid-cols-3 gap-3 text-sm">
      {columnWidthOptions.map(([key, label]) => (
        <div key={key}>
          <label className="mb-1 block text-sm font-medium">{label}</label>
          <input
            type="number"
            min={1}
            max={60}
            value={pdfPrintSettings.columnWidth[key]}
            onChange={(event) =>
              setPdfPrintSettings((prev) => ({
                ...prev,
                columnWidth: {
                  ...prev.columnWidth,
                  [key]: Number(event.target.value || 1),
                },
              }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      ))}
    </div>

    <p className="mt-2 text-xs text-gray-500">
      컬럼 폭을 변경하면 PDF 미리보기에 즉시 반영됩니다.
    </p>
  </div>
);
}