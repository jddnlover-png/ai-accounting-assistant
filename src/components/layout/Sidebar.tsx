import { NavLink } from "react-router-dom";

const menuGroups = [
  {
    title: "",
    items: [{ label: "대시보드", path: "/dashboard", child: false }],
  },
  {
    title: "등록 관리",
    items: [
      { label: "거래명세표", path: "/statements", child: true },
      { label: "입금 관리", path: "/payments", child: true },
    ],
  },
  {
    title: "보고서 관리",
    items: [{ label: "내 보고서", path: "/reports", child: true }],
  },
  {
    title: "기준정보",
    items: [
      { label: "거래처 관리", path: "/customers", child: true },
      { label: "품목 관리", path: "/products", child: true },
      { label: "회사 설정", path: "/settings", child: true },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>AI 경리비서</div>

      <nav style={styles.nav}>
        {menuGroups.map((group) => (
          <div key={group.title || "main"}>
            {group.title && <div style={styles.groupTitle}>{group.title}</div>}

            <div style={styles.groupItems}>
              {group.items.map((menu) => (
                <NavLink
                  key={menu.path}
                  to={menu.path}
                  style={({ isActive }) => ({
                    ...styles.link,
                    ...(menu.child ? styles.childLink : {}),
                    ...(isActive ? styles.activeLink : {}),
                  })}
                >
                  {menu.child && <span style={styles.childMarker}>ㄴ</span>}
                  <span>{menu.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
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
    fontSize: "21px",
    fontWeight: 800,
    marginBottom: "32px",
    padding: "0 10px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  groupTitle: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: 800,
    marginBottom: "10px",
    padding: "0 12px",
  },
  groupItems: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#e5e7eb",
    textDecoration: "none",
    padding: "11px 12px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 500,
  },
  childLink: {
    paddingLeft: "18px",
  },
  childMarker: {
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1,
  },
  activeLink: {
    background: "#2563eb",
    color: "#ffffff",
  },
};