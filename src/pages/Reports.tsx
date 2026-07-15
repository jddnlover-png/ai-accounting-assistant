import { useMemo, useState } from "react";
import ReportBuilderModal from "../components/reports/ReportBuilderModal";
import {
  BASIC_REPORT_TYPES,
  PREMIUM_REPORT_TYPES,
  REPORT_TYPE_DEFINITIONS,
  createReportSettingsByType,
  type ReportSettings,
  type ReportType,
} from "../types/reportSettings";

type SavedReport = ReportSettings & {
  localId: string;
};

const createLocalId = () =>
  `report-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;

export default function Reports() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const [editingReport, setEditingReport] =
    useState<ReportSettings | null>(null);

  const [savedReports, setSavedReports] = useState<
    SavedReport[]
  >([]);

  const favoriteReports = useMemo(
    () =>
      savedReports.filter((report) => report.favorite),
    [savedReports],
  );

  const openNewReportBuilder = () => {
    setEditingReport(null);
    setIsBuilderOpen(true);
  };

  const openTemplateCopyBuilder = (
    reportType: ReportType,
  ) => {
    const template =
      createReportSettingsByType(reportType);

    setEditingReport({
      ...template,
      profile: `custom_${reportType}`,
      name: `${template.name} 복사본`,
    });

    setIsBuilderOpen(true);
  };

  const openSavedReportEditor = (
    report: SavedReport,
  ) => {
    setEditingReport(report);
    setIsBuilderOpen(true);
  };

  const closeBuilder = () => {
    setIsBuilderOpen(false);
    setEditingReport(null);
  };

  const handleSaveReport = (
    settings: ReportSettings,
  ) => {
    const editingLocalId =
      editingReport &&
      "localId" in editingReport &&
      typeof editingReport.localId === "string"
        ? editingReport.localId
        : null;

    if (editingLocalId) {
      setSavedReports((current) =>
        current.map((report) =>
          report.localId === editingLocalId
            ? {
                ...settings,
                localId: report.localId,
              }
            : report,
        ),
      );
    } else {
      setSavedReports((current) => [
        {
          ...settings,
          profile:
            settings.profile.startsWith("custom_")
              ? settings.profile
              : `custom_${settings.type}`,
          localId: createLocalId(),
        },
        ...current,
      ]);
    }

    closeBuilder();
  };

  const handleDeleteReport = (
    localId: string,
  ) => {
    const confirmed = window.confirm(
      "이 보고서를 삭제하시겠습니까?",
    );

    if (!confirmed) {
      return;
    }

    setSavedReports((current) =>
      current.filter(
        (report) => report.localId !== localId,
      ),
    );
  };

  const handleToggleFavorite = (
    localId: string,
  ) => {
    setSavedReports((current) =>
      current.map((report) =>
        report.localId === localId
          ? {
              ...report,
              favorite: !report.favorite,
            }
          : report,
      ),
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>보고서 관리</h1>

          <p style={styles.description}>
            회사별 실무에 맞는 보고서를 직접 만들고
            저장해서 사용할 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          style={styles.primaryButton}
          onClick={openNewReportBuilder}
        >
          + 새 보고서 만들기
        </button>
      </div>

      {favoriteReports.length > 0 && (
        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                즐겨찾기
              </h2>

              <p style={styles.sectionDescription}>
                자주 사용하는 보고서를 빠르게 열 수
                있습니다.
              </p>
            </div>

            <span style={styles.countBadge}>
              {favoriteReports.length}개
            </span>
          </div>

          <div style={styles.reportGrid}>
            {favoriteReports.map((report) => (
              <SavedReportCard
                key={`favorite-${report.localId}`}
                report={report}
                onEdit={() =>
                  openSavedReportEditor(report)
                }
                onDelete={() =>
                  handleDeleteReport(report.localId)
                }
                onToggleFavorite={() =>
                  handleToggleFavorite(
                    report.localId,
                  )
                }
              />
            ))}
          </div>
        </section>
      )}

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              기본 보고서
            </h2>

            <p style={styles.sectionDescription}>
              거래, 입금, 미수금 확인에 필요한 기본
              보고서입니다. 기본 템플릿을 복사하여 회사
              전용 보고서로 만들 수 있습니다.
            </p>
          </div>

          <span style={styles.basicBadge}>
            기본 제공
          </span>
        </div>

        <div style={styles.reportGrid}>
          {BASIC_REPORT_TYPES.map((reportType) => {
            const definition =
              REPORT_TYPE_DEFINITIONS[reportType];

            return (
              <article
                key={reportType}
                style={styles.reportCard}
              >
                <div style={styles.reportCardTop}>
                  <div
                    style={styles.basicReportIcon}
                  >
                    📄
                  </div>

                  <span style={styles.reportCategory}>
                    기본
                  </span>
                </div>

                <div style={styles.reportTitle}>
                  {definition.name}
                </div>

                <div
                  style={styles.reportDescription}
                >
                  {definition.description}
                </div>

                <div style={styles.reportMeta}>
                  기본 컬럼 {definition.columns.length}개
                </div>

                <div style={styles.cardButtonRow}>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() =>
                      openTemplateCopyBuilder(
                        reportType,
                      )
                    }
                  >
                    복사해서 만들기
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              내 보고서
            </h2>

            <p style={styles.sectionDescription}>
              직접 만든 맞춤 보고서가 여기에
              표시됩니다.
            </p>
          </div>

          {savedReports.length > 0 && (
            <span style={styles.countBadge}>
              {savedReports.length}개
            </span>
          )}
        </div>

        {savedReports.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIcon}>📊</div>

            <div style={styles.emptyTitle}>
              아직 저장된 보고서가 없습니다
            </div>

            <p style={styles.emptyText}>
              새 보고서를 만들거나 기본 보고서를
              복사하여 우리 회사에 맞는 보고서를
              저장해보세요.
            </p>

            <button
              type="button"
              style={styles.emptyActionButton}
              onClick={openNewReportBuilder}
            >
              첫 보고서 만들기
            </button>
          </div>
        ) : (
          <div style={styles.reportGrid}>
            {savedReports.map((report) => (
              <SavedReportCard
                key={report.localId}
                report={report}
                onEdit={() =>
                  openSavedReportEditor(report)
                }
                onDelete={() =>
                  handleDeleteReport(report.localId)
                }
                onToggleFavorite={() =>
                  handleToggleFavorite(
                    report.localId,
                  )
                }
              />
            ))}
          </div>
        )}
      </section>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              프리미엄 보고서
            </h2>

            <p style={styles.sectionDescription}>
              품목 분석과 재고관리가 필요한 회사에서
              사용할 수 있는 유료 확장 보고서입니다.
            </p>
          </div>

          <span style={styles.premiumBadge}>
            유료 확장 예정
          </span>
        </div>

        <div style={styles.reportGrid}>
          {PREMIUM_REPORT_TYPES.map(
            (reportType) => {
              const definition =
                REPORT_TYPE_DEFINITIONS[
                  reportType
                ];

              const isPreviewAvailable =
                definition.columns.length > 0;

              return (
                <article
                  key={reportType}
                  style={{
                    ...styles.reportCard,
                    ...styles.premiumReportCard,
                  }}
                >
                  <div style={styles.reportCardTop}>
                    <div
                      style={styles.premiumReportIcon}
                    >
                      🔒
                    </div>

                    <span
                      style={
                        styles.premiumSmallBadge
                      }
                    >
                      PREMIUM
                    </span>
                  </div>

                  <div style={styles.reportTitle}>
                    {definition.name}
                  </div>

                  <div
                    style={styles.reportDescription}
                  >
                    {definition.description}
                  </div>

                  <div style={styles.reportMeta}>
                    {isPreviewAvailable
                      ? `미리보기 컬럼 ${definition.columns.length}개 구성`
                      : "Inventory Platform 개발 후 제공"}
                  </div>

                  <div style={styles.cardButtonRow}>
                    {isPreviewAvailable ? (
                      <button
                        type="button"
                        style={
                          styles.premiumPreviewButton
                        }
                        onClick={() =>
                          openTemplateCopyBuilder(
                            reportType,
                          )
                        }
                      >
                        미리보기
                      </button>
                    ) : (
                      <button
                        type="button"
                        style={
                          styles.disabledButton
                        }
                        disabled
                      >
                        재고관리 상품에서 사용 가능
                      </button>
                    )}
                  </div>
                </article>
              );
            },
          )}
        </div>
      </section>

      <ReportBuilderModal
        isOpen={isBuilderOpen}
        initialSettings={editingReport}
        organizationName="회사명"
        onClose={closeBuilder}
        onSave={handleSaveReport}
      />
    </div>
  );
}

interface SavedReportCardProps {
  report: SavedReport;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

function SavedReportCard({
  report,
  onEdit,
  onDelete,
  onToggleFavorite,
}: SavedReportCardProps) {
  const definition =
    REPORT_TYPE_DEFINITIONS[report.type];

  const visibleColumnCount =
    report.columns.filter(
      (column) => column.visible,
    ).length;

  return (
    <article style={styles.reportCard}>
      <div style={styles.reportCardTop}>
        <button
          type="button"
          style={{
            ...styles.favoriteButton,
            ...(report.favorite
              ? styles.favoriteButtonActive
              : {}),
          }}
          onClick={onToggleFavorite}
          aria-label={
            report.favorite
              ? "즐겨찾기 해제"
              : "즐겨찾기 추가"
          }
          title={
            report.favorite
              ? "즐겨찾기 해제"
              : "즐겨찾기 추가"
          }
        >
          {report.favorite ? "★" : "☆"}
        </button>

        <span
          style={
            report.category === "premium"
              ? styles.premiumSmallBadge
              : styles.customBadge
          }
        >
          {report.category === "premium"
            ? "PREMIUM"
            : "내 보고서"}
        </span>
      </div>

      <div style={styles.reportTitle}>
        {report.name}
      </div>

      <div style={styles.reportDescription}>
        {definition.description}
      </div>

      <div style={styles.savedReportInfo}>
        <span>{definition.name} 기반</span>
        <span>·</span>
        <span>표시 컬럼 {visibleColumnCount}개</span>
      </div>

      <div style={styles.cardButtonRow}>
        <button
          type="button"
          style={styles.secondaryButton}
          onClick={onEdit}
        >
          설정 수정
        </button>

        <button
          type="button"
          style={styles.deleteButton}
          onClick={onDelete}
        >
          삭제
        </button>
      </div>
    </article>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    width: "100%",
  },

  header: {
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },

  title: {
    margin: 0,
    color: "#111827",
    fontSize: "34px",
    fontWeight: 800,
  },

  description: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "15px",
  },

  primaryButton: {
    minWidth: "170px",
    height: "46px",
    padding: "0 20px",
    border: "1px solid #1d4ed8",
    borderRadius: "12px",
    background: "#2563eb",
    color: "#ffffff",
    boxShadow:
      "0 8px 18px rgba(37, 99, 235, 0.22)",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 800,
  },

  card: {
    width: "100%",
    marginBottom: "20px",
    padding: "24px",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    background: "#ffffff",
    boxShadow:
      "0 10px 24px rgba(15, 23, 42, 0.04)",
    boxSizing: "border-box",
  },

  sectionHeader: {
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  sectionTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "22px",
    fontWeight: 800,
  },

  sectionDescription: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  basicBadge: {
    display: "inline-flex",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  premiumBadge: {
    display: "inline-flex",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#fffbeb",
    color: "#b45309",
    fontSize: "12px",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  countBadge: {
    display: "inline-flex",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#f3f4f6",
    color: "#374151",
    fontSize: "12px",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  reportGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "16px",
  },

  reportCard: {
    minHeight: "230px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    background: "#ffffff",
    boxShadow:
      "0 8px 18px rgba(15, 23, 42, 0.04)",
    display: "flex",
    flexDirection: "column",
  },

  premiumReportCard: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
  },

  reportCardTop: {
    minHeight: "34px",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  basicReportIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
  },

  premiumReportIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "#fef3c7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
  },

  reportCategory: {
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#f3f4f6",
    color: "#6b7280",
    fontSize: "11px",
    fontWeight: 800,
  },

  customBadge: {
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#ecfdf5",
    color: "#047857",
    fontSize: "11px",
    fontWeight: 900,
  },

  premiumSmallBadge: {
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#fef3c7",
    color: "#b45309",
    fontSize: "10px",
    fontWeight: 900,
  },

  reportTitle: {
    color: "#111827",
    fontSize: "18px",
    fontWeight: 900,
    lineHeight: 1.35,
  },

  reportDescription: {
    marginTop: "10px",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.55,
  },

  reportMeta: {
    marginTop: "12px",
    color: "#9ca3af",
    fontSize: "12px",
    fontWeight: 700,
  },

  savedReportInfo: {
    marginTop: "12px",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "5px",
    fontSize: "12px",
    fontWeight: 700,
  },

  cardButtonRow: {
    marginTop: "auto",
    paddingTop: "18px",
    display: "flex",
    gap: "8px",
  },

  secondaryButton: {
    minHeight: "38px",
    padding: "0 14px",
    border: "1px solid #bfdbfe",
    borderRadius: "9px",
    background: "#eff6ff",
    color: "#1d4ed8",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 800,
  },

  premiumPreviewButton: {
    minHeight: "38px",
    padding: "0 14px",
    border: "1px solid #f59e0b",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#b45309",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 800,
  },

  disabledButton: {
    minHeight: "38px",
    padding: "0 14px",
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    background: "#f3f4f6",
    color: "#9ca3af",
    cursor: "not-allowed",
    fontSize: "12px",
    fontWeight: 800,
  },

  deleteButton: {
    minHeight: "38px",
    padding: "0 14px",
    border: "1px solid #fecaca",
    borderRadius: "9px",
    background: "#fff1f2",
    color: "#b91c1c",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 800,
  },

  favoriteButton: {
    width: "34px",
    height: "34px",
    padding: 0,
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "20px",
    lineHeight: 1,
  },

  favoriteButtonActive: {
    border: "1px solid #fbbf24",
    background: "#fffbeb",
    color: "#f59e0b",
  },

  emptyBox: {
    minHeight: "260px",
    padding: "32px",
    border: "1px dashed #d1d5db",
    borderRadius: "14px",
    background: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  emptyIcon: {
    marginBottom: "12px",
    fontSize: "34px",
  },

  emptyTitle: {
    color: "#374151",
    fontSize: "18px",
    fontWeight: 800,
  },

  emptyText: {
    maxWidth: "520px",
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  emptyActionButton: {
    minHeight: "40px",
    marginTop: "18px",
    padding: "0 16px",
    border: "1px solid #2563eb",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 800,
  },
};