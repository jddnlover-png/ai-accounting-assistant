import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password || !companyName) {
      setMessage("회사명, 이메일, 비밀번호를 모두 입력해주세요.");
      return;
    }

    const { error: signUpError } = await signUp(email, password);

    if (signUpError) {
      setMessage(signUpError.message);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setMessage(loginError.message);
      return;
    }

    const { error: rpcError } = await supabase.rpc(
      "create_initial_organization",
      {
        company_name: companyName,
      }
    );

    if (rpcError) {
      setMessage(rpcError.message);
      return;
    }

    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.logo}>
          AI 경리 비서
        </Link>

        <h1 style={styles.title}>회원가입</h1>
        <p style={styles.subtitle}>회사 계정을 만들고 서비스를 시작하세요.</p>

        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>회사명</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="회사명을 입력하세요"
              style={styles.input}
            />
          </div>

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
            가입하기
          </button>
        </form>

        <p style={styles.footerText}>
          이미 계정이 있으신가요?{" "}
          <Link to="/login" style={styles.link}>
            로그인
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
    background: "#111827",
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