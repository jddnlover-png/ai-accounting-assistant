import { NavLink } from "react-router-dom";

const menus = [
  { label: "대시보드", path: "/dashboard" },
  { label: "거래처 관리", path: "/customers" },
  { label: "품목 관리", path: "/products" },
  { label: "거래명세표", path: "/statements" },
  { label: "입금 관리", path: "/payments" },
  { label: "미수금", path: "/receivables" },
  { label: "설정", path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>AI 경리비서</div>

      <nav style={styles.nav}>
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            {menu.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: "220px",
    minHeight: "100vh",
    borderRight: "1px solid #e5e7eb",
    background: "#111827",
    color: "#ffffff",
    padding: "20px 14px",
  },
  logo: {
    fontSize: "20px",
    fontWeight: 700,
    marginBottom: "28px",
    padding: "0 10px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  link: {
    color: "#d1d5db",
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "15px",
  },
  activeLink: {
    background: "#2563eb",
    color: "#ffffff",
  },
};