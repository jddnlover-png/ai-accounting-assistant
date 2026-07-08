import type { Dispatch, SetStateAction } from "react";
import type { PdfPrintSettings } from "../../types/pdfSettings";

interface PdfVisibilitySectionProps {
  pdfPrintSettings: PdfPrintSettings;
  setPdfPrintSettings: Dispatch<SetStateAction<PdfPrintSettings>>;
}

export default function PdfVisibilitySection({
  pdfPrintSettings,
  setPdfPrintSettings,
}: PdfVisibilitySectionProps) {
  const visibilityOptions: [keyof PdfPrintSettings["visibility"], string][] = [
    ["specification", "규격"],
    ["unit", "단위"],
    ["unitPrice", "단가"],
    ["supplyAmount", "공급가액"],
    ["taxAmount", "세액"],
    ["previousBalance", "전미수잔액"],
    ["paidAmount", "입금액"],
    ["remainingAmount", "총미수잔액"],
    ["receiver", "인수자"],
    ["businessType", "업태"],
    ["businessItem", "종목"],
    ["fax", "팩스번호"],
  ];

  return (
    <>
      <h4 className="mb-3 text-sm font-bold">표시 항목</h4>

      <div className="grid grid-cols-3 gap-3 text-sm">
        {visibilityOptions.map(([key, label]) => (
          <label
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 700,
            }}
          >
            <input
              type="checkbox"
              checked={Boolean(pdfPrintSettings.visibility[key])}
              onChange={(event) =>
                setPdfPrintSettings((prev) => ({
                  ...prev,
                  visibility: {
                    ...prev.visibility,
                    [key]: event.target.checked,
                  },
                }))
              }
            />
            {label}
          </label>
        ))}
      </div>
    </>
  );
}