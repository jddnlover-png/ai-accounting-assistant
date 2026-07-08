import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { PdfPrintSettings } from "../../types/pdfSettings";
import PdfDocumentSection from "./PdfDocumentSection";
import PdfVisibilitySection from "./PdfVisibilitySection";
import PdfColumnWidthSection from "./PdfColumnWidthSection";
import PdfTypographySection from "./PdfTypographySection";
import PdfFooterSection from "./PdfFooterSection";
import PdfPreview from "./PdfPreview";

interface PdfSettingsModalProps {
  isOpen: boolean;
  pdfPrintSettings: PdfPrintSettings;
  setPdfPrintSettings: Dispatch<SetStateAction<PdfPrintSettings>>;
  selectedStatement: any | null;
  selectedItems: any[];
  formatCurrency: (amount: number) => string;
  getPaidAmount: (statement: any) => number;
  getRemainingAmount: (statement: any) => number;
  organization?: any;
  onClose: () => void;
  onReset: () => void;
  onSave: () => void;
}

export default function PdfSettingsModal({
  isOpen,
  pdfPrintSettings,
  setPdfPrintSettings,
  selectedStatement,
  selectedItems,
  formatCurrency,
  getPaidAmount,
  getRemainingAmount,
  organization,
  onClose,
  onReset,
  onSave,
}: PdfSettingsModalProps) {
  const [openSections, setOpenSections] = useState({
    document: true,
    visibility: true,
    column: false,
    design: false,
    footer: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const SectionCard = ({
    title,
    sectionKey,
    children,
  }: {
    title: string;
    sectionKey: keyof typeof openSections;
    children: React.ReactNode;
  }) => (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        style={{
          width: "100%",
          height: "52px",
          padding: "0 16px",
          border: "none",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          fontWeight: 800,
          fontSize: "14px",
        }}
      >
        <span>{title}</span>
        <span>{openSections[sectionKey] ? "▲" : "▼"}</span>
      </button>

      {openSections[sectionKey] && (
        <div style={{ padding: "0 16px 16px" }}>{children}</div>
      )}
    </section>
  );

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20000,
        background: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
  width: "min(96vw, 1280px)",
  height: "92vh",
  overflow: "hidden",
  background: "#ffffff",
  borderRadius: "18px",
  padding: "0",
  boxShadow: "0 28px 70px rgba(15, 23, 42, 0.35)",
  display: "flex",
  flexDirection: "column",
}}
      >
        <div
  style={{
    height: "64px",
    padding: "0 20px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#ffffff",
  }}
>
  <div>
    <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>
      PDF 출력 설정
    </h3>
    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
      설정 변경 내용을 오른쪽 미리보기에서 바로 확인합니다.
    </p>
  </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-sm font-medium"
          >
            닫기
          </button>
        </div>

        <div
  style={{
  display: "grid",
  gridTemplateColumns: "minmax(420px, 0.95fr) minmax(520px, 1.05fr)",
  gap: "16px",
  padding: "16px 20px",
  flex: 1,
  minHeight: 0,
  overflow: "hidden",
  background: "#f8fafc",
}}
>
  <div
  style={{
    display: "grid",
    gap: "10px",
    alignContent: "start",
    overflowY: "auto",
    paddingRight: "6px",
  }}
>
          <SectionCard title="문서" sectionKey="document">
  <PdfDocumentSection
    pdfPrintSettings={pdfPrintSettings}
    setPdfPrintSettings={setPdfPrintSettings}
  />
</SectionCard>

<SectionCard title="📋 표시" sectionKey="visibility">
  <PdfVisibilitySection
    pdfPrintSettings={pdfPrintSettings}
    setPdfPrintSettings={setPdfPrintSettings}
  />
</SectionCard>

<SectionCard title="📐 컬럼" sectionKey="column">
  <PdfColumnWidthSection
  pdfPrintSettings={pdfPrintSettings}
  setPdfPrintSettings={setPdfPrintSettings}
/>
</SectionCard>

<SectionCard title="🎨 디자인" sectionKey="design">
  <PdfTypographySection
    pdfPrintSettings={pdfPrintSettings}
    setPdfPrintSettings={setPdfPrintSettings}
  />
</SectionCard>

<SectionCard title="📝 하단" sectionKey="footer">
  <PdfFooterSection
    pdfPrintSettings={pdfPrintSettings}
    setPdfPrintSettings={setPdfPrintSettings}
  />
</SectionCard>

<div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
  설정을 변경하면 PDF 미리보기에 즉시 반영됩니다. 저장 버튼을 누르면
  현재 문서 유형의 PDF 출력 설정이 저장됩니다.
</div>
</div>

<div
  style={{
  overflow: "hidden",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "12px",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
}}
>
  <h4 style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 800 }}>
    실시간 미리보기
  </h4>
  <PdfPreview
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

        <div
  style={{
    height: "64px",
    padding: "0 20px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#ffffff",
  }}
>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border px-5 py-2 text-sm font-medium"
          >
            기본값 복원
          </button>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-2 text-sm font-medium"
            >
              취소
            </button>

            <button
              type="button"
              onClick={onSave}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
            >
              설정 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}