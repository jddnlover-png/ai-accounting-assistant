import { useAuth } from "../contexts/AuthContext";
import { useOrganization } from "../contexts/OrganizationContext";
import AppLayout from "../components/layout/AppLayout";

export default function Dashboard() {
  const { user } = useAuth();
  const { organization } = useOrganization();

  return (
    <AppLayout>
      <h1>대시보드</h1>

      <p>
        <strong>로그인 계정:</strong> {user?.email}
      </p>

      <p>
        <strong>회사명:</strong>{" "}
        {organization?.name ?? "회사 없음"}
      </p>
    </AppLayout>
  );
}