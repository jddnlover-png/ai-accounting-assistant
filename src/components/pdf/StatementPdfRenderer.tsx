import type { PdfPrintSettings } from "../../types/pdfSettings";

interface StatementPdfRendererProps {
  selectedStatement: any;
  selectedItems: any[];
  pdfPrintSettings: PdfPrintSettings;
  formatCurrency: (amount: number) => string;
  getPaidAmount: (statement: any) => number;
  getRemainingAmount: (statement: any) => number;
  organization?: any;
}

export default function StatementPdfRenderer({
  selectedStatement,
  selectedItems,
  pdfPrintSettings,
  formatCurrency,
  getPaidAmount,
  getRemainingAmount,
  organization,
}: StatementPdfRendererProps) {
    if (!selectedStatement) return null;

  const organizationName = organization?.name || "";
  const organizationRepresentativeName =
    organization?.representative_name || "";
  const organizationBusinessNumber =
    organization?.business_number || "";
  const organizationAddress = organization?.address || "";
  const organizationBusinessType = organization?.business_type || "";
  const organizationBusinessItem = organization?.business_item || "";
  const organizationPhone = organization?.phone || organization?.mobile_phone || "";
  const organizationFax = organization?.fax || "";
  const organizationLogoUrl = organization?.logo_url || "";
const organizationStampUrl = organization?.stamp_url || "";
const footerMemoText = pdfPrintSettings.footer?.memoText || "";

  const documentTitleMap = {
  statement: "거 래 명 세 표",
  delivery: "납 품 서",
  shipment: "출 고 증",
  receipt: "인 수 증",
  estimate: "견 적 서",
  purchaseOrder: "발 주 서",
} as const;

const getSpacedTitle = (title: string) => {
  const cleanTitle = title.trim();

  if (!cleanTitle) return documentTitleMap.statement;

  return cleanTitle.split("").join(" ");
};

const documentTitle =
  pdfPrintSettings.document.type === "custom"
    ? getSpacedTitle(pdfPrintSettings.document.customTitle)
    : documentTitleMap[pdfPrintSettings.document.type] ||
      documentTitleMap.statement;

const bodyFontSizeMap = {
  small: "8px",
  normal: "9px",
  large: "10px",
} as const;

const titleFontSizeMap = {
  normal: "19px",
  large: "22px",
} as const;

const bodyFontSize =
  bodyFontSizeMap[pdfPrintSettings.typography.bodyFontSize] || "9px";

const titleFontSize =
  titleFontSizeMap[pdfPrintSettings.typography.titleFontSize] || "19px";
  const borderWeightMap = {
  thin: "1px",
  normal: "2px",
  bold: "3px",
} as const;

const borderWeight =
  borderWeightMap[pdfPrintSettings.border.lineWeight] || "2px";

const colorMap = {
  black: {
    supplier: "#111827",
    customer: "#111827",
  },
  blue: {
    supplier: "#ef4444",
    customer: "#2563eb",
  },
  red: {
    supplier: "#dc2626",
    customer: "#dc2626",
  },
} as const;

const selectedColorSet =
  colorMap[pdfPrintSettings.theme.color] || colorMap.blue;
  const getBorderColor = (baseColor: string) => {
  if (pdfPrintSettings.border.lineWeight !== "thin") {
    return baseColor;
  }

  if (baseColor === "#111827") return "#9ca3af";
  if (baseColor === "#dc2626") return "#fca5a5";
  if (baseColor === "#ef4444") return "#fca5a5";
  if (baseColor === "#2563eb") return "#93c5fd";

  return baseColor;
};

const columnWidth = pdfPrintSettings.columnWidth;

const visibleItemColumns = [
  { key: "date", label: "월일", width: columnWidth.date },
  { key: "product", label: "품목명", width: columnWidth.product },
  ...(pdfPrintSettings.visibility.specification
    ? [
        {
          key: "specification",
          label: "규격",
          width: columnWidth.specification,
        },
      ]
    : []),
  ...(pdfPrintSettings.visibility.unit
    ? [{ key: "unit", label: "단위", width: columnWidth.unit }]
    : []),
  { key: "quantity", label: "수량", width: columnWidth.quantity },
  ...(pdfPrintSettings.visibility.unitPrice
    ? [{ key: "unitPrice", label: "단가", width: columnWidth.unitPrice }]
    : []),
  ...(pdfPrintSettings.visibility.supplyAmount
    ? [
        {
          key: "supplyAmount",
          label: "공급가액",
          width: columnWidth.supplyAmount,
        },
      ]
    : []),
  ...(pdfPrintSettings.visibility.taxAmount
    ? [{ key: "taxAmount", label: "세액", width: columnWidth.taxAmount }]
    : []),
  { key: "memo", label: "비고", width: columnWidth.memo },
];

  const totalColumnWidth =
  visibleItemColumns.reduce((sum, column) => {
    const width = Number(column.width || 0);
    return sum + (width > 0 ? width : 1);
  }, 0) || 1;

  const firstAmountColumnIndex = visibleItemColumns.findIndex(
    (column) => column.key === "supplyAmount" || column.key === "taxAmount"
  );

  const summaryLabelColumnIndex =
    firstAmountColumnIndex > 1 ? firstAmountColumnIndex - 1 : 1;

  return (
    <div
      style={{
        width: "210mm",
        height: "297mm",
        background: "#ffffff",
        padding: "5mm",
        boxSizing: "border-box",
        color: "#111827",
        overflow: "hidden",
      }}
    >
      {(["supplier", "customer"] as const).map((copyType) => {
        const isSupplier = copyType === "supplier";
        const color = isSupplier
  ? selectedColorSet.supplier
  : selectedColorSet.customer;
        const copyLabel = isSupplier ? "공급자 보관용" : "공급받는자 보관용";
        const borderColor = getBorderColor(color);
const borderStyle = `${borderWeight} solid ${borderColor}`;

        return (
          <div
            key={copyType}
            style={{
              height: "136mm",
              marginBottom: isSupplier ? "7mm" : 0,
              paddingBottom: isSupplier ? "4mm" : 0,
              borderBottom: isSupplier ? "1px dashed #999" : "none",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <h2
  style={{
    margin: 0,
    textAlign: "center",
    color,
    fontSize: titleFontSize,
    letterSpacing: "8px",
    fontWeight: 800,
    lineHeight: "20px",
  }}
>
  {documentTitle}
</h2>

            <div
              style={{
                textAlign: "center",
                color,
                fontSize: "10px",
                fontWeight: 700,
                marginBottom: "0px",
                lineHeight: "12px",
              }}
            >
              [ {copyLabel} ]
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "0.94fr 1.06fr",
                gap: "4px",
                fontSize: bodyFontSize,
alignItems: "start",
                marginBottom: "1px",
              }}
            >
              <div
                style={{
                  height: "36mm",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 60px 1fr",
                    lineHeight: "24px",
                  }}
                >
                  <strong style={{ color }}>일 자 :</strong>
                  <span>{selectedStatement.statement_date}</span>

                  <strong style={{ color }}>등록번호 :</strong>
                  <span>
                    {selectedStatement.customer_business_no_snapshot || ""}
                  </span>

                  <strong style={{ color }}>거 래 처 :</strong>
                  <span style={{ gridColumn: "span 3" }}>
                    {selectedStatement.customer_name_snapshot || ""}
                  </span>

                  <strong style={{ color }}>주 소 :</strong>
                  <span style={{ gridColumn: "span 3" }}>
                    {selectedStatement.customer_address_snapshot || ""}
                  </span>

                  <strong style={{ color }}>전화번호 :</strong>
                  <span>{selectedStatement.customer_phone_snapshot || ""}</span>

                  {pdfPrintSettings.visibility.fax && (
                    <>
                      <strong style={{ color }}>팩스번호 :</strong>
                      <span></span>
                    </>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "2px",
                    border: borderStyle,
                    display: "grid",
                    gridTemplateColumns: "76px 1fr",
                    height: "20px",
                    alignItems: "center",
                    fontSize: "10px",
                    fontWeight: 800,
                  }}
                >
                  <div style={{ color, paddingLeft: "5px" }}>합계금액 :</div>
                  <div
                    style={{
                      textAlign: "right",
                      paddingRight: "8px",
                      fontSize: "15px",
                    }}
                  >
                    {formatCurrency(Number(selectedStatement.total_amount || 0))}
                  </div>
                </div>
              </div>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: bodyFontSize,
tableLayout: "fixed",
height: "10.5mm",
                }}
              >
                <colgroup>
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "36%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "30%" }} />
                </colgroup>

                <tbody>
                  <tr style={{ height: "2.1mm" }}>
                    <td
                      style={{
                        border: borderStyle,
                        color,
                        padding: "0 2px",
                        fontWeight: 700,
                      }}
                    >
                      등록번호
                    </td>
                    <td
  colSpan={3}
  style={{ border: borderStyle, padding: "0 2px" }}
>
  {organizationBusinessNumber}
</td>
                  </tr>

                  <tr style={{ height: "2.1mm" }}>
                    <td
                      style={{
                        border: borderStyle,
                        color,
                        padding: "0 2px",
                        fontWeight: 700,
                      }}
                    >
                      상호
                    </td>
                    <td style={{ border: borderStyle, padding: "0 2px" }}>
  {organizationName}
</td>
                    <td
                      style={{
                        border: borderStyle,
                        color,
                        padding: "0 2px",
                        fontWeight: 700,
                        textAlign: "center",
                      }}
                    >
                      성명
                    </td>
                    <td
  style={{
    border: borderStyle,
    padding: "0 4px",
    position: "relative",
  }}
>
  {/* 대표자명 */}
  <span
    style={{
      position: "relative",
      zIndex: 2,
      float: "left",
    }}
  >
    {organizationRepresentativeName}
  </span>

  {/* 인 표시 */}
  <span
    style={{
      position: "relative",
      zIndex: 2,
      float: "right",
    }}
  >
    (인)
  </span>

  {/* 도장 */}
  {organizationStampUrl && (
    <img
      src={organizationStampUrl}
      alt="회사 도장"
      crossOrigin="anonymous"
      style={{
        position: "absolute",
        right: "3px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "12mm",
        height: "12mm",
        objectFit: "contain",
        opacity: 0.9,
        zIndex: 1,
      }}
    />
  )}
</td>
                  </tr>

                  <tr style={{ height: "2.1mm" }}>
                    <td
                      style={{
                        border: borderStyle,
                        color,
                        padding: "0 2px",
                        fontWeight: 700,
                      }}
                    >
                      주소
                    </td>
                    <td
  colSpan={3}
  style={{ border: borderStyle, padding: "0 2px" }}
>
  {organizationAddress}
</td>
                  </tr>

                  {(pdfPrintSettings.visibility.businessType ||
                    pdfPrintSettings.visibility.businessItem) && (
                    <tr style={{ height: "2.1mm" }}>
                      {pdfPrintSettings.visibility.businessType ? (
                        <>
                          <td
                            style={{
                              border: borderStyle,
                              color,
                              padding: "0 2px",
                              fontWeight: 700,
                            }}
                          >
                            업태
                          </td>
                          <td
  style={{
    border: borderStyle,
    padding: "0 2px",
  }}
>
  {organizationBusinessType}
</td>
                        </>
                      ) : (
                        <>
                          <td
                            style={{
                              border: borderStyle,
                              padding: "0 2px",
                            }}
                          />
                          <td
                            style={{
                              border: borderStyle,
                              padding: "0 2px",
                            }}
                          />
                        </>
                      )}

                      {pdfPrintSettings.visibility.businessItem ? (
                        <>
                          <td
                            style={{
                              border: borderStyle,
                              color,
                              padding: "0 2px",
                              fontWeight: 700,
                              textAlign: "center",
                            }}
                          >
                            종목
                          </td>
                          <td
  style={{
    border: borderStyle,
    padding: "0 2px",
  }}
>
  {organizationBusinessItem}
</td>
                        </>
                      ) : (
                        <>
                          <td
                            style={{
                              border: borderStyle,
                              padding: "0 2px",
                            }}
                          />
                          <td
                            style={{
                              border: borderStyle,
                              padding: "0 2px",
                            }}
                          />
                        </>
                      )}
                    </tr>
                  )}

                  <tr style={{ height: "2.1mm" }}>
                    <td
                      style={{
                        border: borderStyle,
                        color,
                        padding: "0 2px",
                        fontWeight: 700,
                      }}
                    >
                      전화번호
                    </td>
                    <td style={{ border: borderStyle, padding: "0 2px" }}>
  {organizationPhone}
</td>

                    {pdfPrintSettings.visibility.fax ? (
                      <>
                        <td
                          style={{
                            border: borderStyle,
                            color,
                            padding: "0 2px",
                            fontWeight: 700,
                            textAlign: "center",
                            lineHeight: "1.1",
                          }}
                        >
                          팩스번호
                        </td>
                        <td
  style={{
    border: borderStyle,
    padding: "0 2px",
  }}
>
  {organizationFax}
</td>
                      </>
                    ) : (
                      <>
                        <td
                          style={{
                            border: borderStyle,
                            padding: "0 2px",
                          }}
                        />
                        <td
                          style={{
                            border: borderStyle,
                            padding: "0 2px",
                          }}
                        />
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "0px",
                fontSize: bodyFontSize,
tableLayout: "fixed",
              }}
            >
              <colgroup>
                {visibleItemColumns.map((column) => (
                  <col
  key={column.key}
  style={{
    width: `${((Number(column.width || 1) || 1) / totalColumnWidth) * 100}%`,
  }}
/>
                ))}
              </colgroup>

              <thead>
                <tr>
                  {visibleItemColumns.map((column) => (
                    <th
                      key={column.key}
                      style={{
                        border: borderStyle,
                        color,
                        padding: "1px 2px",
                        height: "16px",
                        textAlign: "center",
                        fontWeight: 800,
                      }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {Array.from({ length: 9 }).map((_, index) => {
                  const item = selectedItems[index];

                  return (
                    <tr key={index} style={{ height: "15px" }}>
                      {visibleItemColumns.map((column) => {
                        let value = "";

                        if (item) {
                          if (column.key === "date") {
                            value =
                              selectedStatement.statement_date?.slice(5) || "";
                          }

                          if (column.key === "product") {
                            value = item.product_name_snapshot || "";
                          }

                          if (column.key === "specification") {
                            value = item.specification_snapshot || "";
                          }

                          if (column.key === "unit") {
                            value = item.unit_snapshot || "";
                          }

                          if (column.key === "quantity") {
                            value = formatCurrency(Number(item.quantity || 0));
                          }

                          if (column.key === "unitPrice") {
                            value = formatCurrency(Number(item.unit_price || 0));
                          }

                          if (column.key === "supplyAmount") {
                            value = formatCurrency(
                              Number(item.supply_amount || 0)
                            );
                          }

                          if (column.key === "taxAmount") {
                            value = formatCurrency(Number(item.tax_amount || 0));
                          }
                        }

                        const isRightAlign = [
                          "quantity",
                          "unitPrice",
                          "supplyAmount",
                          "taxAmount",
                        ].includes(column.key);

                        const isCenterAlign = ["date", "unit"].includes(
                          column.key
                        );

                        return (
                          <td
                            key={column.key}
                            style={{
                              border: borderStyle,
                              padding: "0 2px",
                              height: "15px",
                              lineHeight: "15px",
                              textAlign: isRightAlign
                                ? "right"
                                : isCenterAlign
                                  ? "center"
                                  : "left",
                            }}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                <tr style={{ height: "16px" }}>
                  {visibleItemColumns.map((column, columnIndex) => {
                    let value = "";
                    let label = "";
                    let textAlign: "left" | "center" | "right" = "left";

                    if (
                      columnIndex === 0 &&
                      pdfPrintSettings.visibility.previousBalance
                    ) {
                      label = "전미수잔액";
                    }

                    if (columnIndex === summaryLabelColumnIndex) {
                      label = "합계";
                      textAlign = "center";
                    }

                    if (column.key === "supplyAmount") {
                      value = formatCurrency(
                        Number(selectedStatement.supply_amount || 0)
                      );
                      textAlign = "right";
                    }

                    if (column.key === "taxAmount") {
                      value = formatCurrency(
                        Number(selectedStatement.tax_amount || 0)
                      );
                      textAlign = "right";
                    }

                    return (
                      <td
                        key={`summary-${column.key}`}
                        style={{
                          border: borderStyle,
                          color: label ? color : "#111827",
                          padding: "1px 2px",
                          textAlign,
                          fontWeight: label || value ? 800 : 400,
                        }}
                      >
                        {label || value}
                      </td>
                    );
                  })}
                </tr>

                <tr style={{ height: "16px" }}>
                  {visibleItemColumns.map((column, columnIndex) => {
                    let label = "";
                    let value = "";
                    let textAlign: "left" | "center" | "right" = "left";

                    if (columnIndex === 0) {
                      label = "총합계";
                    }

                    if (column.key === "product") {
                      value = formatCurrency(
                        Number(selectedStatement.total_amount || 0)
                      );
                      textAlign = "right";
                    }

                    if (
                      column.key === "quantity" &&
                      pdfPrintSettings.visibility.paidAmount
                    ) {
                      label = "입금액";
                    }

                    if (
                      column.key === "unitPrice" &&
                      pdfPrintSettings.visibility.paidAmount
                    ) {
                      value = formatCurrency(getPaidAmount(selectedStatement));
                      textAlign = "right";
                    }

                    if (
                      column.key === "supplyAmount" &&
                      pdfPrintSettings.visibility.remainingAmount
                    ) {
                      label = "총미수잔액";
                    }

                    if (
                      column.key === "taxAmount" &&
                      pdfPrintSettings.visibility.remainingAmount
                    ) {
                      value = formatCurrency(
                        getRemainingAmount(selectedStatement)
                      );
                      textAlign = "right";
                    }

                    if (
                      column.key === "memo" &&
                      pdfPrintSettings.visibility.receiver
                    ) {
                      label = "인수자";
                    }

                    return (
                      <td
                        key={`total-${column.key}`}
                        style={{
                          border: borderStyle,
                          color: label ? color : "#111827",
                          padding: "1px 2px",
                          textAlign,
                          fontWeight: label || value ? 800 : 400,
                        }}
                      >
                        {label || value}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
                        </table>

            {(organizationLogoUrl || footerMemoText) && (
  <div
    style={{
      marginTop: "5mm",
      minHeight: "14mm",
    }}
  >
    {(organizationLogoUrl ||
      organizationName ||
      organizationPhone ||
      organizationAddress) && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "6mm",
        }}
      >
        {organizationLogoUrl && (
          <img
            src={organizationLogoUrl}
            alt="회사 로고"
            crossOrigin="anonymous"
            style={{
              maxWidth: "35mm",
              maxHeight: "12mm",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
        )}

        <div
          style={{
            fontSize: "8px",
            lineHeight: 1.5,
            color: "#555",
            whiteSpace: "pre-line",
          }}
        >
          {organizationName && <div>{organizationName}</div>}
          {organizationPhone && <div>TEL. {organizationPhone}</div>}
          {organizationAddress && <div>{organizationAddress}</div>}
        </div>
      </div>
    )}

    {footerMemoText && (
      <div
        style={{
          marginTop: "2mm",
          fontSize: "8px",
          lineHeight: 1.5,
          color: "#555",
          whiteSpace: "pre-line",
          textAlign: "left",
        }}
      >
        {footerMemoText}
      </div>
    )}
  </div>
)}

          </div>
        );
      })}
    </div>
  );
}