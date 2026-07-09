const defaultReports = [
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
    title: "품목 판매현황",
    description: "품목별 판매수량과 판매금액을 집계합니다.",
    type: "product-sales",
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
              바로 사용할 수 있는 기본 원장/보고서입니다.
            </p>
          </div>
        </div>

        <div style={styles.reportGrid}>
          {defaultReports.map((report) => (
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
  reportGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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