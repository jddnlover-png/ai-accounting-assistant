export type PdfDocumentType =
  | "statement"
  | "delivery"
  | "shipment"
  | "receipt"
  | "estimate"
  | "purchaseOrder"
  | "custom";

export interface PdfPrintSettings {
  document: {
    type: PdfDocumentType;
    customTitle: string;
  };
  visibility: {
    specification: boolean;
    unit: boolean;
    unitPrice: boolean;
    supplyAmount: boolean;
    taxAmount: boolean;
    previousBalance: boolean;
    paidAmount: boolean;
    remainingAmount: boolean;
    receiver: boolean;
    businessType: boolean;
    businessItem: boolean;
    fax: boolean;
  };
  columnWidth: {
    date: number;
    product: number;
    specification: number;
    unit: number;
    quantity: number;
    unitPrice: number;
    supplyAmount: number;
    taxAmount: number;
    memo: number;
  };
  typography: {
    bodyFontSize: "small" | "normal" | "large";
    titleFontSize: "normal" | "large";
  };
  border: {
    lineWeight: "thin" | "normal" | "bold";
  };
  theme: {
    color: "black" | "blue" | "red";
  };
  footer: {
    showLogo: boolean;
    logoImageUrl: string;
    memoText: string;
  };
  stamp: {
    showStamp: boolean;
    stampImageUrl: string;
  };
}

export type PdfPrintSettingProfiles = Record<PdfDocumentType, PdfPrintSettings>;

export const DEFAULT_PDF_PRINT_SETTINGS: PdfPrintSettings = {
  document: {
    type: "statement",
    customTitle: "",
  },
  visibility: {
    specification: true,
    unit: true,
    unitPrice: true,
    supplyAmount: true,
    taxAmount: true,
    previousBalance: true,
    paidAmount: true,
    remainingAmount: true,
    receiver: true,
    businessType: true,
    businessItem: true,
    fax: true,
  },
  columnWidth: {
    date: 7,
    product: 24,
    specification: 12,
    unit: 6,
    quantity: 6,
    unitPrice: 12,
    supplyAmount: 13,
    taxAmount: 10,
    memo: 10,
  },
  typography: {
    bodyFontSize: "normal",
    titleFontSize: "normal",
  },
  border: {
    lineWeight: "normal",
  },
  theme: {
    color: "blue",
  },
  footer: {
    showLogo: false,
    logoImageUrl: "",
    memoText: "",
  },
  stamp: {
    showStamp: false,
    stampImageUrl: "",
  },
};

export const DEFAULT_PDF_PRINT_SETTING_PROFILES: PdfPrintSettingProfiles = {
  statement: {
    ...DEFAULT_PDF_PRINT_SETTINGS,
    document: {
      type: "statement",
      customTitle: "",
    },
  },
  delivery: {
    ...DEFAULT_PDF_PRINT_SETTINGS,
    document: {
      type: "delivery",
      customTitle: "",
    },
    visibility: {
      ...DEFAULT_PDF_PRINT_SETTINGS.visibility,
      unitPrice: false,
      supplyAmount: false,
      taxAmount: false,
      previousBalance: false,
      paidAmount: false,
      remainingAmount: false,
    },
  },
  shipment: {
    ...DEFAULT_PDF_PRINT_SETTINGS,
    document: {
      type: "shipment",
      customTitle: "",
    },
    visibility: {
      ...DEFAULT_PDF_PRINT_SETTINGS.visibility,
      unitPrice: false,
      supplyAmount: false,
      taxAmount: false,
      previousBalance: false,
      paidAmount: false,
      remainingAmount: false,
      receiver: true,
    },
  },
  receipt: {
    ...DEFAULT_PDF_PRINT_SETTINGS,
    document: {
      type: "receipt",
      customTitle: "",
    },
    visibility: {
      ...DEFAULT_PDF_PRINT_SETTINGS.visibility,
      unitPrice: false,
      supplyAmount: false,
      taxAmount: false,
      previousBalance: false,
      remainingAmount: false,
      receiver: true,
    },
  },
  estimate: {
    ...DEFAULT_PDF_PRINT_SETTINGS,
    document: {
      type: "estimate",
      customTitle: "",
    },
    visibility: {
      ...DEFAULT_PDF_PRINT_SETTINGS.visibility,
      previousBalance: false,
      paidAmount: false,
      remainingAmount: false,
      receiver: false,
    },
  },
  purchaseOrder: {
    ...DEFAULT_PDF_PRINT_SETTINGS,
    document: {
      type: "purchaseOrder",
      customTitle: "",
    },
    visibility: {
      ...DEFAULT_PDF_PRINT_SETTINGS.visibility,
      previousBalance: false,
      paidAmount: false,
      remainingAmount: false,
      receiver: false,
    },
  },
  custom: {
    ...DEFAULT_PDF_PRINT_SETTINGS,
    document: {
      type: "custom",
      customTitle: "",
    },
  },
};