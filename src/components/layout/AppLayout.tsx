import type { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useOrganization } from "../../contexts/OrganizationContext";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const { loading } = useOrganization();

  if (loading) {
    return <div style={styles.loading}>회사 정보 불러오는 중...</div>;
  }

  return (
    <div style={styles.wrapper}>
      <Sidebar />

      <div style={styles.mainArea}>
        <Header />

        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#f9fafb",
  },
  mainArea: {
    flex: 1,
    minWidth: 0,
  },
  content: {
    padding: "24px",
  },
  loading: {
    padding: "24px",
  },
};