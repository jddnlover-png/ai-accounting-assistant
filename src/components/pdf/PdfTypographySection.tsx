import type { Dispatch, SetStateAction } from "react";
import type { PdfPrintSettings } from "../../types/pdfSettings";

interface PdfTypographySectionProps {
  pdfPrintSettings: PdfPrintSettings;
  setPdfPrintSettings: Dispatch<SetStateAction<PdfPrintSettings>>;
}

export default function PdfTypographySection({
  pdfPrintSettings,
  setPdfPrintSettings,
}: PdfTypographySectionProps) {
  return (
    <>
      <h4 className="mb-3 text-sm font-bold">글자 / 선 / 색상</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            본문 글자 크기
          </label>
          <select
            value={pdfPrintSettings.typography.bodyFontSize}
            onChange={(event) =>
              setPdfPrintSettings((prev) => ({
                ...prev,
                typography: {
                  ...prev.typography,
                  bodyFontSize:
                    event.target
                      .value as PdfPrintSettings["typography"]["bodyFontSize"],
                },
              }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="small">작게</option>
            <option value="normal">보통</option>
            <option value="large">크게</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            제목 글자 크기
          </label>
          <select
            value={pdfPrintSettings.typography.titleFontSize}
            onChange={(event) =>
              setPdfPrintSettings((prev) => ({
                ...prev,
                typography: {
                  ...prev.typography,
                  titleFontSize:
                    event.target
                      .value as PdfPrintSettings["typography"]["titleFontSize"],
                },
              }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="normal">보통</option>
            <option value="large">크게</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">선 스타일</label>
          <select
            value={pdfPrintSettings.border.lineWeight}
            onChange={(event) =>
              setPdfPrintSettings((prev) => ({
                ...prev,
                border: {
                  ...prev.border,
                  lineWeight:
                    event.target
                      .value as PdfPrintSettings["border"]["lineWeight"],
                },
              }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="thin">연하게</option>
<option value="normal">보통</option>
<option value="bold">굵게</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">색상</label>
          <select
            value={pdfPrintSettings.theme.color}
            onChange={(event) =>
              setPdfPrintSettings((prev) => ({
                ...prev,
                theme: {
                  ...prev.theme,
                  color: event.target.value as PdfPrintSettings["theme"]["color"],
                },
              }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="black">검정</option>
            <option value="blue">파랑</option>
            <option value="red">빨강</option>
          </select>
        </div>
      </div>
    </>
  );
}