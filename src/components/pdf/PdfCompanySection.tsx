import type { Dispatch, SetStateAction } from "react";
import type { PdfPrintSettings } from "../../types/pdfSettings";

interface Props {
  pdfPrintSettings: PdfPrintSettings;
  setPdfPrintSettings: Dispatch<SetStateAction<PdfPrintSettings>>;
}

export default function PdfCompanySection({
  pdfPrintSettings,
  setPdfPrintSettings,
}: Props) {
  return (
    <div className="space-y-4">

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pdfPrintSettings.footer.showLogo}
            onChange={(e) =>
              setPdfPrintSettings((prev) => ({
                ...prev,
                footer: {
                  ...prev.footer,
                  showLogo: e.target.checked,
                },
              }))
            }
          />
          회사 로고 표시
        </label>
      </div>

      <div>
        <label className="block mb-1 font-medium">
          하단 메모
        </label>

        <textarea
          rows={3}
          className="w-full rounded border p-2"
          value={pdfPrintSettings.footer.memoText}
          onChange={(e) =>
            setPdfPrintSettings((prev) => ({
              ...prev,
              footer: {
                ...prev.footer,
                memoText: e.target.value,
              },
            }))
          }
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pdfPrintSettings.stamp.showStamp}
            onChange={(e) =>
              setPdfPrintSettings((prev) => ({
                ...prev,
                stamp: {
                  ...prev.stamp,
                  showStamp: e.target.checked,
                },
              }))
            }
          />
          성명(인) 도장 표시
        </label>
      </div>

    </div>
  );
}