import { Link } from "react-router-dom";
import { pageStyles } from "../styles/pageStyles";
import { cardStyles } from "../styles/cardStyles";

export default function Settings() {
  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.header}>
        <div>
          <h1 style={pageStyles.title}>설정</h1>
          <p style={pageStyles.description}>
            회사정보, 문서 설정, 출력 옵션 등을 관리합니다.
          </p>
        </div>
      </div>

      <section style={styles.cardGrid}>
        <Link to="/settings/company" style={styles.settingCard}>
          <h2 style={cardStyles.sectionTitle}>회사정보</h2>
          <p style={styles.cardDescription}>
            회사명, 대표자, 사업자번호, 연락처, 로고, 도장 정보를 관리합니다.
          </p>
        </Link>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
  },
  settingCard: {
    ...cardStyles.card,
    display: "block",
    minHeight: "118px",
    textDecoration: "none",
    color: "inherit",
    marginBottom: 0,
  },
  cardDescription: {
    marginTop: "12px",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.5,
  },
};