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
  borderWidth: "thin" | "normal" | "bold";
};

export type ReportThemeSettings = {
  template: "basic" | "modern" | "compact";
};

export type ReportFooterSettings = {
  text: string;
};

export type ReportFilterSettings = {
  period?: {
    startDate?: string;
    endDate?: string;
  };
  customerId?: string;
  status?: string;
};

export type ReportSortSettings = {
  columnKey: string;
  direction: "asc" | "desc";
};

export type ReportPermissionSettings = {
  visibilityScope: "private" | "organization";
  editableByOthers: boolean;
};

export type ReportSettings = {
  type: ReportType;
  profile: string;
  name: string;
  purpose: ReportPurpose;

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

export const DEFAULT_REPORT_SETTINGS: ReportSettings = {
  type: "accounts_receivable_ledger",
  profile: "default",
  name: "미수금원장",
  purpose: "receivable_check",

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

export const DEFAULT_REPORT_SETTING_PROFILES: ReportSettings[] = [
  {
    ...DEFAULT_REPORT_SETTINGS,
    type: "accounts_receivable_ledger",
    name: "미수금원장",
    purpose: "receivable_check",
  },
  {
    ...DEFAULT_REPORT_SETTINGS,
    type: "customer_ledger",
    name: "거래처원장",
    purpose: "transaction_flow_check",
  },
  {
    ...DEFAULT_REPORT_SETTINGS,
    type: "sales_report",
    name: "매출 보고서",
    purpose: "sales_check",
  },
  {
    ...DEFAULT_REPORT_SETTINGS,
    type: "payment_report",
    name: "입금 보고서",
    purpose: "payment_check",
  },
];