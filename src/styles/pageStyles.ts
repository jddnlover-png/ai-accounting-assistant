import type React from "react";

export const pageStyles: Record<string, React.CSSProperties> = {
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
  disabledInput: {
    height: "44px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "0 12px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    background: "#f9fafb",
    color: "#6b7280",
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
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
  },
};