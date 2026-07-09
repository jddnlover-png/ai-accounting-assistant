import { useState } from "react";

const basicReports = [
  {
    title: "미수금원장",
    description: "거래처별 매출, 입금액, 미수잔액을 확인합니다.",
    type: "receivable",
  },
  {
    title: "거래처원장",
    description: "거래처별 거래 발생과 입금 흐름을 확인합니다.",
    type: "customer-ledger",
  },
  {
    title: "매출 보고서",
    description: "기간별 매출 거래와 합계 금액을 확인합니다.",
    type: "sales-report",
  },
  {
    title: "입금 보고서",
    description: "기간별 입금 내역과 거래처별 입금 흐름을 확인합니다.",
    type: "payment-report",
  },
];

const premiumReports = [
  {
    title: "품목 판매 분석",
    description: "품목별 판매수량, 판매금액, 판매 순위를 분석합니다.",
    type: "product-sales-analysis",
  },
  {
    title: "재고 현황",
    description: "현재고, 안전재고, 부족수량을 확인합니다.",
    type: "inventory-status",
  },
  {
    title: "입출고 원장",
    description: "품목별 입고, 출고, 조정 이력을 확인합니다.",
    type: "stock-movement-ledger",
  },
  {
    title: "재고 평가 보고서",
    description: "재고수량과 단가를 기준으로 재고금액을 확인합니다.",
    type: "inventory-valuation",
  },
];

const reportColumns = [
  "거래처명",
  "거래일",
  "총매출",
  "입금액",
  "미수잔액",
  "최근 거래일",
];

export default function Reports() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("receivable");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "거래처명",
    "총매출",
    "입금액",
    "미수잔액",
  ]);

  const toggleColumn = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((item) => item !== column)
        : [...prev, column]
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>보고서 관리</h1>
          <p style={styles.description}>
            회사별 실무에 맞는 보고서를 직접 만들고 저장해서 사용할 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          style={styles.primaryButton}
          onClick={() => setIsBuilderOpen(true)}
        >
          + 새 보고서 만들기
        </button>
      </div>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>기본 보고서</h2>
            <p style={styles.sectionDescription}>
              거래, 입금, 미수금 확인에 필요한 기본 원장/보고서입니다.
            </p>
          </div>
        </div>

        <div style={styles.reportGrid}>
          {basicReports.map((report) => (
            <button key={report.type} type="button" style={styles.reportCard}>
              <div style={styles.reportTitle}>{report.title}</div>
              <div style={styles.reportDescription}>{report.description}</div>
              <div style={styles.reportAction}>보고서 열기 →</div>
            </button>
          ))}
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>내 보고서</h2>
            <p style={styles.sectionDescription}>
              직접 만든 맞춤 보고서가 여기에 표시됩니다.
            </p>
          </div>
        </div>

        <div style={styles.emptyBox}>
          <div style={styles.emptyTitle}>아직 저장된 보고서가 없습니다</div>
          <p style={styles.emptyText}>
            새 보고서를 만들어 우리 회사에 맞는 원장과 보고서를 저장해보세요.
          </p>
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>프리미엄 보고서</h2>
            <p style={styles.sectionDescription}>
              품목 분석과 재고관리가 필요한 회사에서 사용할 수 있는 유료 확장 보고서입니다.
            </p>
          </div>

          <span style={styles.premiumBadge}>유료 확장 예정</span>
        </div>

        <div style={styles.reportGrid}>
          {premiumReports.map((report) => (
            <button
              key={report.type}
              type="button"
              style={{
                ...styles.reportCard,
                ...styles.lockedReportCard,
              }}
            >
              <div style={styles.lockRow}>
                <div style={styles.reportTitle}>{report.title}</div>
                <span style={styles.lockBadge}>🔒</span>
              </div>

              <div style={styles.reportDescription}>{report.description}</div>
              <div style={styles.lockedAction}>재고관리 상품에서 사용 가능</div>
            </button>
          ))}
        </div>
      </section>

      {isBuilderOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>새 보고서 만들기</h2>
                <p style={styles.sectionDescription}>
                  보고서 유형, 표시 컬럼, 미리보기 구성을 설정합니다.
                </p>
              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={() => setIsBuilderOpen(false)}
              >
                닫기
              </button>
            </div>

            <div style={styles.builderGrid}>
              <div style={styles.builderLeft}>
                <div style={styles.settingBlock}>
                  <h3 style={styles.settingTitle}>1. 보고서 기본 정보</h3>

                  <label style={styles.label}>보고서 이름</label>
                  <input
                    value={reportName}
                    onChange={(event) => setReportName(event.target.value)}
                    style={styles.input}
                    placeholder="예: 월말 대표 보고용 미수금원장"
                  />
                </div>

                <div style={styles.settingBlock}>
                  <h3 style={styles.settingTitle}>2. 기본 템플릿 선택</h3>

                  <div style={styles.templateList}>
                    {basicReports.map((report) => (
                      <button
                        key={report.type}
                        type="button"
                        onClick={() => setSelectedTemplate(report.type)}
                        style={{
                          ...styles.templateButton,
                          ...(selectedTemplate === report.type
                            ? styles.templateButtonActive
                            : {}),
                        }}
                      >
                        {report.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.settingBlock}>
                  <h3 style={styles.settingTitle}>3. 표시 컬럼 선택</h3>

                  <div style={styles.columnGrid}>
                    {reportColumns.map((column) => (
                      <label key={column} style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(column)}
                          onChange={() => toggleColumn(column)}
                        />
                        {column}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={styles.previewBox}>
                <div style={styles.previewHeader}>
                  <div>
                    <h3 style={styles.previewTitle}>
                      {reportName || "새 맞춤 보고서"}
                    </h3>
                    <p style={styles.previewDescription}>
                      선택한 컬럼 기준 미리보기입니다.
                    </p>
                  </div>
                </div>

                <div style={styles.previewTableWrap}>
                  <table style={styles.previewTable}>
                    <thead>
                      <tr>
                        {selectedColumns.map((column) => (
                          <th key={column} style={styles.previewTh}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        {selectedColumns.map((column) => (
                          <td key={column} style={styles.previewTd}>
                            {getPreviewValue(column)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={styles.noticeBox}>
                  이번 단계는 화면 UI 뼈대입니다. 다음 단계에서 저장, 조회,
                  PDF/Excel 출력 기능을 연결합니다.
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => setIsBuilderOpen(false)}
              >
                취소
              </button>

              <button type="button" style={styles.saveButton}>
                보고서 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getPreviewValue(column: string) {
  const values: Record<string, string> = {
    거래처명: "테스트상사",
    거래일: "2026-07-09",
    총매출: "1,200,000원",
    입금액: "700,000원",
    미수잔액: "500,000원",
    "최근 거래일": "2026-07-09",
  };

  return values[column] || "-";
}

const styles: Record<string, React.CSSProperties> = {
  page: { width: "100%" },
  header: {
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  title: { fontSize: "34px", fontWeight: 800, margin: 0, color: "#111827" },
  description: { marginTop: "8px", color: "#6b7280", fontSize: "15px" },
  primaryButton: {
    minWidth: "170px",
    height: "46px",
    padding: "0 20px",
    borderRadius: "12px",
    border: "1px solid #1d4ed8",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(37, 99, 235, 0.22)",
    cursor: "pointer",
  },
  card: {
    width: "100%",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
    boxSizing: "border-box",
  },
  sectionHeader: {
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  sectionTitle: { margin: 0, fontSize: "22px", fontWeight: 800, color: "#111827" },
  sectionDescription: { marginTop: "6px", fontSize: "14px", color: "#6b7280" },
  premiumBadge: {
    display: "inline-flex",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#fffbeb",
    color: "#b45309",
    fontSize: "12px",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  reportGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
  },
  reportCard: {
    textAlign: "left",
    minHeight: "150px",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.04)",
  },
  lockedReportCard: { background: "#f9fafb", cursor: "not-allowed", opacity: 0.92 },
  lockRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },
  lockBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "999px",
    background: "#fef3c7",
    fontSize: "14px",
  },
  reportTitle: { fontSize: "18px", fontWeight: 900, color: "#111827" },
  reportDescription: {
    marginTop: "10px",
    fontSize: "14px",
    lineHeight: 1.5,
    color: "#6b7280",
  },
  reportAction: { marginTop: "18px", fontSize: "14px", fontWeight: 800, color: "#2563eb" },
  lockedAction: { marginTop: "18px", fontSize: "14px", fontWeight: 800, color: "#b45309" },
  emptyBox: {
    minHeight: "220px",
    border: "1px dashed #d1d5db",
    borderRadius: "14px",
    background: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "32px",
  },
  emptyTitle: { fontSize: "18px", fontWeight: 800, color: "#374151" },
  emptyText: { marginTop: "8px", fontSize: "14px", color: "#6b7280" },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  modal: {
    width: "100%",
    maxWidth: "1180px",
    maxHeight: "92vh",
    overflow: "auto",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.35)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "16px",
    marginBottom: "18px",
  },
  modalTitle: { margin: 0, fontSize: "26px", fontWeight: 900, color: "#111827" },
  closeButton: {
    height: "38px",
    padding: "0 14px",
    borderRadius: "9px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    fontWeight: 800,
    cursor: "pointer",
  },
  builderGrid: {
    display: "grid",
    gridTemplateColumns: "420px minmax(0, 1fr)",
    gap: "20px",
  },
  builderLeft: { display: "flex", flexDirection: "column", gap: "16px" },
  settingBlock: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "18px",
    background: "#ffffff",
  },
  settingTitle: { margin: "0 0 14px", fontSize: "17px", fontWeight: 900, color: "#111827" },
  label: { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 800, color: "#374151" },
  input: {
    width: "100%",
    height: "42px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "0 12px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  templateList: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" },
  templateButton: {
    height: "42px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    fontWeight: 800,
    cursor: "pointer",
  },
  templateButtonActive: {
    border: "1px solid #2563eb",
    background: "#eff6ff",
    color: "#1d4ed8",
  },
  columnGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
  },
  previewBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "20px",
    background: "#f9fafb",
  },
  previewHeader: {
    marginBottom: "16px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "14px",
  },
  previewTitle: { margin: 0, fontSize: "22px", fontWeight: 900, color: "#111827" },
  previewDescription: { marginTop: "6px", fontSize: "14px", color: "#6b7280" },
  previewTableWrap: {
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    background: "#ffffff",
  },
  previewTable: { width: "100%", minWidth: "640px", borderCollapse: "collapse", fontSize: "14px" },
  previewTh: {
    padding: "12px",
    textAlign: "left",
    background: "#f3f4f6",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 900,
  },
  previewTd: {
    padding: "12px",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151",
    fontWeight: 700,
  },
  noticeBox: {
    marginTop: "16px",
    padding: "14px",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "14px",
    fontWeight: 700,
  },
  modalFooter: {
    marginTop: "20px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "16px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  cancelButton: {
    height: "42px",
    padding: "0 18px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    fontWeight: 800,
    cursor: "pointer",
  },
  saveButton: {
    height: "42px",
    padding: "0 20px",
    borderRadius: "10px",
    border: "1px solid #1d4ed8",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
};