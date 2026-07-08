import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useOrganization } from "../../contexts/OrganizationContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { organization } = useOrganization();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      <div>
        <strong>{organization?.name ?? "회사 없음"}</strong>
        <span style={styles.email}> {user?.email}</span>
      </div>

      <button onClick={handleLogout} style={styles.button}>
        로그아웃
      </button>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: "60px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    background: "#ffffff",
  },
  email: {
    color: "#6b7280",
    fontSize: "14px",
    marginLeft: "8px",
  },
  button: {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    borderRadius: "6px",
    cursor: "pointer",
  },
};