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

export default function Reports() {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>보고서 관리</h1>
          <p style={styles.description}>
            회사별 실무에 맞는 보고서를 직접 만들고 저장해서 사용할 수 있습니다.
          </p>
        </div>

        <button type="button" style={styles.primaryButton}>
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
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
  },
  header: {
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  title: {
    fontSize: "34px",
    fontWeight: 800,
    margin: 0,
    color: "#111827",
  },
  description: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "15px",
  },
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
  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#111827",
  },
  sectionDescription: {
    marginTop: "6px",
    fontSize: "14px",
    color: "#6b7280",
  },
  premiumBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
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
  lockedReportCard: {
    background: "#f9fafb",
    cursor: "not-allowed",
    opacity: 0.92,
  },
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
  reportTitle: {
    fontSize: "18px",
    fontWeight: 900,
    color: "#111827",
  },
  reportDescription: {
    marginTop: "10px",
    fontSize: "14px",
    lineHeight: 1.5,
    color: "#6b7280",
  },
  reportAction: {
    marginTop: "18px",
    fontSize: "14px",
    fontWeight: 800,
    color: "#2563eb",
  },
  lockedAction: {
    marginTop: "18px",
    fontSize: "14px",
    fontWeight: 800,
    color: "#b45309",
  },
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
  emptyTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#374151",
  },
  emptyText: {
    marginTop: "8px",
    fontSize: "14px",
    color: "#6b7280",
  },
};