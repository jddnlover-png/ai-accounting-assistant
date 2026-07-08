import type React from "react";

export const formStyles: Record<string, React.CSSProperties> = {
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
};