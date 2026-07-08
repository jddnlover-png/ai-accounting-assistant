import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import AppLayout from "../components/layout/AppLayout";

import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../hooks/useProducts";

import type { Product } from "../hooks/useProducts";

const getNextProductCode = (products: Product[]) => {
  const numbers = products
    .map((product) => product.product_code || "")
    .map((code) => {
      const match = code.match(/P-(\d+)/);
      return match ? Number(match[1]) : 0;
    });

  const nextNumber = Math.max(0, ...numbers) + 1;
  return `P-${String(nextNumber).padStart(4, "0")}`;
};

const emptyForm = {
  product_code: "",
  name: "",
  specification: "",
  unit: "",
  default_price: 0,
  taxable: true,
  is_active: true,
  aliases: "",
  memo: "",
};

export default function Products() {
  const { data: products = [], isLoading, refetch } = useProducts();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [autoCode, setAutoCode] = useState(true);
  const [showMemo, setShowMemo] = useState(false);

  const productCodeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const specificationRef = useRef<HTMLInputElement>(null);
  const unitRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const aliasesRef = useRef<HTMLInputElement>(null);
  const memoRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const isEditMode = useMemo(() => !!editingProduct, [editingProduct]);

  const moveOnEnter = (
    e: KeyboardEvent<HTMLInputElement>,
    nextRef?: React.RefObject<HTMLInputElement | HTMLButtonElement | null>
  ) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    setTimeout(() => {
      nextRef?.current?.focus();
    }, 0);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowMemo(false);
    setAutoCode(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("품목명을 입력해주세요.");
      nameRef.current?.focus();
      return;
    }

    try {
      const submitForm = {
        ...form,
        product_code:
          autoCode && !isEditMode
            ? getNextProductCode(products)
            : form.product_code,
      };

      if (isEditMode && editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          input: submitForm,
        });
      } else {
        await createProduct.mutateAsync(submitForm);
      }

      await refetch();
      resetForm();
    } catch (error) {
      console.error(error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setAutoCode(false);

    setForm({
      product_code: product.product_code || "",
      name: product.name || "",
      specification: product.specification || "",
      unit: product.unit || "",
      default_price: product.default_price || 0,
      taxable: product.taxable,
      is_active: product.is_active,
      aliases: product.aliases || "",
      memo: product.memo || "",
    });

    setShowMemo(!!product.memo);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteProduct.mutateAsync(id);
      await refetch();
    } catch (error) {
      console.error(error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <AppLayout>
      <div style={styles.page}>
        <section style={styles.card}>
          <h2 style={styles.title}>{isEditMode ? "품목 수정" : "품목 등록"}</h2>

          <div style={styles.formGrid}>
            <Field label="품목코드">
              <div style={styles.inlineRow}>
                <input
                  ref={productCodeRef}
                  style={styles.input}
                  value={
                    autoCode && !isEditMode
                      ? getNextProductCode(products)
                      : form.product_code
                  }
                  disabled={autoCode && !isEditMode}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      product_code: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => moveOnEnter(e, nameRef)}
                  placeholder="예: P-0001"
                />

                {!isEditMode && (
                  <label style={styles.autoCodeLabel}>
                    <input
                      type="checkbox"
                      checked={autoCode}
                      onChange={(e) => {
                        setAutoCode(e.target.checked);

                        if (!e.target.checked) {
                          setTimeout(() => productCodeRef.current?.focus(), 0);
                        }
                      }}
                    />
                    자동
                  </label>
                )}
              </div>
            </Field>

            <Field label="품목명">
              <input
                ref={nameRef}
                style={styles.input}
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                onKeyDown={(e) => moveOnEnter(e, specificationRef)}
              />
            </Field>

            <Field label="규격">
              <input
                ref={specificationRef}
                style={styles.input}
                value={form.specification}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    specification: e.target.value,
                  }))
                }
                onKeyDown={(e) => moveOnEnter(e, unitRef)}
              />
            </Field>

            <Field label="단위">
              <input
                ref={unitRef}
                style={styles.input}
                value={form.unit}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, unit: e.target.value }))
                }
                onKeyDown={(e) => moveOnEnter(e, priceRef)}
                placeholder="개, 박스, kg 등"
              />
            </Field>

            <Field label="기본 단가">
              <input
                ref={priceRef}
                style={styles.input}
                type="number"
                value={form.default_price === 0 ? "" : form.default_price}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    default_price:
                      e.target.value === "" ? 0 : Number(e.target.value),
                  }))
                }
                onKeyDown={(e) => moveOnEnter(e, aliasesRef)}
              />
            </Field>

            <Field label="별칭/검색어">
              <input
                ref={aliasesRef}
                style={styles.input}
                value={form.aliases}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, aliases: e.target.value }))
                }
                onKeyDown={(e) =>
                  moveOnEnter(e, showMemo ? memoRef : submitButtonRef)
                }
                placeholder="AI/OCR 매칭용 예: 레드로즈, 장미빨강"
              />
            </Field>
          </div>

          <div style={styles.optionRow}>
            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.taxable}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, taxable: e.target.checked }))
                }
              />
              과세
            </label>

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_active: e.target.checked }))
                }
              />
              사용 중
            </label>

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={showMemo}
                onChange={(e) => {
                  setShowMemo(e.target.checked);

                  if (!e.target.checked) {
                    setForm((prev) => ({ ...prev, memo: "" }));
                  } else {
                    setTimeout(() => memoRef.current?.focus(), 0);
                  }
                }}
              />
              메모
            </label>

            <button
              ref={submitButtonRef}
              type="button"
              style={styles.primaryButton}
              onClick={handleSubmit}
              disabled={createProduct.isPending || updateProduct.isPending}
            >
              {isEditMode ? "수정 저장" : "품목 등록"}
            </button>

            {isEditMode && (
              <button type="button" style={styles.secondaryButton} onClick={resetForm}>
                취소
              </button>
            )}
          </div>

          {showMemo && (
            <input
              ref={memoRef}
              style={styles.memoInput}
              value={form.memo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, memo: e.target.value }))
              }
              onKeyDown={(e) => moveOnEnter(e, submitButtonRef)}
              placeholder="간단 메모"
            />
          )}
        </section>

        <section style={styles.card}>
          <h2 style={styles.title}>품목 목록</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>품목코드</th>
                <th style={styles.th}>품목명</th>
                <th style={styles.th}>규격</th>
                <th style={styles.th}>단위</th>
                <th style={styles.th}>기본 단가</th>
                <th style={styles.th}>과세</th>
                <th style={styles.th}>상태</th>
                <th style={styles.th}>관리</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} style={styles.emptyCell}>
                    불러오는 중입니다.
                  </td>
                </tr>
              )}

              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={8} style={styles.emptyCell}>
                    등록된 품목이 없습니다.
                  </td>
                </tr>
              )}

              {products.map((product) => (
                <tr key={product.id}>
                  <td style={styles.td}>{product.product_code || "-"}</td>
                  <td style={styles.td}>{product.name}</td>
                  <td style={styles.td}>{product.specification || "-"}</td>
                  <td style={styles.td}>{product.unit || "-"}</td>
                  <td style={styles.td}>
                    {Number(product.default_price).toLocaleString()}원
                  </td>
                  <td style={styles.td}>{product.taxable ? "과세" : "면세"}</td>
                  <td style={styles.td}>
                    {product.is_active ? "사용 중" : "중지"}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionRow}>
                      <button
                        type="button"
                        style={styles.smallButton}
                        onClick={() => handleEdit(product)}
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        style={styles.deleteButton}
                        onClick={() => handleDelete(product.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { display: "flex", flexDirection: "column", gap: "24px" },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: "20px",
    fontWeight: 700,
    marginBottom: "20px",
    color: "#111827",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "260px 1.4fr 1fr 120px 160px 1.4fr",
    columnGap: "12px",
    rowGap: "10px",
    alignItems: "end",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "8px",
  },
  label: { fontSize: "14px", fontWeight: 600, color: "#374151" },
  input: {
    width: "100%",
    height: "40px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "0 12px",
    fontSize: "14px",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#374151",
  },
  primaryButton: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "10px 16px",
    fontWeight: 600,
    cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    padding: "12px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: 700,
    color: "#374151",
  },
  td: {
    borderBottom: "1px solid #e5e7eb",
    padding: "12px",
    fontSize: "14px",
    color: "#111827",
  },
  emptyCell: { textAlign: "center", padding: "40px", color: "#6b7280" },
  actionRow: { display: "flex", gap: "8px" },
  smallButton: {
    background: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  deleteButton: {
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  inlineRow: { display: "flex", alignItems: "center", gap: "8px" },
  autoCodeLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    whiteSpace: "nowrap",
    fontSize: "13px",
    color: "#374151",
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginTop: "6px",
  },
  memoInput: {
    height: "34px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "0 12px",
    fontSize: "13px",
    marginTop: "10px",
  },
};