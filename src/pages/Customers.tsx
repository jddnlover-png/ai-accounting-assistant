import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  useCustomers,
  type Customer,
  type CustomerType,
} from "../hooks/useCustomers";
import { useOrganization } from "../contexts/OrganizationContext";

const customerTypeLabels: Record<CustomerType, string> = {
  sales: "매출처",
  purchase: "매입처",
  both: "매출매입처",
};

export default function Customers() {
  const { organization } = useOrganization();

  const {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();

  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(
    null
  );

  const [name, setName] = useState("");
  const [customerType, setCustomerType] = useState<CustomerType>("sales");
  const [businessNumber, setBusinessNumber] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessItem, setBusinessItem] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const resetForm = () => {
    setEditingCustomerId(null);
    setName("");
    setCustomerType("sales");
    setBusinessNumber("");
    setRepresentativeName("");
    setBusinessType("");
    setBusinessItem("");
    setPhone("");
    setEmail("");
    setAddress("");
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setName(customer.name || "");
    setCustomerType(customer.customer_type || "sales");
    setBusinessNumber(customer.business_number || "");
    setRepresentativeName(customer.representative_name || "");
    setBusinessType(customer.business_type || "");
    setBusinessItem(customer.business_item || "");
    setPhone(customer.phone || "");
    setEmail(customer.email || "");
    setAddress(customer.address || "");
  };

  const handleSubmit = async () => {
    if (!organization?.id) return;

    if (!name.trim()) {
      alert("거래처명을 입력하세요.");
      return;
    }

    const payload = {
      organization_id: organization.id,
      name,
      customer_type: customerType,
      business_number: businessNumber,
      representative_name: representativeName,
      business_type: businessType,
      business_item: businessItem,
      address,
      phone,
      fax: "",
      email,
      memo: "",
    };

    const success = editingCustomerId
      ? await updateCustomer(editingCustomerId, payload)
      : await createCustomer(payload);

    if (success) {
      resetForm();
    }
  };

  return (
    <AppLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>거래처 관리</h1>
            <p style={styles.description}>
              거래명세표 발행에 사용할 거래처 정보를 관리합니다.
            </p>
          </div>
        </div>

        <section style={styles.card}>
          <div style={styles.formTitleRow}>
            <h2 style={styles.sectionTitle}>
              {editingCustomerId ? "거래처 수정" : "거래처 등록"}
            </h2>

            {editingCustomerId && (
              <button onClick={resetForm} style={styles.cancelButton}>
                수정 취소
              </button>
            )}
          </div>

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>거래처명 *</label>
              <input
                placeholder="예: 테스트상사"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>거래처 구분</label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                style={styles.input}
              >
                <option value="sales">매출처</option>
                <option value="purchase">매입처</option>
                <option value="both">매출매입처</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>사업자번호</label>
              <input
                placeholder="000-00-00000"
                value={businessNumber}
                onChange={(e) => setBusinessNumber(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>대표자명</label>
              <input
                placeholder="대표자명"
                value={representativeName}
                onChange={(e) => setRepresentativeName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>업태</label>
              <input
                placeholder="예: 도소매"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>종목</label>
              <input
                placeholder="예: 화훼"
                value={businessItem}
                onChange={(e) => setBusinessItem(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>전화번호</label>
              <input
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>이메일</label>
              <input
                type="email"
                placeholder="example@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.field, ...styles.fullWidth }}>
              <label style={styles.label}>주소</label>
              <input
                placeholder="거래처 주소를 입력하세요"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.actionRow}>
            <button onClick={handleSubmit} style={styles.primaryButton}>
              {editingCustomerId ? "거래처 수정" : "거래처 등록"}
            </button>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>거래처 목록</h2>
            <span style={styles.count}>{customers.length}개</span>
          </div>

          {loading ? (
            <p style={styles.emptyText}>불러오는 중...</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>구분</th>
                    <th style={styles.th}>거래처명</th>
                    <th style={styles.th}>사업자번호</th>
                    <th style={styles.th}>대표자명</th>
                    <th style={styles.th}>업태/종목</th>
                    <th style={styles.th}>연락처</th>
                    <th style={styles.th}>관리</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td style={styles.td}>
                        <span
  style={{
    ...styles.badge,
    ...(customer.customer_type === "sales"
      ? styles.salesBadge
      : customer.customer_type === "purchase"
      ? styles.purchaseBadge
      : styles.bothBadge),
  }}
>
  {customerTypeLabels[customer.customer_type] ?? "-"}
</span>
                      </td>

                      <td style={styles.td}>{customer.name}</td>

                      <td style={styles.td}>
                        {customer.business_number || "-"}
                      </td>

                      <td style={styles.td}>
                        {customer.representative_name || "-"}
                      </td>

                      <td style={styles.td}>
                        {customer.business_type || "-"} /{" "}
                        {customer.business_item || "-"}
                      </td>

                      <td style={styles.td}>{customer.phone || "-"}</td>

                      <td style={styles.td}>
                        <div style={styles.buttonGroup}>
                          <button
                            onClick={() => handleEditClick(customer)}
                            style={styles.editButton}
                          >
                            수정
                          </button>

                          <button
                            onClick={() => deleteCustomer(customer.id)}
                            style={styles.deleteButton}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={7} style={styles.emptyCell}>
                        등록된 거래처가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
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
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },
  formTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    margin: 0,
    color: "#111827",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginTop: "18px",
  },
  fullWidth: {
    gridColumn: "1 / -1",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#374151",
  },
  input: {
    height: "44px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "0 12px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    background: "#ffffff",
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
  },
  primaryButton: {
    height: "44px",
    padding: "0 22px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
  },
  cancelButton: {
    height: "36px",
    padding: "0 14px",
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  count: {
    fontSize: "13px",
    color: "#6b7280",
    background: "#f3f4f6",
    padding: "4px 10px",
    borderRadius: "999px",
  },
  tableWrapper: {
    width: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },
  th: {
    textAlign: "left",
    fontSize: "13px",
    color: "#374151",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    padding: "12px",
    whiteSpace: "nowrap",
  },
  td: {
    fontSize: "14px",
    color: "#111827",
    borderBottom: "1px solid #f3f4f6",
    padding: "12px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  badge: {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
},

salesBadge: {
  background: "#dbeafe",
  color: "#1d4ed8",
},

purchaseBadge: {
  background: "#fee2e2",
  color: "#b91c1c",
},

bothBadge: {
  background: "#f3e8ff",
  color: "#7e22ce",
},
  buttonGroup: {
    display: "flex",
    gap: "8px",
  },
  editButton: {
    padding: "7px 12px",
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
  },
  deleteButton: {
    padding: "7px 12px",
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
  },
  emptyText: {
    color: "#6b7280",
  },
  emptyCell: {
    textAlign: "center",
    padding: "32px",
    color: "#6b7280",
  },
};