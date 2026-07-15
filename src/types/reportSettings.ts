export type ReportType =
  | "accounts_receivable_ledger"
  | "customer_ledger"
  | "sales_report"
  | "payment_report"
  | "item_sales_analysis"
  | "inventory_status"
  | "stock_in_out_ledger"
  | "inventory_valuation"
  | "low_stock_report"
  | "warehouse_inventory"
  | "cost_analysis"
  | "margin_analysis";

export type ReportPurpose =
  | "receivable_check"
  | "transaction_flow_check"
  | "sales_check"
  | "payment_check"
  | "inventory_analysis"
  | "profit_analysis";

export type ReportCategory = "basic" | "premium";

export type ReportVisibilityScope = "private" | "organization";

export type ReportSortDirection = "asc" | "desc";

export type ReportBorderWidth = "thin" | "normal" | "bold";

export type ReportThemeTemplate = "basic" | "modern" | "compact";

export type ReportColumnDefinition = {
  key: string;
  label: string;
  visible: boolean;
  width: number;
  align?: "left" | "center" | "right";
};

export type ReportVisibilitySettings = {
  showTitle: boolean;
  showOrganizationInfo: boolean;
  showPeriod: boolean;
  showFilterSummary: boolean;
  showFooter: boolean;
};

export type ReportColumnWidthSettings = Record<string, number>;

export type ReportTypographySettings = {
  titleFontSize: number;
  bodyFontSize: number;
  footerFontSize: number;
};

export type ReportBorderSettings = {
  borderWidth: ReportBorderWidth;
};

export type ReportThemeSettings = {
  template: ReportThemeTemplate;
};

export type ReportFooterSettings = {
  text: string;
};

export type ReportPeriodFilter = {
  startDate?: string;
  endDate?: string;
};

export type ReportFilterSettings = {
  period?: ReportPeriodFilter;
  customerId?: string;
  status?: string;
};

export type ReportSortSettings = {
  columnKey: string;
  direction: ReportSortDirection;
};

export type ReportPermissionSettings = {
  visibilityScope: ReportVisibilityScope;
  editableByOthers: boolean;
};

export type ReportSettings = {
  type: ReportType;
  profile: string;
  name: string;
  purpose: ReportPurpose;
  category: ReportCategory;

  columns: ReportColumnDefinition[];

  visibility: ReportVisibilitySettings;
  columnWidth: ReportColumnWidthSettings;
  typography: ReportTypographySettings;
  border: ReportBorderSettings;
  theme: ReportThemeSettings;
  footer: ReportFooterSettings;

  filter: ReportFilterSettings;
  sort: ReportSortSettings[];
  permission: ReportPermissionSettings;
  favorite: boolean;
};

export type ReportTypeDefinition = {
  type: ReportType;
  name: string;
  description: string;
  purpose: ReportPurpose;
  category: ReportCategory;
  columns: ReportColumnDefinition[];
  defaultSort: ReportSortSettings[];
};

/**
 * 공통 보고서 설정 객체를 생성합니다.
 *
 * 각 보고서가 columns, visibility, typography 등의 객체를
 * 서로 공유하지 않도록 항상 새로운 객체를 반환합니다.
 */
export const createDefaultReportSettings = (
  overrides: Partial<ReportSettings> = {},
): ReportSettings => {
  const baseSettings: ReportSettings = {
    type: "accounts_receivable_ledger",
    profile: "default",
    name: "미수금원장",
    purpose: "receivable_check",
    category: "basic",

    columns: [],

    visibility: {
      showTitle: true,
      showOrganizationInfo: true,
      showPeriod: true,
      showFilterSummary: true,
      showFooter: true,
    },

    columnWidth: {},

    typography: {
      titleFontSize: 18,
      bodyFontSize: 11,
      footerFontSize: 10,
    },

    border: {
      borderWidth: "normal",
    },

    theme: {
      template: "basic",
    },

    footer: {
      text: "",
    },

    filter: {},

    sort: [
      {
        columnKey: "date",
        direction: "asc",
      },
    ],

    permission: {
      visibilityScope: "private",
      editableByOthers: false,
    },

    favorite: false,
  };

  return {
    ...baseSettings,
    ...overrides,

    columns: overrides.columns
      ? overrides.columns.map((column) => ({ ...column }))
      : baseSettings.columns.map((column) => ({ ...column })),

    visibility: {
      ...baseSettings.visibility,
      ...overrides.visibility,
    },

    columnWidth: {
      ...baseSettings.columnWidth,
      ...overrides.columnWidth,
    },

    typography: {
      ...baseSettings.typography,
      ...overrides.typography,
    },

    border: {
      ...baseSettings.border,
      ...overrides.border,
    },

    theme: {
      ...baseSettings.theme,
      ...overrides.theme,
    },

    footer: {
      ...baseSettings.footer,
      ...overrides.footer,
    },

    filter: {
      ...baseSettings.filter,
      ...overrides.filter,
      period: overrides.filter?.period
        ? {
            ...overrides.filter.period,
          }
        : baseSettings.filter.period,
    },

    sort: overrides.sort
      ? overrides.sort.map((sort) => ({ ...sort }))
      : baseSettings.sort.map((sort) => ({ ...sort })),

    permission: {
      ...baseSettings.permission,
      ...overrides.permission,
    },
  };
};

export const REPORT_TYPE_DEFINITIONS: Record<
  ReportType,
  ReportTypeDefinition
> = {
  accounts_receivable_ledger: {
    type: "accounts_receivable_ledger",
    name: "미수금원장",
    description: "거래처별 매출, 입금 및 남은 미수금을 확인합니다.",
    purpose: "receivable_check",
    category: "basic",
    columns: [
      {
        key: "date",
        label: "거래일",
        visible: true,
        width: 90,
        align: "center",
      },
      {
        key: "customerName",
        label: "거래처",
        visible: true,
        width: 150,
        align: "left",
      },
      {
        key: "description",
        label: "거래내용",
        visible: true,
        width: 180,
        align: "left",
      },
      {
        key: "salesAmount",
        label: "매출액",
        visible: true,
        width: 110,
        align: "right",
      },
      {
        key: "paymentAmount",
        label: "입금액",
        visible: true,
        width: 110,
        align: "right",
      },
      {
        key: "receivableAmount",
        label: "미수금",
        visible: true,
        width: 110,
        align: "right",
      },
      {
        key: "status",
        label: "상태",
        visible: true,
        width: 90,
        align: "center",
      },
    ],
    defaultSort: [
      {
        columnKey: "date",
        direction: "asc",
      },
    ],
  },

  customer_ledger: {
    type: "customer_ledger",
    name: "거래처원장",
    description: "거래처별 거래와 입금 흐름 및 누적 잔액을 확인합니다.",
    purpose: "transaction_flow_check",
    category: "basic",
    columns: [
      {
        key: "date",
        label: "일자",
        visible: true,
        width: 90,
        align: "center",
      },
      {
        key: "customerName",
        label: "거래처",
        visible: true,
        width: 150,
        align: "left",
      },
      {
        key: "transactionType",
        label: "구분",
        visible: true,
        width: 80,
        align: "center",
      },
      {
        key: "description",
        label: "거래내용",
        visible: true,
        width: 180,
        align: "left",
      },
      {
        key: "salesAmount",
        label: "매출",
        visible: true,
        width: 100,
        align: "right",
      },
      {
        key: "paymentAmount",
        label: "입금",
        visible: true,
        width: 100,
        align: "right",
      },
      {
        key: "balance",
        label: "잔액",
        visible: true,
        width: 110,
        align: "right",
      },
      {
        key: "memo",
        label: "비고",
        visible: true,
        width: 140,
        align: "left",
      },
    ],
    defaultSort: [
      {
        columnKey: "date",
        direction: "asc",
      },
    ],
  },

  sales_report: {
    type: "sales_report",
    name: "매출 보고서",
    description: "기간별 매출 내역과 거래처별 매출 금액을 확인합니다.",
    purpose: "sales_check",
    category: "basic",
    columns: [
      {
        key: "date",
        label: "거래일",
        visible: true,
        width: 90,
        align: "center",
      },
      {
        key: "statementNumber",
        label: "문서번호",
        visible: true,
        width: 120,
        align: "center",
      },
      {
        key: "customerName",
        label: "거래처",
        visible: true,
        width: 150,
        align: "left",
      },
      {
        key: "supplyAmount",
        label: "공급가액",
        visible: true,
        width: 110,
        align: "right",
      },
      {
        key: "taxAmount",
        label: "세액",
        visible: true,
        width: 100,
        align: "right",
      },
      {
        key: "totalAmount",
        label: "합계액",
        visible: true,
        width: 110,
        align: "right",
      },
      {
        key: "taxInvoiceIssued",
        label: "세금계산서",
        visible: true,
        width: 100,
        align: "center",
      },
      {
        key: "memo",
        label: "비고",
        visible: true,
        width: 140,
        align: "left",
      },
    ],
    defaultSort: [
      {
        columnKey: "date",
        direction: "desc",
      },
    ],
  },

  payment_report: {
    type: "payment_report",
    name: "입금 보고서",
    description: "기간별 입금 내역과 거래처별 입금 현황을 확인합니다.",
    purpose: "payment_check",
    category: "basic",
    columns: [
      {
        key: "paymentDate",
        label: "입금일",
        visible: true,
        width: 90,
        align: "center",
      },
      {
        key: "customerName",
        label: "거래처",
        visible: true,
        width: 150,
        align: "left",
      },
      {
        key: "paymentMethod",
        label: "입금방법",
        visible: true,
        width: 100,
        align: "center",
      },
      {
        key: "depositorName",
        label: "입금자",
        visible: true,
        width: 110,
        align: "left",
      },
      {
        key: "paymentAmount",
        label: "입금액",
        visible: true,
        width: 120,
        align: "right",
      },
      {
        key: "allocatedAmount",
        label: "배분액",
        visible: true,
        width: 120,
        align: "right",
      },
      {
        key: "unallocatedAmount",
        label: "미배분액",
        visible: true,
        width: 120,
        align: "right",
      },
      {
        key: "memo",
        label: "비고",
        visible: true,
        width: 160,
        align: "left",
      },
    ],
    defaultSort: [
      {
        columnKey: "paymentDate",
        direction: "desc",
      },
    ],
  },

  item_sales_analysis: {
    type: "item_sales_analysis",
    name: "품목 판매 분석",
    description: "품목별 판매수량, 판매금액 및 거래처를 분석합니다.",
    purpose: "inventory_analysis",
    category: "premium",
    columns: [
      {
        key: "itemName",
        label: "품목명",
        visible: true,
        width: 150,
        align: "left",
      },
      {
        key: "specification",
        label: "규격",
        visible: true,
        width: 100,
        align: "left",
      },
      {
        key: "unit",
        label: "단위",
        visible: true,
        width: 70,
        align: "center",
      },
      {
        key: "salesQuantity",
        label: "판매수량",
        visible: true,
        width: 100,
        align: "right",
      },
      {
        key: "salesAmount",
        label: "판매금액",
        visible: true,
        width: 120,
        align: "right",
      },
      {
        key: "customerName",
        label: "거래처",
        visible: true,
        width: 150,
        align: "left",
      },
      {
        key: "transactionDate",
        label: "거래일",
        visible: true,
        width: 90,
        align: "center",
      },
    ],
    defaultSort: [
      {
        columnKey: "salesAmount",
        direction: "desc",
      },
    ],
  },

  inventory_status: {
    type: "inventory_status",
    name: "재고 현황",
    description: "품목별 현재 재고수량과 재고 상태를 확인합니다.",
    purpose: "inventory_analysis",
    category: "premium",
    columns: [],
    defaultSort: [],
  },

  stock_in_out_ledger: {
    type: "stock_in_out_ledger",
    name: "입출고 원장",
    description: "품목별 입고와 출고 이력을 확인합니다.",
    purpose: "inventory_analysis",
    category: "premium",
    columns: [],
    defaultSort: [],
  },

  inventory_valuation: {
    type: "inventory_valuation",
    name: "재고 평가 보고서",
    description: "현재 재고의 수량과 평가금액을 확인합니다.",
    purpose: "inventory_analysis",
    category: "premium",
    columns: [],
    defaultSort: [],
  },

  low_stock_report: {
    type: "low_stock_report",
    name: "부족 재고 보고서",
    description: "안전재고 이하로 내려간 품목을 확인합니다.",
    purpose: "inventory_analysis",
    category: "premium",
    columns: [],
    defaultSort: [],
  },

  warehouse_inventory: {
    type: "warehouse_inventory",
    name: "창고별 재고 보고서",
    description: "창고별 품목 재고수량과 이동 현황을 확인합니다.",
    purpose: "inventory_analysis",
    category: "premium",
    columns: [],
    defaultSort: [],
  },

  cost_analysis: {
    type: "cost_analysis",
    name: "원가 분석",
    description: "품목과 거래별 원가 구조를 분석합니다.",
    purpose: "profit_analysis",
    category: "premium",
    columns: [],
    defaultSort: [],
  },

  margin_analysis: {
    type: "margin_analysis",
    name: "마진 분석",
    description: "매출, 원가 및 마진율을 분석합니다.",
    purpose: "profit_analysis",
    category: "premium",
    columns: [],
    defaultSort: [],
  },
};

export const createReportSettingsByType = (
  type: ReportType,
): ReportSettings => {
  const definition = REPORT_TYPE_DEFINITIONS[type];

  const columnWidth = Object.fromEntries(
    definition.columns.map((column) => [column.key, column.width]),
  );

  return createDefaultReportSettings({
    type: definition.type,
    profile: `default_${definition.type}`,
    name: definition.name,
    purpose: definition.purpose,
    category: definition.category,
    columns: definition.columns,
    columnWidth,
    sort: definition.defaultSort,
  });
};

export const DEFAULT_REPORT_SETTINGS = createReportSettingsByType(
  "accounts_receivable_ledger",
);

export const DEFAULT_REPORT_SETTING_PROFILES: ReportSettings[] = [
  createReportSettingsByType("accounts_receivable_ledger"),
  createReportSettingsByType("customer_ledger"),
  createReportSettingsByType("sales_report"),
  createReportSettingsByType("payment_report"),
];

export const PREMIUM_REPORT_SETTING_PROFILES: ReportSettings[] = [
  createReportSettingsByType("item_sales_analysis"),
  createReportSettingsByType("inventory_status"),
  createReportSettingsByType("stock_in_out_ledger"),
  createReportSettingsByType("inventory_valuation"),
  createReportSettingsByType("low_stock_report"),
  createReportSettingsByType("warehouse_inventory"),
  createReportSettingsByType("cost_analysis"),
  createReportSettingsByType("margin_analysis"),
];

export const BASIC_REPORT_TYPES: ReportType[] = [
  "accounts_receivable_ledger",
  "customer_ledger",
  "sales_report",
  "payment_report",
];

export const PREMIUM_REPORT_TYPES: ReportType[] = [
  "item_sales_analysis",
  "inventory_status",
  "stock_in_out_ledger",
  "inventory_valuation",
  "low_stock_report",
  "warehouse_inventory",
  "cost_analysis",
  "margin_analysis",
];

export const isPremiumReportType = (type: ReportType): boolean =>
  REPORT_TYPE_DEFINITIONS[type].category === "premium";

export const getReportTypeDefinition = (
  type: ReportType,
): ReportTypeDefinition => REPORT_TYPE_DEFINITIONS[type];