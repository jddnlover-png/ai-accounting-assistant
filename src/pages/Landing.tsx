import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>AI 경리 비서</h1>

      <p style={styles.description}>
        거래명세표와 경리 업무를 자동화하세요.
      </p>

      <div style={styles.buttonGroup}>
        <Link to="/login" style={styles.loginButton}>
          로그인
        </Link>

        <Link to="/signup" style={styles.signupButton}>
          회원가입
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f9fafb",
  },

  title: {
    fontSize: "56px",
    fontWeight: 700,
    marginBottom: "16px",
  },

  description: {
    fontSize: "18px",
    color: "#6b7280",
    marginBottom: "32px",
  },

  buttonGroup: {
    display: "flex",
    gap: "16px",
  },

  loginButton: {
    padding: "12px 24px",
    background: "#2563eb",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: 600,
  },

  signupButton: {
    padding: "12px 24px",
    background: "#111827",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: 600,
  },
};