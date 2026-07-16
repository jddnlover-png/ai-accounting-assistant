import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ReportColumnDefinition,
  ReportSettings,
} from "../../types/reportSettings";

type ReportPreviewRow = Record<
  string,
  string | number | null | undefined
>;

interface ReportPreviewProps {
  settings: ReportSettings;
  rows?: ReportPreviewRow[];
  organizationName?: string;
  previewTitle?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ko-KR").format(value);

const formatPreviewValue = (
  value: string | number | null | undefined,
  columnKey: string,
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  const currencyColumnKeys = [
    "salesAmount",
    "paymentAmount",
    "receivableAmount",
    "balance",
    "supplyAmount",
    "taxAmount",
    "totalAmount",
    "allocatedAmount",
    "unallocatedAmount",
    "inventoryValue",
    "costAmount",
    "marginAmount",
  ];

  const quantityColumnKeys = [
    "salesQuantity",
    "inventoryQuantity",
    "stockInQuantity",
    "stockOutQuantity",
    "remainingQuantity",
  ];

  if (
    typeof value === "number" &&
    [
      ...currencyColumnKeys,
      ...quantityColumnKeys,
    ].includes(columnKey)
  ) {
    return formatCurrency(value);
  }

  return String(value);
};

const getDefaultPreviewRows = (
  reportType: ReportSettings["type"],
): ReportPreviewRow[] => {
  switch (reportType) {
    case "accounts_receivable_ledger":
      return [
        {
          date: "2026-07-01",
          customerName: "한빛상사",
          description: "거래명세표 매출",
          salesAmount: 550000,
          paymentAmount: 300000,
          receivableAmount: 250000,
          status: "부분입금",
        },
        {
          date: "2026-07-03",
          customerName: "대한유통",
          description: "거래명세표 매출",
          salesAmount: 330000,
          paymentAmount: 0,
          receivableAmount: 330000,
          status: "미입금",
        },
        {
          date: "2026-07-08",
          customerName: "새봄산업",
          description: "거래명세표 매출",
          salesAmount: 220000,
          paymentAmount: 220000,
          receivableAmount: 0,
          status: "입금완료",
        },
      ];

    case "customer_ledger":
      return [
        {
          date: "2026-07-01",
          customerName: "한빛상사",
          transactionType: "매출",
          description: "제품 판매",
          salesAmount: 550000,
          paymentAmount: 0,
          balance: 550000,
          memo: "",
        },
        {
          date: "2026-07-05",
          customerName: "한빛상사",
          transactionType: "입금",
          description: "계좌이체",
          salesAmount: 0,
          paymentAmount: 300000,
          balance: 250000,
          memo: "국민은행",
        },
      ];

    case "sales_report":
      return [
        {
          date: "2026-07-01",
          statementNumber: "ST-202607-001",
          customerName: "한빛상사",
          supplyAmount: 500000,
          taxAmount: 50000,
          totalAmount: 550000,
          taxInvoiceIssued: "발행",
          memo: "",
        },
        {
          date: "2026-07-03",
          statementNumber: "ST-202607-002",
          customerName: "대한유통",
          supplyAmount: 300000,
          taxAmount: 30000,
          totalAmount: 330000,
          taxInvoiceIssued: "미발행",
          memo: "월말 발행",
        },
      ];

    case "payment_report":
      return [
        {
          paymentDate: "2026-07-05",
          customerName: "한빛상사",
          paymentMethod: "계좌이체",
          depositorName: "한빛상사",
          paymentAmount: 300000,
          allocatedAmount: 300000,
          unallocatedAmount: 0,
          memo: "",
        },
        {
          paymentDate: "2026-07-07",
          customerName: "대한유통",
          paymentMethod: "현금",
          depositorName: "김대표",
          paymentAmount: 200000,
          allocatedAmount: 150000,
          unallocatedAmount: 50000,
          memo: "잔액 추후 배분",
        },
      ];

    case "item_sales_analysis":
      return [
        {
          itemName: "샘플 품목 A",
          specification: "10kg",
          unit: "박스",
          salesQuantity: 120,
          salesAmount: 2400000,
          customerName: "한빛상사",
          transactionDate: "2026-07-01",
        },
        {
          itemName: "샘플 품목 B",
          specification: "20kg",
          unit: "개",
          salesQuantity: 85,
          salesAmount: 1700000,
          customerName: "대한유통",
          transactionDate: "2026-07-03",
        },
      ];

    default:
      return [];
  }
};

const getBorderWidth = (
  borderWidth: ReportSettings["border"]["borderWidth"],
) => {
  switch (borderWidth) {
    case "thin":
      return "1px";

    case "bold":
      return "2px";

    case "normal":
    default:
      return "1.5px";
  }
};

const getThemeStyles = (
  template: ReportSettings["theme"]["template"],
) => {
  switch (template) {
    case "modern":
      return {
        headerBackground: "#eef2f7",
        titleWeight: 700,
        containerRadius: "12px",
      };

    case "compact":
      return {
        headerBackground: "#f8fafc",
        titleWeight: 600,
        containerRadius: "4px",
      };

    case "basic":
    default:
      return {
        headerBackground: "#f8fafc",
        titleWeight: 700,
        containerRadius: "8px",
      };
  }
};

const getColumnWidth = (
  column: ReportColumnDefinition,
  settings: ReportSettings,
) => {
  const savedWidth =
    settings.columnWidth[column.key];

  if (
    typeof savedWidth === "number" &&
    Number.isFinite(savedWidth) &&
    savedWidth > 0
  ) {
    return savedWidth;
  }

  return column.width;
};

export function ReportPreview({
  settings,
  rows,
  organizationName = "회사명",
  previewTitle,
}: ReportPreviewProps) {
  const previewViewportRef =
    useRef<HTMLDivElement | null>(null);

  const [previewScale, setPreviewScale] =
    useState(1);

  const visibleColumns = useMemo(
    () =>
      settings.columns.filter(
        (column) => column.visible,
      ),
    [settings.columns],
  );

  const previewRows = useMemo(
    () =>
      rows ??
      getDefaultPreviewRows(settings.type),
    [rows, settings.type],
  );

  const totalTableWidth = useMemo(
    () =>
      visibleColumns.reduce(
        (total, column) =>
          total +
          getColumnWidth(column, settings),
        0,
      ),
    [settings, visibleColumns],
  );

  const reportCanvasWidth = useMemo(
    () =>
      Math.max(
        totalTableWidth + 56,
        760,
      ),
    [totalTableWidth],
  );

  const borderWidth = getBorderWidth(
    settings.border.borderWidth,
  );

  const themeStyles = getThemeStyles(
    settings.theme.template,
  );

  useEffect(() => {
    const viewport =
      previewViewportRef.current;

    if (!viewport) {
      return;
    }

    const updateScale = () => {
      const availableWidth =
        viewport.clientWidth - 24;

      const availableHeight =
        viewport.clientHeight - 24;

      if (
        availableWidth <= 0 ||
        availableHeight <= 0
      ) {
        return;
      }

      const widthScale =
        availableWidth / reportCanvasWidth;

      const heightScale =
        availableHeight / 690;

      const nextScale = Math.min(
        widthScale,
        heightScale,
        1,
      );

      setPreviewScale(
        Math.max(nextScale, 0.45),
      );
    };

    updateScale();

    const resizeObserver =
      new ResizeObserver(updateScale);

    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, [reportCanvasWidth]);

  const periodText = useMemo(() => {
    const startDate =
      settings.filter.period?.startDate;

    const endDate =
      settings.filter.period?.endDate;

    if (startDate && endDate) {
      return `${startDate} ~ ${endDate}`;
    }

    if (startDate) {
      return `${startDate} 이후`;
    }

    if (endDate) {
      return `${endDate} 이전`;
    }

    return "2026-07-01 ~ 2026-07-31";
  }, [
    settings.filter.period?.endDate,
    settings.filter.period?.startDate,
  ]);

  const filterSummary = useMemo(() => {
    const filters: string[] = [];

    if (settings.filter.customerId) {
      filters.push("거래처 지정");
    }

    if (settings.filter.status) {
      filters.push(
        `상태: ${settings.filter.status}`,
      );
    }

    return filters.length > 0
      ? filters.join(" · ")
      : "전체 거래처";
  }, [
    settings.filter.customerId,
    settings.filter.status,
  ]);

  if (visibleColumns.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: "320px",
          padding: "24px",
          border: "1px dashed #cbd5e1",
          borderRadius: "10px",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#111827",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            표시할 컬럼이 없습니다.
          </p>

          <p
            style={{
              margin: "6px 0 0",
              color: "#6b7280",
              fontSize: "12px",
            }}
          >
            보고서 설정에서 하나 이상의 컬럼을
            선택하세요.
          </p>
        </div>
      </div>
    );
  }

  const scaledCanvasWidth =
    reportCanvasWidth * previewScale;

  const scaledCanvasHeight =
    690 * previewScale;

  return (
    <div
      ref={previewViewportRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "480px",
        overflow: "hidden",
        padding: "12px",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        background: "#f8fafc",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: scaledCanvasWidth,
          height: scaledCanvasHeight,
          margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          style={{
            width: reportCanvasWidth,
            minHeight: "690px",
            padding:
              settings.theme.template ===
              "compact"
                ? "20px"
                : "28px",
            borderRadius:
              themeStyles.containerRadius,
            background: "#ffffff",
            color: "#0f172a",
            boxShadow:
              "0 6px 18px rgba(15, 23, 42, 0.08)",
            transform: `scale(${previewScale})`,
            transformOrigin: "top left",
            boxSizing: "border-box",
          }}
        >
          {settings.visibility
            .showOrganizationInfo && (
            <div
              style={{
                marginBottom: "12px",
                color: "#475569",
                fontSize: Math.max(
                  settings.typography.bodyFontSize -
                    1,
                  9,
                ),
              }}
            >
              {organizationName}
            </div>
          )}

          {settings.visibility.showTitle && (
            <h2
              style={{
                margin: 0,
                color: "#0f172a",
                textAlign: "center",
                fontSize:
                  settings.typography.titleFontSize,
                fontWeight:
                  themeStyles.titleWeight,
                lineHeight: 1.3,
              }}
            >
              {previewTitle ?? settings.name}
            </h2>
          )}

          <div
            style={{
              minHeight: "20px",
              marginTop: "18px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              color: "#475569",
              fontSize: Math.max(
                settings.typography.bodyFontSize -
                  1,
                9,
              ),
            }}
          >
            {settings.visibility.showPeriod ? (
              <span>조회기간: {periodText}</span>
            ) : (
              <span />
            )}

            {settings.visibility
              .showFilterSummary && (
              <span>
                조회조건: {filterSummary}
              </span>
            )}
          </div>

          <table
            style={{
              width: totalTableWidth,
              minWidth: "100%",
              tableLayout: "fixed",
              borderCollapse: "collapse",
              fontSize:
                settings.typography.bodyFontSize,
            }}
          >
            <colgroup>
              {visibleColumns.map((column) => (
                <col
                  key={column.key}
                  style={{
                    width: getColumnWidth(
                      column,
                      settings,
                    ),
                  }}
                />
              ))}
            </colgroup>

            <thead>
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    style={{
                      padding:
                        settings.theme.template ===
                        "compact"
                          ? "6px 5px"
                          : "8px 6px",
                      border: `${borderWidth} solid #94a3b8`,
                      background:
                        themeStyles.headerBackground,
                      textAlign: "center",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {previewRows.length > 0 ? (
                previewRows.map(
                  (row, rowIndex) => (
                    <tr
                      key={`preview-row-${rowIndex}`}
                    >
                      {visibleColumns.map(
                        (column) => (
                          <td
                            key={`${rowIndex}-${column.key}`}
                            title={formatPreviewValue(
                              row[column.key],
                              column.key,
                            )}
                            style={{
                              padding:
                                settings.theme
                                  .template ===
                                "compact"
                                  ? "5px"
                                  : "7px 6px",
                              border: `${borderWidth} solid #cbd5e1`,
                              textAlign:
                                column.align ??
                                "left",
                              verticalAlign:
                                "middle",
                              overflow: "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatPreviewValue(
                              row[column.key],
                              column.key,
                            )}
                          </td>
                        ),
                      )}
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={
                      visibleColumns.length
                    }
                    style={{
                      padding: "40px 16px",
                      border: `${borderWidth} solid #cbd5e1`,
                      color: "#64748b",
                      textAlign: "center",
                    }}
                  >
                    미리보기 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {settings.visibility.showFooter && (
            <div
              style={{
                minHeight: "24px",
                marginTop: "16px",
                color: "#475569",
                fontSize:
                  settings.typography.footerFontSize,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}
            >
              {settings.footer.text ||
                "보고서 하단에 표시할 문구를 입력할 수 있습니다."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportPreview;