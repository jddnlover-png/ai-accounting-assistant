import type { PdfPrintSettings } from "../../types/pdfSettings";
import StatementPdfRenderer from "./StatementPdfRenderer";

interface PdfPreviewProps {
  selectedStatement: any | null;
  selectedItems: any[];
  pdfPrintSettings: PdfPrintSettings;
  formatCurrency: (amount: number) => string;
  getPaidAmount: (statement: any) => number;
  getRemainingAmount: (statement: any) => number;
  organization?: any;
}

export default function PdfPreview({
  selectedStatement,
  selectedItems,
  pdfPrintSettings,
  formatCurrency,
  getPaidAmount,
  getRemainingAmount,
  organization,
}: PdfPreviewProps) {
  if (!selectedStatement) {
    return (
      <div
        style={{
          height: "100%",
          minHeight: "520px",
          border: "1px dashed #d1d5db",
          borderRadius: "14px",
          background: "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
          color: "#6b7280",
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        거래명세표 목록의 첫 번째 문서가 자동으로 표시됩니다.<br />
문서가 없으면 미리보기를 표시할 수 없습니다.
      </div>
    );
  }

  return (
  <div
    style={{
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "6px",
  overflow: "hidden",
      flex: 1,
      minHeight: 0,
      display: "flex",
      alignItems: "flex-start",
justifyContent: "center",
    }}
  >
    <div
      style={{
        width: "210mm",
        height: "297mm",
        background: "#ffffff",
        transform: "scale(0.58)",
transformOrigin: "top center",
        flexShrink: 0,
      }}
    >
      <StatementPdfRenderer
        selectedStatement={selectedStatement}
        selectedItems={selectedItems}
        pdfPrintSettings={pdfPrintSettings}
        formatCurrency={formatCurrency}
        getPaidAmount={getPaidAmount}
        getRemainingAmount={getRemainingAmount}
        organization={organization}
      />
    </div>
  </div>
);
}