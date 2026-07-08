import { useMemo, useState } from "react";
import { useSalesStatements } from "../hooks/useSalesStatements";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ko-KR").format(amount);

const getPaidAmount = (statement: any) => Number(statement?.paid_amount || 0);

const getRemainingAmount = (statement: any) => {
  const totalAmount = Number(statement?.total_amount || 0);

  if (
    statement?.remaining_amount !== undefined &&
    statement?.remaining_amount !== null
  ) {
    return Math.max(Number(statement.remaining_amount || 0), 0);
  }

  return Math.max(totalAmount - getPaidAmount(statement), 0);
};

const getStatus = (remainingAmount: number, totalAmount: number) => {
  if (remainingAmount <= 0) return "paid";
  if (remainingAmount < totalAmount) return "partial";
  return "unpaid";
};

const getStatusLabel = (status: string) => {
  if (status === "paid") return "완납";
  if (status === "partial") return "일부입금";
  return "미수";
};

export default function Receivables() {
  const { data: statements = [], isLoading, error } = useSalesStatements();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "partial" | "paid">("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const ledgerRows = useMemo(() => {
    const customerMap = new Map<string, any>();

    (statements || []).forEach((statement: any) => {
      if (statement.statement_type === "purchase") return;

      const customerId =
        statement.customer_id || statement.customer_name_snapshot || statement.id;

      const totalAmount = Number(statement.total_amount || 0);
      const paidAmount = getPaidAmount(statement);
      const remainingAmount = getRemainingAmount(statement);

      const current = customerMap.get(customerId) || {
        customerId,
        customerName: statement.customer_name_snapshot || "-",
        businessNumber: statement.customer_business_no_snapshot || "-",
        totalSalesAmount: 0,
        totalPaidAmount: 0,
        totalRemainingAmount: 0,
        latestStatementDate: "",
        statements: [],
      };

      current.totalSalesAmount += totalAmount;
      current.totalPaidAmount += paidAmount;
      current.totalRemainingAmount += remainingAmount;

      if (
        !current.latestStatementDate ||
        statement.statement_date > current.latestStatementDate
      ) {
        current.latestStatementDate = statement.statement_date;
      }

      current.statements.push(statement);

      customerMap.set(customerId, current);
    });

    return Array.from(customerMap.values())
      .map((row) => ({
        ...row,
        status: getStatus(row.totalRemainingAmount, row.totalSalesAmount),
      }))
      .sort((a, b) => b.totalRemainingAmount - a.totalRemainingAmount);
  }, [statements]);

  const filteredRows = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return ledgerRows.filter((row) => {
      const matchesKeyword =
        !keyword ||
        [row.customerName, row.businessNumber]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [ledgerRows, searchText, statusFilter]);

  const selectedLedger = ledgerRows.find(
    (row) => row.customerId === selectedCustomerId
  );

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        acc.totalSalesAmount += row.totalSalesAmount;
        acc.totalPaidAmount += row.totalPaidAmount;
        acc.totalRemainingAmount += row.totalRemainingAmount;
        return acc;
      },
      {
        totalSalesAmount: 0,
        totalPaidAmount: 0,
        totalRemainingAmount: 0,
      }
    );
  }, [filteredRows]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>미수금원장</h1>
          <p style={styles.description}>
            거래처별 매출, 입금액, 미수잔액을 조회하고 상세 원장을 확인합니다.
          </p>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <SummaryCard title="총 매출" amount={summary.totalSalesAmount} />
        <SummaryCard title="총 입금" amount={summary.totalPaidAmount} />
        <SummaryCard title="미수잔액" amount={summary.totalRemainingAmount} highlight />
      </div>

      <section style={styles.card}>
        <div style={styles.filterBox}>
          <div>
            <label style={styles.label}>거래처 검색</label>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              style={styles.input}
              placeholder="거래처명, 사업자번호 검색"
            />
          </div>

          <div>
            <label style={styles.label}>상태</label>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | "unpaid" | "partial" | "paid")
              }
              style={styles.input}
            >
              <option value="all">전체</option>
              <option value="unpaid">미수</option>
              <option value="partial">일부입금</option>
              <option value="paid">완납</option>
            </select>
          </div>
        </div>

        {isLoading && <p style={styles.emptyText}>불러오는 중입니다.</p>}

        {error && (
          <p style={{ ...styles.emptyText, color: "#dc2626" }}>
            미수금원장을 불러오지 못했습니다.
          </p>
        )}

        {!isLoading && !error && filteredRows.length === 0 && (
          <div style={styles.emptyBox}>
            <div style={styles.emptyTitle}>조회된 미수금 내역이 없습니다</div>
            <p style={styles.emptyText}>
              거래처 검색어나 상태 조건을 변경해서 다시 확인해주세요.
            </p>
          </div>
        )}

        {!isLoading && !error && filteredRows.length > 0 && (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.thLeft}>거래처</th>
                  <th style={styles.thRight}>총 매출</th>
                  <th style={styles.thRight}>입금액</th>
                  <th style={styles.thRight}>미수잔액</th>
                  <th style={styles.thLeft}>최근 거래일</th>
                  <th style={styles.thLeft}>상태</th>
                  <th style={styles.thCenter}>상세</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.customerId}>
                    <td style={styles.tdStrong}>{row.customerName}</td>
                    <td style={styles.tdRight}>
                      {formatCurrency(row.totalSalesAmount)}원
                    </td>
                    <td style={styles.tdRight}>
                      {formatCurrency(row.totalPaidAmount)}원
                    </td>
                    <td style={{ ...styles.tdRight, fontWeight: 800, color: "#b91c1c" }}>
                      {formatCurrency(row.totalRemainingAmount)}원
                    </td>
                    <td style={styles.td}>{row.latestStatementDate || "-"}</td>
                    <td style={styles.td}>
                      <StatusBadge status={row.status} />
                    </td>
                    <td style={styles.tdCenter}>
                      <button
                        type="button"
                        onClick={() => setSelectedCustomerId(row.customerId)}
                        style={styles.detailButton}
                      >
                        상세 보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedLedger && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>{selectedLedger.customerName}</h2>
                <p style={styles.description}>거래처별 상세 원장</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                style={styles.closeButton}
              >
                닫기
              </button>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.thLeft}>날짜</th>
                    <th style={styles.thLeft}>구분</th>
                    <th style={styles.thRight}>발생금액</th>
                    <th style={styles.thRight}>입금액</th>
                    <th style={styles.thRight}>잔액</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedLedger.statements
                    .slice()
                    .sort((a: any, b: any) =>
                      String(a.statement_date || "").localeCompare(
                        String(b.statement_date || "")
                      )
                    )
                    .map((statement: any) => {
                      const totalAmount = Number(statement.total_amount || 0);
                      const paidAmount = getPaidAmount(statement);
                      const remainingAmount = getRemainingAmount(statement);

                      return (
                        <tr key={statement.id}>
                          <td style={styles.td}>{statement.statement_date || "-"}</td>
                          <td style={styles.td}>매출 거래명세표</td>
                          <td style={styles.tdRight}>
                            {formatCurrency(totalAmount)}원
                          </td>
                          <td style={styles.tdRight}>
                            {formatCurrency(paidAmount)}원
                          </td>
                          <td style={{ ...styles.tdRight, fontWeight: 800 }}>
                            {formatCurrency(remainingAmount)}원
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  amount,
  highlight,
}: {
  title: string;
  amount: number;
  highlight?: boolean;
}) {
  return (
    <div style={styles.summaryCard}>
      <div style={styles.summaryTitle}>{title}</div>
      <div
        style={{
          ...styles.summaryAmount,
          color: highlight ? "#b91c1c" : "#111827",
        }}
      >
        {formatCurrency(amount)}원
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const background =
    status === "paid" ? "#dcfce7" : status === "partial" ? "#fef3c7" : "#fee2e2";

  const color =
    status === "paid" ? "#15803d" : status === "partial" ? "#b45309" : "#b91c1c";

  return (
    <span style={{ ...styles.badge, background, color }}>
      {getStatusLabel(status)}
    </span>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
  },
  header: {
    marginBottom: "24px",
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
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "22px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },
  summaryTitle: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#6b7280",
  },
  summaryAmount: {
    marginTop: "8px",
    fontSize: "24px",
    fontWeight: 900,
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
  filterBox: {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 1fr) 180px",
    gap: "12px",
    alignItems: "end",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "18px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: 800,
    color: "#374151",
  },
  input: {
    width: "100%",
    height: "40px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "0 12px",
    fontSize: "14px",
    boxSizing: "border-box",
    background: "#ffffff",
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
  },
  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  thLeft: {
    textAlign: "left",
    padding: "14px 12px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 800,
  },
  thRight: {
    textAlign: "right",
    padding: "14px 12px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 800,
  },
  thCenter: {
    textAlign: "center",
    padding: "14px 12px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 800,
  },
  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151",
  },
  tdStrong: {
    padding: "14px 12px",
    borderBottom: "1px solid #f3f4f6",
    color: "#111827",
    fontWeight: 800,
  },
  tdRight: {
    padding: "14px 12px",
    borderBottom: "1px solid #f3f4f6",
    textAlign: "right",
    color: "#374151",
  },
  tdCenter: {
    padding: "14px 12px",
    borderBottom: "1px solid #f3f4f6",
    textAlign: "center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "74px",
    padding: "5px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 900,
  },
  detailButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "9px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 800,
    cursor: "pointer",
  },
  emptyBox: {
    minHeight: "240px",
    border: "1px dashed #d1d5db",
    borderRadius: "14px",
    background: "#f9fafb",
    display: "flex",
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
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    background: "rgba(0, 0, 0, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  modal: {
    width: "100%",
    maxWidth: "980px",
    maxHeight: "92vh",
    overflow: "auto",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.35)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "16px",
    marginBottom: "16px",
  },
  modalTitle: {
    margin: 0,
    fontSize: "26px",
    fontWeight: 900,
    color: "#111827",
  },
  closeButton: {
    padding: "8px 14px",
    borderRadius: "9px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    fontWeight: 800,
    cursor: "pointer",
  },
};