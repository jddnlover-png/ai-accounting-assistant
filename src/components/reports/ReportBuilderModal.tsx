import { useEffect, useMemo, useState } from "react";
import type {
  ReportBorderWidth,
  ReportColumnDefinition,
  ReportSettings,
  ReportThemeTemplate,
  ReportType,
} from "../../types/reportSettings";
import {
  BASIC_REPORT_TYPES,
  PREMIUM_REPORT_TYPES,
  REPORT_TYPE_DEFINITIONS,
  createDefaultReportSettings,
  createReportSettingsByType,
} from "../../types/reportSettings";
import ReportPreview from "./ReportPreview";

interface ReportBuilderModalProps {
  isOpen: boolean;
  initialSettings?: ReportSettings | null;
  organizationName?: string;
  onClose: () => void;
  onSave: (settings: ReportSettings) => void;
}

type OpenSectionKey =
  | "basic"
  | "visibility"
  | "period"
  | "columns"
  | "design"
  | "footer";

interface SectionCardProps {
  title: string;
  sectionKey: OpenSectionKey;
  description?: string;
  isOpen: boolean;
  onToggle: (key: OpenSectionKey) => void;
  children: React.ReactNode;
}

function SectionCard({
  title,
  sectionKey,
  description,
  isOpen,
  onToggle,
  children,
}: SectionCardProps) {
  return (
    <section
      style={{
        width: "100%",
        flexShrink: 0,
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        background: "#ffffff",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        style={{
          width: "100%",
          minHeight: "54px",
          padding: "10px 16px",
          border: "none",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div>
          <div
            style={{
              color: "#111827",
              fontSize: "14px",
              fontWeight: 800,
            }}
          >
            {title}
          </div>

          {description && (
            <div
              style={{
                marginTop: "3px",
                color: "#6b7280",
                fontSize: "11px",
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>
          )}
        </div>

        <span
          style={{
            color: "#6b7280",
            fontSize: "12px",
          }}
        >
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            padding: "0 16px 16px",
          }}
        >
          {children}
        </div>
      )}
    </section>
  );
}

const cloneReportSettings = (
  settings: ReportSettings,
): ReportSettings =>
  createDefaultReportSettings({
    ...settings,

    columns: settings.columns.map((column) => ({
      ...column,
    })),

    visibility: {
      ...settings.visibility,
    },

    columnWidth: {
      ...settings.columnWidth,
    },

    typography: {
      ...settings.typography,
    },

    border: {
      ...settings.border,
    },

    theme: {
      ...settings.theme,
    },

    footer: {
      ...settings.footer,
    },

    filter: {
      ...settings.filter,

      period: settings.filter.period
        ? {
            ...settings.filter.period,
          }
        : undefined,
    },

    sort: settings.sort.map((sort) => ({
      ...sort,
    })),

    permission: {
      ...settings.permission,
    },
  });

const getInitialSettings = (
  initialSettings?: ReportSettings | null,
): ReportSettings => {
  if (initialSettings) {
    return cloneReportSettings(initialSettings);
  }

  return createReportSettingsByType(
    "accounts_receivable_ledger",
  );
};

const moveArrayItem = <T,>(
  items: T[],
  fromIndex: number,
  toIndex: number,
): T[] => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);

  nextItems.splice(toIndex, 0, movedItem);

  return nextItems;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "40px",
  padding: "0 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#111827",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "7px",
  color: "#374151",
  fontSize: "13px",
  fontWeight: 700,
};

const descriptionStyle: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: 1.5,
};

export default function ReportBuilderModal({
  isOpen,
  initialSettings,
  organizationName = "회사명",
  onClose,
  onSave,
}: ReportBuilderModalProps) {
  const [settings, setSettings] = useState<ReportSettings>(() =>
    getInitialSettings(initialSettings),
  );

  const [openSections, setOpenSections] = useState<
    Record<OpenSectionKey, boolean>
  >({
    basic: true,
    visibility: true,
    period: false,
    columns: true,
    design: false,
    footer: false,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSettings(getInitialSettings(initialSettings));
  }, [initialSettings, isOpen]);

  const reportDefinition = useMemo(
    () => REPORT_TYPE_DEFINITIONS[settings.type],
    [settings.type],
  );

  const visibleColumnCount = useMemo(
    () =>
      settings.columns.filter((column) => column.visible)
        .length,
    [settings.columns],
  );

  const toggleSection = (key: OpenSectionKey) => {
    setOpenSections((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const updateSettings = (
    updater: (current: ReportSettings) => ReportSettings,
  ) => {
    setSettings((current) => updater(current));
  };

  const handleReportTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextType = event.target.value as ReportType;
    const nextSettings = createReportSettingsByType(nextType);

    updateSettings((current) => {
      const currentDefaultName =
        REPORT_TYPE_DEFINITIONS[current.type].name;

      const shouldReplaceName =
        current.name.trim() === "" ||
        current.name === currentDefaultName;

      return {
        ...nextSettings,

        name: shouldReplaceName
          ? nextSettings.name
          : current.name,

        favorite: current.favorite,

        permission: {
          ...current.permission,
        },
      };
    });
  };

  const handleColumnVisibilityChange = (
    columnKey: string,
    checked: boolean,
  ) => {
    updateSettings((current) => ({
      ...current,

      columns: current.columns.map((column) =>
        column.key === columnKey
          ? {
              ...column,
              visible: checked,
            }
          : column,
      ),
    }));
  };

  const handleColumnWidthChange = (
    columnKey: string,
    value: string,
  ) => {
    if (value === "") {
      return;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    const nextWidth = Math.min(
      Math.max(Math.round(parsedValue), 50),
      400,
    );

    updateSettings((current) => ({
      ...current,

      columns: current.columns.map((column) =>
        column.key === columnKey
          ? {
              ...column,
              width: nextWidth,
            }
          : column,
      ),

      columnWidth: {
        ...current.columnWidth,
        [columnKey]: nextWidth,
      },
    }));
  };

  const handleMoveColumn = (
    columnIndex: number,
    direction: "up" | "down",
  ) => {
    const targetIndex =
      direction === "up"
        ? columnIndex - 1
        : columnIndex + 1;

    updateSettings((current) => ({
      ...current,

      columns: moveArrayItem(
        current.columns,
        columnIndex,
        targetIndex,
      ),
    }));
  };

  const handleTypographyChange = (
    key: keyof ReportSettings["typography"],
    value: string,
  ) => {
    if (value === "") {
      return;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    const minimum =
      key === "titleFontSize" ? 12 : 8;

    const maximum =
      key === "titleFontSize" ? 36 : 20;

    const nextValue = Math.min(
      Math.max(Math.round(parsedValue), minimum),
      maximum,
    );

    updateSettings((current) => ({
      ...current,

      typography: {
        ...current.typography,
        [key]: nextValue,
      },
    }));
  };

  const handlePeriodChange = (
    key: "startDate" | "endDate",
    value: string,
  ) => {
    updateSettings((current) => ({
      ...current,

      filter: {
        ...current.filter,

        period: {
          ...current.filter.period,
          [key]: value || undefined,
        },
      },
    }));
  };

  const handleReset = () => {
    setSettings(
      createReportSettingsByType(settings.type),
    );
  };

  const handleSave = () => {
    const trimmedName = settings.name.trim();

    if (!trimmedName) {
      window.alert("보고서 이름을 입력해주세요.");
      return;
    }

    if (visibleColumnCount === 0) {
      window.alert(
        "하나 이상의 컬럼을 표시하도록 설정해주세요.",
      );
      return;
    }

    const settingsToSave = cloneReportSettings({
      ...settings,
      name: trimmedName,
    });

    onSave(settingsToSave);
  };

  const renderColumnSetting = (
    column: ReportColumnDefinition,
    index: number,
  ) => {
    const savedWidth =
      settings.columnWidth[column.key] ??
      column.width;

    const isFirst = index === 0;
    const isLast =
      index === settings.columns.length - 1;

    return (
      <div
        key={column.key}
        style={{
          width: "100%",
          padding: "10px 11px",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          background: "#f9fafb",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "22px minmax(90px, 1fr) 108px 69px",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <input
            type="checkbox"
            checked={column.visible}
            onChange={(event) =>
              handleColumnVisibilityChange(
                column.key,
                event.target.checked,
              )
            }
            style={{
              width: "17px",
              height: "17px",
              margin: 0,
              cursor: "pointer",
            }}
          />

          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              style={{
                color: "#111827",
                fontSize: "13px",
                fontWeight: 800,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={column.label}
            >
              {column.label}
            </div>

            <div
              style={{
                marginTop: "2px",
                color: "#9ca3af",
                fontSize: "10px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={column.key}
            >
              {column.key}
            </div>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
            }}
          >
            <input
              id={`column-width-${column.key}`}
              type="number"
              min={50}
              max={400}
              step={10}
              value={savedWidth}
              onChange={(event) =>
                handleColumnWidthChange(
                  column.key,
                  event.target.value,
                )
              }
              aria-label={`${column.label} 컬럼 폭`}
              style={{
                width: "100%",
                height: "34px",
                padding: "0 29px 0 8px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#111827",
                fontSize: "12px",
                textAlign: "right",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <span
              style={{
                position: "absolute",
                top: "50%",
                right: "8px",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                fontSize: "10px",
                pointerEvents: "none",
              }}
            >
              px
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "32px 32px",
              gap: "5px",
            }}
          >
            <button
              type="button"
              disabled={isFirst}
              onClick={() =>
                handleMoveColumn(index, "up")
              }
              aria-label={`${column.label} 위로 이동`}
              title="위로 이동"
              style={{
                width: "32px",
                height: "32px",
                padding: 0,
                border: "1px solid #d1d5db",
                borderRadius: "7px",
                background: isFirst
                  ? "#f3f4f6"
                  : "#ffffff",
                color: isFirst
                  ? "#cbd5e1"
                  : "#374151",
                cursor: isFirst
                  ? "not-allowed"
                  : "pointer",
                fontSize: "10px",
              }}
            >
              ▲
            </button>

            <button
              type="button"
              disabled={isLast}
              onClick={() =>
                handleMoveColumn(index, "down")
              }
              aria-label={`${column.label} 아래로 이동`}
              title="아래로 이동"
              style={{
                width: "32px",
                height: "32px",
                padding: 0,
                border: "1px solid #d1d5db",
                borderRadius: "7px",
                background: isLast
                  ? "#f3f4f6"
                  : "#ffffff",
                color: isLast
                  ? "#cbd5e1"
                  : "#374151",
                cursor: isLast
                  ? "not-allowed"
                  : "pointer",
                fontSize: "10px",
              }}
            >
              ▼
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20000,
        padding: "12px",
        background: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "min(98vw, 1560px)",
          height: "94vh",
          overflow: "hidden",
          background: "#ffffff",
          borderRadius: "18px",
          boxShadow:
            "0 28px 70px rgba(15, 23, 42, 0.35)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            minHeight: "64px",
            padding: "0 20px",
            borderBottom: "1px solid #e5e7eb",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                color: "#111827",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              보고서 만들기
            </h3>

            <p
              style={{
                margin: "4px 0 0",
                color: "#6b7280",
                fontSize: "12px",
              }}
            >
              보고서 항목과 디자인을 설정하고 오른쪽
              미리보기에서 바로 확인합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-sm font-medium"
          >
            닫기
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(400px, 0.72fr) minmax(660px, 1.28fr)",
            gap: "14px",
            padding: "14px 16px",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: "5px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              scrollBehavior: "auto",
              overflowAnchor: "none",
            }}
          >
            <SectionCard
              title="📄 기본 설정"
              sectionKey="basic"
              description="보고서 종류와 이름을 설정합니다."
              isOpen={openSections.basic}
              onToggle={toggleSection}
            >
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    htmlFor="report-type"
                    style={labelStyle}
                  >
                    보고서 종류
                  </label>

                  <select
                    id="report-type"
                    value={settings.type}
                    onChange={handleReportTypeChange}
                    style={selectStyle}
                  >
                    <optgroup label="기본 보고서">
                      {BASIC_REPORT_TYPES.map(
                        (reportType) => (
                          <option
                            key={reportType}
                            value={reportType}
                          >
                            {
                              REPORT_TYPE_DEFINITIONS[
                                reportType
                              ].name
                            }
                          </option>
                        ),
                      )}
                    </optgroup>

                    <optgroup label="프리미엄 보고서">
                      {PREMIUM_REPORT_TYPES.map(
                        (reportType) => (
                          <option
                            key={reportType}
                            value={reportType}
                          >
                            {
                              REPORT_TYPE_DEFINITIONS[
                                reportType
                              ].name
                            }
                          </option>
                        ),
                      )}
                    </optgroup>
                  </select>

                  <p style={descriptionStyle}>
                    {reportDefinition.description}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="report-name"
                    style={labelStyle}
                  >
                    보고서 이름
                  </label>

                  <input
                    id="report-name"
                    type="text"
                    value={settings.name}
                    maxLength={100}
                    onChange={(event) =>
                      updateSettings((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="보고서 이름 입력"
                    style={inputStyle}
                  />
                </div>

                <label
                  style={{
                    padding: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    background: "#f9fafb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#111827",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                    >
                      ⭐ 즐겨찾기
                    </div>

                    <div
                      style={{
                        marginTop: "3px",
                        color: "#6b7280",
                        fontSize: "11px",
                      }}
                    >
                      자주 사용하는 보고서로 표시합니다.
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={settings.favorite}
                    onChange={(event) =>
                      updateSettings((current) => ({
                        ...current,
                        favorite: event.target.checked,
                      }))
                    }
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                    }}
                  />
                </label>
              </div>
            </SectionCard>

            <SectionCard
              title="📋 표시 설정"
              sectionKey="visibility"
              description="보고서 상단과 하단의 표시 항목을 선택합니다."
              isOpen={openSections.visibility}
              onToggle={toggleSection}
            >
              <div
                style={{
                  display: "grid",
                  gap: "8px",
                }}
              >
                {[
                  {
                    key: "showTitle" as const,
                    label: "보고서 제목",
                  },
                  {
                    key: "showOrganizationInfo" as const,
                    label: "회사정보",
                  },
                  {
                    key: "showPeriod" as const,
                    label: "조회기간",
                  },
                  {
                    key: "showFilterSummary" as const,
                    label: "조회조건",
                  },
                  {
                    key: "showFooter" as const,
                    label: "하단 문구",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    style={{
                      minHeight: "42px",
                      padding: "0 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "9px",
                      background: "#f9fafb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        color: "#374151",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {item.label}
                    </span>

                    <input
                      type="checkbox"
                      checked={
                        settings.visibility[item.key]
                      }
                      onChange={(event) =>
                        updateSettings((current) => ({
                          ...current,

                          visibility: {
                            ...current.visibility,
                            [item.key]:
                              event.target.checked,
                          },
                        }))
                      }
                      style={{
                        width: "17px",
                        height: "17px",
                        cursor: "pointer",
                      }}
                    />
                  </label>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="📅 조회기간"
              sectionKey="period"
              description="보고서를 열 때 사용할 기본 기간을 설정합니다."
              isOpen={openSections.period}
              onToggle={toggleSection}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    htmlFor="report-start-date"
                    style={labelStyle}
                  >
                    시작일
                  </label>

                  <input
                    id="report-start-date"
                    type="date"
                    value={
                      settings.filter.period?.startDate ??
                      ""
                    }
                    onChange={(event) =>
                      handlePeriodChange(
                        "startDate",
                        event.target.value,
                      )
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label
                    htmlFor="report-end-date"
                    style={labelStyle}
                  >
                    종료일
                  </label>

                  <input
                    id="report-end-date"
                    type="date"
                    value={
                      settings.filter.period?.endDate ??
                      ""
                    }
                    onChange={(event) =>
                      handlePeriodChange(
                        "endDate",
                        event.target.value,
                      )
                    }
                    style={inputStyle}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title={`📐 컬럼 설정 (${visibleColumnCount}/${settings.columns.length})`}
              sectionKey="columns"
              description="표시 여부, 컬럼 순서와 폭을 설정합니다."
              isOpen={openSections.columns}
              onToggle={toggleSection}
            >
              {settings.columns.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {settings.columns.map(
                    renderColumnSetting,
                  )}
                </div>
              ) : (
                <div
                  style={{
                    padding: "24px 16px",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#374151",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    아직 제공되지 않는 보고서입니다.
                  </div>

                  <div
                    style={{
                      marginTop: "6px",
                      color: "#6b7280",
                      fontSize: "12px",
                    }}
                  >
                    Inventory Platform 개발 시 컬럼과
                    데이터가 추가됩니다.
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="🎨 디자인"
              sectionKey="design"
              description="글자 크기, 테마와 테두리를 설정합니다."
              isOpen={openSections.design}
              onToggle={toggleSection}
            >
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(3, minmax(0, 1fr))",
                    gap: "10px",
                  }}
                >
                  <div>
                    <label
                      htmlFor="title-font-size"
                      style={labelStyle}
                    >
                      제목
                    </label>

                    <input
                      id="title-font-size"
                      type="number"
                      min={12}
                      max={36}
                      value={
                        settings.typography.titleFontSize
                      }
                      onChange={(event) =>
                        handleTypographyChange(
                          "titleFontSize",
                          event.target.value,
                        )
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="body-font-size"
                      style={labelStyle}
                    >
                      본문
                    </label>

                    <input
                      id="body-font-size"
                      type="number"
                      min={8}
                      max={20}
                      value={
                        settings.typography.bodyFontSize
                      }
                      onChange={(event) =>
                        handleTypographyChange(
                          "bodyFontSize",
                          event.target.value,
                        )
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="footer-font-size"
                      style={labelStyle}
                    >
                      하단
                    </label>

                    <input
                      id="footer-font-size"
                      type="number"
                      min={8}
                      max={20}
                      value={
                        settings.typography.footerFontSize
                      }
                      onChange={(event) =>
                        handleTypographyChange(
                          "footerFontSize",
                          event.target.value,
                        )
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="report-theme"
                    style={labelStyle}
                  >
                    테마
                  </label>

                  <select
                    id="report-theme"
                    value={settings.theme.template}
                    onChange={(event) =>
                      updateSettings((current) => ({
                        ...current,

                        theme: {
                          ...current.theme,
                          template: event.target
                            .value as ReportThemeTemplate,
                        },
                      }))
                    }
                    style={selectStyle}
                  >
                    <option value="basic">기본</option>
                    <option value="modern">모던</option>
                    <option value="compact">
                      컴팩트
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="report-border"
                    style={labelStyle}
                  >
                    테두리 굵기
                  </label>

                  <select
                    id="report-border"
                    value={settings.border.borderWidth}
                    onChange={(event) =>
                      updateSettings((current) => ({
                        ...current,

                        border: {
                          ...current.border,
                          borderWidth: event.target
                            .value as ReportBorderWidth,
                        },
                      }))
                    }
                    style={selectStyle}
                  >
                    <option value="thin">얇게</option>
                    <option value="normal">보통</option>
                    <option value="bold">굵게</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="📝 하단 문구"
              sectionKey="footer"
              description="보고서 마지막에 표시할 내용을 입력합니다."
              isOpen={openSections.footer}
              onToggle={toggleSection}
            >
              <textarea
                value={settings.footer.text}
                onChange={(event) =>
                  updateSettings((current) => ({
                    ...current,

                    footer: {
                      ...current.footer,
                      text: event.target.value,
                    },
                  }))
                }
                rows={4}
                maxLength={500}
                placeholder="예: 본 보고서는 내부 관리용입니다."
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#111827",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              <div
                style={{
                  marginTop: "6px",
                  color: "#9ca3af",
                  fontSize: "11px",
                  textAlign: "right",
                }}
              >
                {settings.footer.text.length}/500
              </div>
            </SectionCard>

            <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
              설정을 변경하면 보고서 미리보기에 즉시
              반영됩니다. 현재 단계에서는 저장 결과가
              Reports 화면으로 전달되며, DB 저장은 이후
              단계에서 연결합니다.
            </div>
          </div>

          <div
            style={{
              minHeight: 0,
              padding: "10px",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              background: "#ffffff",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                marginBottom: "8px",
                flexShrink: 0,
              }}
            >
              <h4
                style={{
                  margin: 0,
                  color: "#111827",
                  fontSize: "14px",
                  fontWeight: 800,
                }}
              >
                실시간 미리보기
              </h4>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#6b7280",
                  fontSize: "11px",
                }}
              >
                보고서 전체가 화면 폭에 맞춰 자동으로
                축소됩니다.
              </p>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <ReportPreview
                settings={settings}
                organizationName={organizationName}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            minHeight: "62px",
            padding: "0 20px",
            borderTop: "1px solid #e5e7eb",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border px-5 py-2 text-sm font-medium"
          >
            기본값 복원
          </button>

          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-2 text-sm font-medium"
            >
              취소
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={
                settings.name.trim() === "" ||
                visibleColumnCount === 0
              }
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              보고서 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}