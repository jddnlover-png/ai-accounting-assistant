import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      setMessage(error.message);
      return;
    }

    navigate("/app");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.logo}>
          AI 경리 비서
        </Link>

        <h1 style={styles.title}>로그인</h1>
        <p style={styles.subtitle}>계정으로 접속해 업무를 시작하세요.</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@company.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              style={styles.input}
            />
          </div>

          {message && <p style={styles.message}>{message}</p>}

          <button type="submit" style={styles.primaryButton}>
            로그인
          </button>
        </form>

        <p style={styles.footerText}>
          계정이 없으신가요?{" "}
          <Link to="/signup" style={styles.link}>
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "36px",
    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5e7eb",
  },
  logo: {
    display: "block",
    textAlign: "center",
    color: "#111827",
    textDecoration: "none",
    fontSize: "22px",
    fontWeight: 800,
    marginBottom: "28px",
  },
  title: {
    fontSize: "32px",
    fontWeight: 800,
    margin: 0,
    textAlign: "center",
    color: "#111827",
  },
  subtitle: {
    marginTop: "10px",
    marginBottom: "28px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    height: "46px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "0 14px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },
  primaryButton: {
    height: "48px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "4px",
  },
  message: {
    margin: 0,
    color: "#dc2626",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  footerText: {
    marginTop: "24px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
  },
  link: {
    color: "#2563eb",
    fontWeight: 700,
    textDecoration: "none",
  },
};