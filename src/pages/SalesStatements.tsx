import { useEffect, useMemo, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import AppLayout from "../components/layout/AppLayout";
import { useOrganization } from "../contexts/OrganizationContext";
import { supabase } from "../lib/supabase";
import { useSalesStatements } from "../hooks/useSalesStatements";
import {
  DEFAULT_PDF_PRINT_SETTINGS,
  DEFAULT_PDF_PRINT_SETTING_PROFILES,
  type PdfDocumentType,
  type PdfPrintSettingProfiles,
  type PdfPrintSettings,
} from "../types/pdfSettings";
import PdfSettingsModal from "../components/pdf/PdfSettingsModal";
import StatementPdfRenderer from "../components/pdf/StatementPdfRenderer";

interface Customer {
  id: string;
  name: string;
  business_number?: string | null;
  ceo_name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface Product {
  id: string;
  name: string;
  product_code?: string | null;
  aliases?: string | null;
  specification?: string | null;
  unit?: string | null;
  default_price?: number | null;
  taxable?: boolean | null;
}

interface StatementItemInput {
  product_id: string;
  product_search: string;
  product_name: string;
  specification: string;
  unit: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}




const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ko-KR").format(amount);

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getToday = () => formatDateInput(new Date());

const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    from: formatDateInput(start),
    to: formatDateInput(end),
  };
};

const getDateRangeByPreset = (preset: "today" | "thisWeek" | "thisMonth" | "lastMonth") => {
  const now = new Date();

  if (preset === "today") {
    const today = formatDateInput(now);
    return { from: today, to: today };
  }

  if (preset === "thisWeek") {
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(now.getDate() + diffToMonday);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      from: formatDateInput(start),
      to: formatDateInput(end),
    };
  }

  if (preset === "lastMonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);

    return {
      from: formatDateInput(start),
      to: formatDateInput(end),
    };
  }

  return getCurrentMonthRange();
};



const statementPageCss = `
  .space-y-6 > * + * { margin-top: 24px; }
  .p-6 { padding: 24px; }
  .p-8 { padding: 32px; }
  .p-5 { padding: 20px; }
  .p-4 { padding: 16px; }
  .px-2\.5 { padding-left: 10px; padding-right: 10px; }
  .px-3 { padding-left: 12px; padding-right: 12px; }
  .px-4 { padding-left: 16px; padding-right: 16px; }
  .px-5 { padding-left: 20px; padding-right: 20px; }
  .py-1 { padding-top: 4px; padding-bottom: 4px; }
  .py-1\.5 { padding-top: 6px; padding-bottom: 6px; }
  .py-2 { padding-top: 8px; padding-bottom: 8px; }
  .py-2\.5 { padding-top: 10px; padding-bottom: 10px; }
  .py-3 { padding-top: 12px; padding-bottom: 12px; }
  .pb-3 { padding-bottom: 12px; }
  .pb-4 { padding-bottom: 16px; }
  .pt-4 { padding-top: 16px; }
  .mt-1 { margin-top: 4px; }
  .mt-2 { margin-top: 8px; }
  .mt-5 { margin-top: 20px; }
  .mb-1 { margin-bottom: 4px; }
  .mb-2 { margin-bottom: 8px; }
  .mb-4 { margin-bottom: 16px; }
  .mb-5 { margin-bottom: 20px; }
  .mr-1 { margin-right: 4px; }
  .block { display: block; }
  .inline-flex { display: inline-flex; }
  .flex { display: flex; }
  .grid { display: grid; }
  .hidden { display: none; }
  .w-full { width: 100%; }
  .w-24 { width: 96px; }
  .w-32 { width: 128px; }
  .w-80 { width: 320px; }
  .w-\[360px\] { width: 360px; }
  .max-w-5xl { max-width: 1024px; }
  .max-h-64 { max-height: 256px; }
  .max-h-\[92vh\] { max-height: 92vh; }
  .min-h-\[420px\] { min-height: 420px; }
  .min-w-\[900px\] { min-width: 900px; }
  .min-w-\[1000px\] { min-width: 1000px; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .items-start { align-items: flex-start; }
  .items-end { align-items: flex-end; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .justify-end { justify-content: flex-end; }
  .self-start { align-self: flex-start; }
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .gap-4 { gap: 16px; }
  .gap-6 { gap: 24px; }
  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .overflow-hidden { overflow: hidden; }
  .overflow-auto { overflow: auto; }
  .overflow-x-auto { overflow-x: auto; }
  .overflow-y-auto { overflow-y: auto; }
  .border { border: 1px solid #e5e7eb; }
  .border-b { border-bottom: 1px solid #e5e7eb; }
  .border-t { border-top: 1px solid #e5e7eb; }
  .border-dashed { border-style: dashed; }
  .border-blue-600 { border-color: #2563eb; }
  .border-red-200 { border-color: #fecaca; }
  .rounded-lg { border-radius: 10px; }
  .rounded-xl { border-radius: 12px; }
  .rounded-2xl { border-radius: 14px; }
  .rounded-full { border-radius: 999px; }
  .bg-white { background: #ffffff; }
  .bg-gray-50 { background: #f9fafb; }
  .bg-gray-100 { background: #f3f4f6; }
  .bg-blue-50 { background: #eff6ff; }
  .bg-blue-600 { background: #2563eb; }
  .bg-green-50 { background: #ecfdf5; }
  .bg-amber-50 { background: #fffbeb; }
  .bg-red-50 { background: #fef2f2; }
  .bg-purple-50 { background: #faf5ff; }
  .bg-black\/60 { background: rgba(0,0,0,0.6); }
  .text-white { color: #ffffff; }
  .text-gray-500 { color: #6b7280; }
  .text-gray-600 { color: #4b5563; }
  .text-gray-700 { color: #374151; }
  .text-blue-700 { color: #1d4ed8; }
  .text-blue-800 { color: #1e40af; }
  .text-green-700 { color: #047857; }
  .text-amber-700 { color: #b45309; }
  .text-red-500 { color: #ef4444; }
  .text-red-600 { color: #dc2626; }
  .text-red-700 { color: #b91c1c; }
  .text-purple-700 { color: #7e22ce; }
  .text-left { text-align: left; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-xs { font-size: 12px; line-height: 1.4; }
  .text-sm { font-size: 14px; line-height: 1.5; }
  .text-lg { font-size: 18px; line-height: 1.5; }
  .text-xl { font-size: 20px; line-height: 1.4; }
  .text-2xl { font-size: 24px; line-height: 1.3; }
  .text-3xl { font-size: 34px; line-height: 1.2; }
  .font-medium { font-weight: 500; }
  .font-semibold { font-weight: 700; }
  .font-bold { font-weight: 800; }
  .tracking-tight { letter-spacing: -0.02em; }
  .shadow-sm { box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04); }
  .shadow-lg { box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12); }
  .shadow-2xl { box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28); }
  .relative { position: relative; }
  .absolute { position: absolute; }
  .fixed { position: fixed; }
  .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
  .top-6 { top: 24px; }
  .z-20 { z-index: 20; }
  .z-50 { z-index: 50; }
  .cursor-pointer { cursor: pointer; }
  .border-collapse { border-collapse: collapse; }
  .last\:border-b-0:last-child { border-bottom: 0; }
  .disabled\:opacity-40:disabled { opacity: 0.4; }
  .disabled\:opacity-50:disabled { opacity: 0.5; }
  .hover\:bg-gray-50:hover { background: #f9fafb; }
  .hover\:bg-blue-50:hover { background: #eff6ff; }
  .hover\:bg-blue-700:hover { background: #1d4ed8; }
  .hover\:bg-red-50:hover { background: #fef2f2; }

  button { cursor: pointer; }
  input, select { box-sizing: border-box; outline: none; }
  th, td { border-bottom: 1px solid #f3f4f6; }

  @media (min-width: 768px) {
    .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  @media (min-width: 640px) {
    .sm\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  }
  @media (min-width: 1024px) {
    .lg\:flex-row { flex-direction: row; }
    .lg\:items-end { align-items: flex-end; }
    .lg\:justify-between { justify-content: space-between; }
  }
  @media (min-width: 1280px) {
    .xl\:grid-cols-\[minmax\(0\,1\.25fr\)_minmax\(420px\,0\.75fr\)\] {
      grid-template-columns: minmax(0, 1.25fr) minmax(420px, 0.75fr);
    }
    .xl\:sticky { position: sticky; }
    .xl\:top-6 { top: 24px; }
    .xl\:self-start { align-self: flex-start; }
  }
`;

export default function SalesStatements() {
  const { organization } = useOrganization();
  const { data: statements = [], isLoading, error, refetch } = useSalesStatements();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statementType, setStatementType] = useState<"sales" | "purchase">("sales");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [customerId, setCustomerId] = useState("");
const [customerSearch, setCustomerSearch] = useState("");
const [activeCustomerIndex, setActiveCustomerIndex] = useState(0);
const [statementDate, setStatementDate] = useState(getToday());
  const [memo, setMemo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<any | null>(null);
const [selectedItems, setSelectedItems] = useState<any[]>([]);
const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
const previewRef = useRef<HTMLDivElement | null>(null);
const itemInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

const [editingStatementId, setEditingStatementId] = useState<string | null>(null);

const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);
const [listCustomerSearch, setListCustomerSearch] = useState("");
const [dateFrom, setDateFrom] = useState(currentMonthRange.from);
const [dateTo, setDateTo] = useState(currentMonthRange.to);
const [datePreset, setDatePreset] = useState<"today" | "thisWeek" | "thisMonth" | "lastMonth" | "custom">("thisMonth");
const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
const [statementItemsMap, setStatementItemsMap] = useState<Record<string, any[]>>({});
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(20);
const [sortKey, setSortKey] = useState<"statement_date" | "customer" | "total_amount">("statement_date");
const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
const [recentSavedStatementId, setRecentSavedStatementId] = useState<string | null>(null);
const [toastMessage, setToastMessage] = useState("");
const [isPdfSettingsOpen, setIsPdfSettingsOpen] = useState(false);
const [pdfPrintSettingProfiles, setPdfPrintSettingProfiles] =
  useState<PdfPrintSettingProfiles>(DEFAULT_PDF_PRINT_SETTING_PROFILES);

const [pdfPrintSettings, setPdfPrintSettings] = useState<PdfPrintSettings>(
  DEFAULT_PDF_PRINT_SETTINGS
);

const [isCustomerCreateOpen, setIsCustomerCreateOpen] = useState(false);
const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
const [newCustomerForm, setNewCustomerForm] = useState({
  name: "",
  business_number: "",
  ceo_name: "",
  phone: "",
  address: "",
  email: "",
});

const [isProductCreateOpen, setIsProductCreateOpen] = useState(false);
const [isCreatingProduct, setIsCreatingProduct] = useState(false);
const [productCreateRowIndex, setProductCreateRowIndex] = useState<number | null>(null);
const [newProductForm, setNewProductForm] = useState({
  name: "",
  specification: "",
  unit: "",
  default_price: "",
  taxable: true,
});

const [showCustomerExtraFields, setShowCustomerExtraFields] = useState(false);
const [showProductExtraFields, setShowProductExtraFields] = useState(false);

  const createEmptyItem = (): StatementItemInput => ({
  product_id: "",
  product_search: "",
  product_name: "",
  specification: "",
  unit: "",
  quantity: 1,
  unit_price: 0,
  taxable: true,
});

const [items, setItems] = useState<StatementItemInput[]>([
  createEmptyItem(),
  createEmptyItem(),
]);

const [activeProductIndexMap, setActiveProductIndexMap] = useState<Record<number, number>>({});
const [focusedProductRowIndex, setFocusedProductRowIndex] = useState<number | null>(null);
const [recentCustomerProducts, setRecentCustomerProducts] = useState<Product[]>([]);
const [productDropdownOpenMap, setProductDropdownOpenMap] = useState<Record<number, boolean>>({});

  const selectedCustomer = customers.find((customer) => customer.id === customerId);

  const filteredCustomers = useMemo(() => {
    const keyword = customerSearch.trim().toLowerCase();

    if (!keyword) return customers.slice(0, 20);

    return customers
      .filter((customer) => {
        const text = [
          customer.name,
          customer.business_number,
          customer.ceo_name,
          customer.address,
          customer.phone,
          customer.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(keyword);
      })
      .slice(0, 20);
  }, [customers, customerSearch]);

  const totals = useMemo(() => {
    const supplyAmount = items.reduce((sum, item) => {
      return sum + Number(item.quantity || 0) * Number(item.unit_price || 0);
    }, 0);

    const taxAmount = items.reduce((sum, item) => {
      const lineSupply = Number(item.quantity || 0) * Number(item.unit_price || 0);
      return sum + (item.taxable ? Math.floor(lineSupply * 0.1) : 0);
    }, 0);

    return {
      supplyAmount,
      taxAmount,
      totalAmount: supplyAmount + taxAmount,
    };
  }, [items]);

  useEffect(() => {
  if (!organization?.id) return;

  const storageKey = `statementPdfPrintSettings:${organization.id}`;
  const savedSettings = localStorage.getItem(storageKey);

  if (!savedSettings) {
    setPdfPrintSettingProfiles(DEFAULT_PDF_PRINT_SETTING_PROFILES);
    setPdfPrintSettings(DEFAULT_PDF_PRINT_SETTINGS);
    return;
  }

  const mergeSettings = (settings: Partial<PdfPrintSettings>): PdfPrintSettings => ({
    ...DEFAULT_PDF_PRINT_SETTINGS,
    ...settings,
    document: {
      ...DEFAULT_PDF_PRINT_SETTINGS.document,
      ...(settings.document || {}),
    },
    visibility: {
      ...DEFAULT_PDF_PRINT_SETTINGS.visibility,
      ...(settings.visibility || {}),
    },
    columnWidth: {
      ...DEFAULT_PDF_PRINT_SETTINGS.columnWidth,
      ...(settings.columnWidth || {}),
    },
    typography: {
      ...DEFAULT_PDF_PRINT_SETTINGS.typography,
      ...(settings.typography || {}),
    },
    border: {
      ...DEFAULT_PDF_PRINT_SETTINGS.border,
      ...(settings.border || {}),
    },
    theme: {
  ...DEFAULT_PDF_PRINT_SETTINGS.theme,
  ...(settings.theme || {}),
},
footer: {
  ...DEFAULT_PDF_PRINT_SETTINGS.footer,
  ...(settings.footer || {}),
},
stamp: {
  ...DEFAULT_PDF_PRINT_SETTINGS.stamp,
  ...(settings.stamp || {}),
},
  });

  try {
    const parsedSettings = JSON.parse(savedSettings);

    const isLegacyFlatSettings =
      parsedSettings &&
      typeof parsedSettings === "object" &&
      "showSpecification" in parsedSettings;

    if (isLegacyFlatSettings) {
      const migratedSettings: PdfPrintSettings = {
        ...DEFAULT_PDF_PRINT_SETTINGS,
        visibility: {
          ...DEFAULT_PDF_PRINT_SETTINGS.visibility,
          specification: parsedSettings.showSpecification ?? true,
          unit: parsedSettings.showUnit ?? true,
          unitPrice: parsedSettings.showUnitPrice ?? true,
          supplyAmount: parsedSettings.showSupplyAmount ?? true,
          taxAmount: parsedSettings.showTaxAmount ?? true,
          previousBalance: parsedSettings.showPreviousBalance ?? true,
          paidAmount: parsedSettings.showPaidAmount ?? true,
          remainingAmount: parsedSettings.showRemainingAmount ?? true,
          receiver: parsedSettings.showReceiver ?? true,
          businessType: parsedSettings.showBusinessType ?? true,
          businessItem: parsedSettings.showBusinessItem ?? true,
          fax: parsedSettings.showFax ?? true,
        },
        typography: {
          ...DEFAULT_PDF_PRINT_SETTINGS.typography,
          bodyFontSize: parsedSettings.bodyFontSize ?? "normal",
          titleFontSize: parsedSettings.titleFontSize ?? "normal",
        },
        border: {
          ...DEFAULT_PDF_PRINT_SETTINGS.border,
          lineWeight: parsedSettings.lineWeight ?? "normal",
        },
        theme: {
          ...DEFAULT_PDF_PRINT_SETTINGS.theme,
          color: parsedSettings.colorTheme ?? "blue",
        },
      };

      const migratedProfiles = {
        ...DEFAULT_PDF_PRINT_SETTING_PROFILES,
        statement: migratedSettings,
      };

      setPdfPrintSettingProfiles(migratedProfiles);
      setPdfPrintSettings(migratedSettings);
      return;
    }

    if (parsedSettings?.profiles) {
      const nextProfiles = Object.keys(DEFAULT_PDF_PRINT_SETTING_PROFILES).reduce(
        (acc, type) => {
          const documentType = type as PdfDocumentType;

          acc[documentType] = mergeSettings({
            ...DEFAULT_PDF_PRINT_SETTING_PROFILES[documentType],
            ...(parsedSettings.profiles[documentType] || {}),
            document: {
              ...DEFAULT_PDF_PRINT_SETTING_PROFILES[documentType].document,
              ...(parsedSettings.profiles[documentType]?.document || {}),
              type: documentType,
            },
          });

          return acc;
        },
        {} as PdfPrintSettingProfiles
      );

      const currentType =
        (parsedSettings.currentType as PdfDocumentType | undefined) || "statement";

      setPdfPrintSettingProfiles(nextProfiles);
      setPdfPrintSettings(nextProfiles[currentType] || nextProfiles.statement);
      return;
    }

    const migratedSettings = mergeSettings(parsedSettings);
    const currentType = migratedSettings.document.type || "statement";

    const migratedProfiles = {
      ...DEFAULT_PDF_PRINT_SETTING_PROFILES,
      [currentType]: migratedSettings,
    };

    setPdfPrintSettingProfiles(migratedProfiles);
    setPdfPrintSettings(migratedSettings);
  } catch (error) {
    console.error("PDF 설정 불러오기 오류:", error);
    setPdfPrintSettingProfiles(DEFAULT_PDF_PRINT_SETTING_PROFILES);
    setPdfPrintSettings(DEFAULT_PDF_PRINT_SETTINGS);
  }
}, [organization?.id]);

useEffect(() => {
  const currentType = pdfPrintSettings.document.type;
  const savedProfile = pdfPrintSettingProfiles[currentType];

  if (!savedProfile) return;

  setPdfPrintSettings(savedProfile);
}, [pdfPrintSettings.document.type, pdfPrintSettingProfiles]);



  useEffect(() => {
  const fetchStatementItems = async () => {
    const statementIds = statements.map((statement: any) => statement.id).filter(Boolean);

    if (statementIds.length === 0) {
      setStatementItemsMap({});
      return;
    }

    const { data, error } = await supabase
      .from("sales_statement_items")
      .select("id, statement_id, product_name_snapshot, specification_snapshot, unit_snapshot, quantity, sort_order")
      .in("statement_id", statementIds)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("거래명세표 목록 품목 조회 오류:", error);
      setStatementItemsMap({});
      return;
    }

    const nextMap: Record<string, any[]> = {};

    (data || []).forEach((item: any) => {
      if (!nextMap[item.statement_id]) {
        nextMap[item.statement_id] = [];
      }

      nextMap[item.statement_id].push(item);
    });

    setStatementItemsMap(nextMap);
  };

  fetchStatementItems();
}, [statements]);

useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;

    setIsDetailModalOpen(false);
    setIsPdfPreviewOpen(false);
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);

useEffect(() => {
  const fetchRecentCustomerProducts = async () => {
    if (!organization?.id || !customerId || products.length === 0) {
      setRecentCustomerProducts([]);
      return;
    }

    const { data: statementRows, error: statementError } = await supabase
      .from("sales_statements")
      .select("id, statement_date, created_at")
      .eq("organization_id", organization.id)
      .eq("customer_id", customerId)
      .order("statement_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (statementError || !statementRows || statementRows.length === 0) {
      setRecentCustomerProducts([]);
      return;
    }

    const statementIds = statementRows.map((row: any) => row.id);
    const statementOrderMap = new Map<string, number>();

    statementIds.forEach((id: string, index: number) => {
      statementOrderMap.set(id, index);
    });

    const { data: itemRows, error: itemError } = await supabase
      .from("sales_statement_items")
      .select("statement_id, product_id")
      .in("statement_id", statementIds)
      .not("product_id", "is", null);

    if (itemError || !itemRows) {
      setRecentCustomerProducts([]);
      return;
    }

    const usageMap = new Map<string, { count: number; recentOrder: number }>();

    itemRows.forEach((row: any) => {
      if (!row.product_id) return;

      const order = statementOrderMap.get(row.statement_id) ?? 9999;
      const current = usageMap.get(row.product_id);

      if (!current) {
        usageMap.set(row.product_id, {
          count: 1,
          recentOrder: order,
        });
        return;
      }

      usageMap.set(row.product_id, {
        count: current.count + 1,
        recentOrder: Math.min(current.recentOrder, order),
      });
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    const recentProducts = Array.from(usageMap.entries())
      .sort((a, b) => {
        const aUsage = a[1];
        const bUsage = b[1];

        if (bUsage.count !== aUsage.count) {
          return bUsage.count - aUsage.count;
        }

        return aUsage.recentOrder - bUsage.recentOrder;
      })
      .map(([productId]) => productMap.get(productId))
      .filter(Boolean)
      .slice(0, 10) as Product[];

    setRecentCustomerProducts(recentProducts);
  };

  fetchRecentCustomerProducts();
}, [organization?.id, customerId, products]);

const productMatchesKeyword = (product: Product, keyword: string) => {
  const searchText = keyword.trim().toLowerCase();

  if (!searchText) return true;

  const text = [
    product.name,
    product.product_code,
    product.aliases,
    product.specification,
    product.unit,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(searchText);
};

    const getFilteredProducts = (keyword: string) => {
  const searchText = keyword.trim();

  if (!searchText) return [];

  return products
    .filter((product) => productMatchesKeyword(product, keyword))
    .slice(0, 20);
};

  const getFilteredRecentProducts = (keyword: string) => {
    return recentCustomerProducts.filter((product) =>
      productMatchesKeyword(product, keyword)
    );
  };

  const updateItem = (
    index: number,
    field: keyof StatementItemInput,
    value: string | number | boolean
  ) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const selectCustomer = (customer: Customer) => {
  setCustomerId(customer.id);
  setCustomerSearch(customer.name);
  setActiveCustomerIndex(0);

  setFocusedProductRowIndex(0);
  setProductDropdownOpenMap({
    0: true,
  });
  setActiveProductIndexMap({
    0: 0,
  });

  focusItemInput(0, "product");
};

const handleOpenCustomerCreate = () => {
  setNewCustomerForm({
    name: customerSearch.trim(),
    business_number: "",
    ceo_name: "",
    phone: "",
    address: "",
    email: "",
  });
  setShowCustomerExtraFields(false);
  setIsCustomerCreateOpen(true);
};

const handleCreateCustomerAndSelect = async () => {
  if (!organization?.id) {
    alert("회사 정보가 없습니다.");
    return;
  }

  const customerName = newCustomerForm.name.trim();

  if (!customerName) {
    alert("거래처명을 입력해주세요.");
    return;
  }

  setIsCreatingCustomer(true);

  const { data, error } = await supabase
    .from("customers")
    .insert({
  organization_id: organization.id,
  name: customerName,
  business_number: newCustomerForm.business_number.trim() || null,
  phone: newCustomerForm.phone.trim() || null,
  address: newCustomerForm.address.trim() || null,
  email: newCustomerForm.email.trim() || null,
})
    .select("*")
    .single();

  if (error || !data) {
    console.error("거래처 간편 등록 오류:", error);
    alert("거래처 등록 중 오류가 발생했습니다.");
    setIsCreatingCustomer(false);
    return;
  }

  const createdCustomer = data as Customer;

  setCustomers((prev) =>
    [...prev, createdCustomer].sort((a, b) => a.name.localeCompare(b.name))
  );

  selectCustomer(createdCustomer);
  setIsCustomerCreateOpen(false);
  setIsCreatingCustomer(false);
  setToastMessage("거래처가 등록되고 선택되었습니다.");

  setTimeout(() => {
    setToastMessage("");
  }, 3000);
};

const handleCustomerSearchKeyDown = (
  event: React.KeyboardEvent<HTMLInputElement>
) => {
  if (customerId) return;
  if (filteredCustomers.length === 0) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    setActiveCustomerIndex((prev) =>
      Math.min(prev + 1, filteredCustomers.length - 1)
    );
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    setActiveCustomerIndex((prev) => Math.max(prev - 1, 0));
    return;
  }

  if (event.key === "Enter") {
  if (event.nativeEvent.isComposing) return;

  event.preventDefault();
  const selectedCustomer = filteredCustomers[activeCustomerIndex];

  if (selectedCustomer) {
    selectCustomer(selectedCustomer);
  }
}
};
  const selectProduct = (index: number, product: Product) => {
  setFocusedProductRowIndex(null);
  setProductDropdownOpenMap((prev) => ({
    ...prev,
    [index]: false,
  }));

  setItems((prev) =>
    prev.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            product_id: product.id,
            product_search: product.name,
            product_name: product.name,
            specification: product.specification || "",
            unit: product.unit || "",
            unit_price: Number(product.default_price || 0),
            taxable: product.taxable ?? true,
          }
        : item
    )
  );
};

const handleOpenProductCreate = (rowIndex: number) => {
  setProductCreateRowIndex(rowIndex);
  setNewProductForm({
    name: items[rowIndex]?.product_search?.trim() || "",
    specification: items[rowIndex]?.specification || "",
    unit: items[rowIndex]?.unit || "",
    default_price: items[rowIndex]?.unit_price ? String(items[rowIndex].unit_price) : "",
    taxable: items[rowIndex]?.taxable ?? true,
  });
  setShowProductExtraFields(false);
  setIsProductCreateOpen(true);
};

const handleCreateProductAndSelect = async () => {
  if (!organization?.id) {
    alert("회사 정보가 없습니다.");
    return;
  }

  if (productCreateRowIndex === null) {
    alert("품목을 적용할 행을 찾지 못했습니다.");
    return;
  }

  const productName = newProductForm.name.trim();

  if (!productName) {
    alert("품목명을 입력해주세요.");
    return;
  }

  setIsCreatingProduct(true);

  const { data, error } = await supabase
    .from("products")
    .insert({
      organization_id: organization.id,
      name: productName,
      specification: newProductForm.specification.trim() || null,
      unit: newProductForm.unit.trim() || null,
      default_price: Number(newProductForm.default_price || 0),
      taxable: newProductForm.taxable,
      is_active: true,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("품목 간편 등록 오류:", error);
    alert("품목 등록 중 오류가 발생했습니다.");
    setIsCreatingProduct(false);
    return;
  }

  const createdProduct = data as Product;

  setProducts((prev) =>
    [...prev, createdProduct].sort((a, b) => a.name.localeCompare(b.name))
  );

  selectProduct(productCreateRowIndex, createdProduct);
  setIsProductCreateOpen(false);
  setIsCreatingProduct(false);
  setProductCreateRowIndex(null);
  setToastMessage("품목이 등록되고 선택되었습니다.");

  setTimeout(() => {
    setToastMessage("");
  }, 3000);

  focusItemInput(productCreateRowIndex, "quantity");
};

const handleProductSearchKeyDown = (
  event: React.KeyboardEvent<HTMLInputElement>,
  rowIndex: number,
  filteredProducts: Product[]
) => {
  if (event.nativeEvent.isComposing) return;

  if (items[rowIndex]?.product_id) {
    handleItemEnter(event, rowIndex, "product");
    return;
  }

  const recentProducts = getFilteredRecentProducts(items[rowIndex]?.product_search || "");
  const recentProductIds = new Set(recentProducts.map((product) => product.id));
  const normalProducts = filteredProducts.filter(
    (product) => !recentProductIds.has(product.id)
  );
  const selectableProducts = [...recentProducts, ...normalProducts];

  if (event.key === "ArrowDown") {
    event.preventDefault();

    setProductDropdownOpenMap((prev) => ({
      ...prev,
      [rowIndex]: true,
    }));

    if (selectableProducts.length === 0) return;

    setActiveProductIndexMap((prev) => ({
      ...prev,
      [rowIndex]: Math.min(
        (prev[rowIndex] ?? 0) + 1,
        selectableProducts.length - 1
      ),
    }));
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();

    setProductDropdownOpenMap((prev) => ({
      ...prev,
      [rowIndex]: true,
    }));

    if (selectableProducts.length === 0) return;

    setActiveProductIndexMap((prev) => ({
      ...prev,
      [rowIndex]: Math.max((prev[rowIndex] ?? 0) - 1, 0),
    }));
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();

    const isOpen = productDropdownOpenMap[rowIndex];

    if (!isOpen) {
      setProductDropdownOpenMap((prev) => ({
        ...prev,
        [rowIndex]: true,
      }));
      setActiveProductIndexMap((prev) => ({
        ...prev,
        [rowIndex]: 0,
      }));
      return;
    }

    const activeIndex = activeProductIndexMap[rowIndex] ?? 0;
    const selectedProduct = selectableProducts[activeIndex];

    if (selectedProduct) {
      selectProduct(rowIndex, selectedProduct);
      focusItemInput(rowIndex, "quantity");
      return;
    }

    handleOpenProductCreate(rowIndex);
    return;
  }

  handleItemEnter(event, rowIndex, "product");
};
  const addItem = () => {
  setItems((prev) => [...prev, createEmptyItem()]);
};

  const removeItem = (index: number) => {
  setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  setActiveProductIndexMap({});
};

  const focusItemInput = (
  rowIndex: number,
  field: "product" | "specification" | "unit" | "quantity" | "unit_price"
) => {
  setTimeout(() => {
    const input = itemInputRefs.current[`${rowIndex}-${field}`];
    input?.focus();

    if (field === "quantity" || field === "unit_price") {
      input?.select();
    }
  }, 80);
};

const handleItemEnter = (
  event: React.KeyboardEvent<HTMLInputElement>,
  rowIndex: number,
  field: "product" | "specification" | "unit" | "quantity" | "unit_price"
) => {
  if (event.key !== "Enter") return;

  event.preventDefault();

  if (field === "product") {
    focusItemInput(rowIndex, "specification");
    return;
  }

  if (field === "specification") {
    focusItemInput(rowIndex, "unit");
    return;
  }

  if (field === "unit") {
    focusItemInput(rowIndex, "quantity");
    return;
  }

  if (field === "quantity") {
    focusItemInput(rowIndex, "unit_price");
    return;
  }

  if (field === "unit_price") {
  const nextRowIndex = rowIndex + 1;
  const isLastRow = rowIndex === items.length - 1;

  if (isLastRow) {
    setItems((prev) => [...prev, createEmptyItem()]);
  }

  setFocusedProductRowIndex(nextRowIndex);
setProductDropdownOpenMap((prev) => ({
  ...prev,
  [nextRowIndex]: false,
}));
setActiveProductIndexMap((prev) => ({
  ...prev,
  [nextRowIndex]: 0,
}));

focusItemInput(nextRowIndex, "product");
return;
}
};

const handleNumberFocus = (event: React.FocusEvent<HTMLInputElement>) => {
  event.target.select();
};
const handleNumberClick = (event: React.MouseEvent<HTMLInputElement>) => {
  event.currentTarget.select();
};

const parseNumberInput = (value: string) => {
  if (value.trim() === "") return 0;

  const onlyNumber = value.replace(/[^0-9.-]/g, "");
  return Number(onlyNumber || 0);
};
  const resetForm = () => {
  setStatementType("sales");
  setCustomerId("");
  setCustomerSearch("");
  setStatementDate(getToday());
  setMemo("");
  setItems([createEmptyItem(), createEmptyItem()]);
  setEditingStatementId(null);
  setFocusedProductRowIndex(null);
  setProductDropdownOpenMap({});
  setActiveProductIndexMap({});
  setRecentCustomerProducts([]);
};

  const handleSave = async () => {
  if (!organization?.id) {
    alert("회사 정보가 없습니다.");
    return;
  }

  if (!selectedCustomer) {
    alert("거래처를 선택해주세요.");
    return;
  }

  const validItems = items.filter(
    (item) => item.product_name.trim() && Number(item.quantity) > 0
  );

  if (validItems.length === 0) {
    alert("품목을 1개 이상 입력해주세요.");
    return;
  }

  setIsSaving(true);

  const statementPayload = {
    organization_id: organization.id,
    customer_id: selectedCustomer.id,
    statement_type: statementType,
    source_type: "manual",
    statement_date: statementDate,
    customer_name_snapshot: selectedCustomer.name,
    customer_business_no_snapshot: selectedCustomer.business_number || null,
    customer_ceo_snapshot: selectedCustomer.ceo_name || null,
    customer_address_snapshot: selectedCustomer.address || null,
    customer_phone_snapshot: selectedCustomer.phone || null,
    supply_amount: totals.supplyAmount,
    tax_amount: totals.taxAmount,
    total_amount: totals.totalAmount,
    payment_status: "unpaid",
    status: "draft",
    memo: memo || null,
  };

  const { data: statement, error: statementError } = editingStatementId
    ? await supabase
        .from("sales_statements")
        .update(statementPayload)
        .eq("id", editingStatementId)
        .select()
        .single()
    : await supabase
        .from("sales_statements")
        .insert(statementPayload)
        .select()
        .single();

  if (statementError || !statement) {
    console.error(
      editingStatementId ? "거래명세표 수정 오류:" : "거래명세표 저장 오류:",
      statementError
    );
    alert(
      editingStatementId
        ? "거래명세표 수정 중 오류가 발생했습니다."
        : "거래명세표 저장 중 오류가 발생했습니다."
    );
    setIsSaving(false);
    return;
  }

  if (editingStatementId) {
    const { error: deleteItemsError } = await supabase
      .from("sales_statement_items")
      .delete()
      .eq("statement_id", editingStatementId);

    if (deleteItemsError) {
      console.error("기존 품목 삭제 오류:", deleteItemsError);
      alert("기존 품목 삭제 중 오류가 발생했습니다.");
      setIsSaving(false);
      return;
    }
  }

  const itemRows = validItems.map((item, index) => {
    const supplyAmount = Number(item.quantity || 0) * Number(item.unit_price || 0);
    const taxAmount = item.taxable ? Math.floor(supplyAmount * 0.1) : 0;

    return {
      organization_id: organization.id,
      statement_id: statement.id,
      product_id: item.product_id || null,
      product_name_snapshot: item.product_name,
      specification_snapshot: item.specification || null,
      unit_snapshot: item.unit || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      supply_amount: supplyAmount,
      tax_amount: taxAmount,
      total_amount: supplyAmount + taxAmount,
      taxable: item.taxable,
      sort_order: index,
    };
  });

  const { error: itemsError } = await supabase
    .from("sales_statement_items")
    .insert(itemRows);

  if (itemsError) {
    console.error("거래명세표 품목 저장 오류:", itemsError);
    alert("거래명세표 품목 저장 중 오류가 발생했습니다.");
    setIsSaving(false);
    return;
  }

  setRecentSavedStatementId(statement.id);
setToastMessage(editingStatementId ? "거래명세표가 수정되었습니다." : "거래명세표가 저장되었습니다.");

resetForm();
setIsFormOpen(false);
await refetch();
setIsSaving(false);

setTimeout(() => {
  setRecentSavedStatementId(null);
  setToastMessage("");
}, 3000);
};

  const handleDelete = async (statementId: string, statement?: any) => {
  const confirmed = window.confirm(
    statement
      ? `이 거래명세표를 삭제하시겠습니까?\n\n거래처: ${statement.customer_name_snapshot || "-"}\n작성일: ${statement.statement_date || "-"}\n합계: ${formatCurrency(Number(statement.total_amount || 0))}원`
      : "이 거래명세표를 삭제하시겠습니까?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("sales_statements")
    .delete()
    .eq("id", statementId);

  if (error) {
    console.error("거래명세표 삭제 오류:", error);
    alert("거래명세표 삭제 중 오류가 발생했습니다.");
    return;
  }

  setToastMessage("거래명세표가 삭제되었습니다.");

setTimeout(() => {
  setToastMessage("");
}, 3000);

setIsDetailModalOpen(false);
setSelectedStatement(null);
setSelectedItems([]);
setIsPdfPreviewOpen(false);

await refetch();
};

const handleEdit = async (statement: any) => {
  setEditingStatementId(statement.id);

  setStatementType(statement.statement_type);
  setStatementDate(statement.statement_date);
  setMemo(statement.memo || "");

  setCustomerId(statement.customer_id || "");
  setCustomerSearch(statement.customer_name_snapshot || "");

  const { data, error } = await supabase
    .from("sales_statement_items")
    .select("*")
    .eq("statement_id", statement.id)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("거래명세표 수정 조회 오류:", error);
    alert("거래명세표 수정 데이터를 불러오지 못했습니다.");
    return;
  }

  setItems(
    (data || []).map((item: any) => ({
      product_id: item.product_id || "",
      product_search: item.product_name_snapshot || "",
      product_name: item.product_name_snapshot || "",
      specification: item.specification_snapshot || "",
      unit: item.unit_snapshot || "",
      quantity: Number(item.quantity || 1),
      unit_price: Number(item.unit_price || 0),
      taxable: item.taxable ?? true,
    }))
  );

  setSelectedStatement(null);
  setSelectedItems([]);
  setIsDetailModalOpen(false);
  setIsPdfPreviewOpen(false);
setFocusedProductRowIndex(null);
setProductDropdownOpenMap({});
setActiveProductIndexMap({});
setIsFormOpen(true);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const handleCopy = async (statement: any) => {
  setEditingStatementId(null);

  setStatementType(statement.statement_type || "sales");
  setStatementDate(getToday());
  setMemo(statement.memo || "");

  setCustomerId(statement.customer_id || "");
  setCustomerSearch(statement.customer_name_snapshot || "");

  const { data, error } = await supabase
    .from("sales_statement_items")
    .select("*")
    .eq("statement_id", statement.id)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("거래명세표 복사 조회 오류:", error);
    alert("거래명세표 복사 데이터를 불러오지 못했습니다.");
    return;
  }

  setItems(
    (data || []).map((item: any) => ({
      product_id: item.product_id || "",
      product_search: item.product_name_snapshot || "",
      product_name: item.product_name_snapshot || "",
      specification: item.specification_snapshot || "",
      unit: item.unit_snapshot || "",
      quantity: Number(item.quantity || 1),
      unit_price: Number(item.unit_price || 0),
      taxable: item.taxable ?? true,
    }))
  );

  setSelectedStatement(null);
  setSelectedItems([]);
  setIsDetailModalOpen(false);
  setIsPdfPreviewOpen(false);
setFocusedProductRowIndex(null);
setProductDropdownOpenMap({});
setActiveProductIndexMap({});
setIsFormOpen(true);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const handlePreview = async (statement: any) => {
  setSelectedStatement(statement);

  const { data, error } = await supabase
    .from("sales_statement_items")
    .select("*")
    .eq("statement_id", statement.id)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("거래명세표 품목 조회 오류:", error);
    alert("거래명세표 상세 조회 중 오류가 발생했습니다.");
    return;
  }

  setSelectedItems(data || []);
setIsDetailModalOpen(true);
};

const getStatementFileName = () => {
  if (!selectedStatement) return "거래명세표";

  const typeLabel =
    selectedStatement.statement_type === "purchase"
      ? "매입"
      : "매출";

  const customerName =
    selectedStatement.customer_name_snapshot || "거래처";

  const date =
    selectedStatement.statement_date || getToday();

  return `${typeLabel}_거래명세표_${date}_${customerName}`.replace(
    /[\\/:*?"<>|]/g,
    "_"
  );
};
const handleOpenPdfSettings = async () => {
  if (selectedStatement) {
    setIsPdfSettingsOpen(true);
    return;
  }

  const firstStatement = filteredStatements[0];

  if (!firstStatement) {
    setIsPdfSettingsOpen(true);
    return;
  }

  setSelectedStatement(firstStatement);

  const { data, error } = await supabase
    .from("sales_statement_items")
    .select("*")
    .eq("statement_id", firstStatement.id)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("PDF 설정 미리보기 품목 조회 오류:", error);
    setSelectedItems([]);
  } else {
    setSelectedItems(data || []);
  }

  setIsPdfSettingsOpen(true);
};
const handleSavePdfSettings = () => {
  if (!organization?.id) {
    alert("회사 정보가 없습니다.");
    return;
  }

  const storageKey = `statementPdfPrintSettings:${organization.id}`;

  const currentType = pdfPrintSettings.document.type;

const nextProfiles = {
  ...pdfPrintSettingProfiles,
  [currentType]: pdfPrintSettings,
};

setPdfPrintSettingProfiles(nextProfiles);

localStorage.setItem(
  storageKey,
  JSON.stringify({
    currentType,
    profiles: nextProfiles,
  })
);
  setIsPdfSettingsOpen(false);
  setToastMessage("PDF 출력 설정이 저장되었습니다.");

  setTimeout(() => {
    setToastMessage("");
  }, 3000);
};

const handleResetPdfSettings = () => {
  const confirmed = window.confirm("PDF 출력 설정을 기본값으로 복원하시겠습니까?");

  if (!confirmed) return;

  const currentType = pdfPrintSettings.document.type;
const defaultSettings = DEFAULT_PDF_PRINT_SETTING_PROFILES[currentType];

const nextProfiles = {
  ...pdfPrintSettingProfiles,
  [currentType]: defaultSettings,
};

setPdfPrintSettingProfiles(nextProfiles);
setPdfPrintSettings(defaultSettings);
  setToastMessage("PDF 출력 설정이 기본값으로 복원되었습니다.");

  setTimeout(() => {
    setToastMessage("");
  }, 3000);
};
const handleDownloadPdf = async () => {
  if (!previewRef.current) {
    alert("PDF로 출력할 미리보기 영역이 없습니다.");
    return;
  }

  const options: any = {
  margin: [0, 0, 0, 0],
  filename: getStatementFileName() + ".pdf",
  image: { type: "jpeg", quality: 0.98 },
  html2canvas: {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  },
  jsPDF: {
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  },
};

  await html2pdf().set(options).from(previewRef.current).save();
};

const handlePrintPreview = () => {
  if (!previewRef.current) {
    alert("인쇄할 미리보기 영역이 없습니다.");
    return;
  }

  const printWindow = window.open("", "_blank");

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>${getStatementFileName()}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }

          html,
          body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #ffffff;
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-page {
            width: 210mm;
            height: 297mm;
            padding: 6mm;
            overflow: hidden;
            background: #ffffff;
          }

          @media print {
            html,
            body {
              width: 210mm;
              height: 297mm;
              overflow: hidden;
            }

            .print-page {
              page-break-after: avoid;
              page-break-before: avoid;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-page">
          ${previewRef.current.innerHTML}
        </div>
      </body>
    </html>
  `);

    printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
};



const getTypeLabel = (type?: string) => (type === "purchase" ? "매입" : "매출");

const getTaxInvoiceLabel = (issued?: boolean) => {
  return issued ? "발행완료" : "미발행";
};

const handleToggleTaxInvoiceIssued = async (statement: any) => {
  const nextValue = !statement.tax_invoice_issued;

  const { error } = await supabase
    .from("sales_statements")
    .update({
      tax_invoice_issued: nextValue,
    })
    .eq("id", statement.id);

  if (error) {
    console.error("세금계산서 발행 상태 변경 오류:", error);
    alert("세금계산서 상태 변경 중 오류가 발생했습니다.");
    return;
  }

  await refetch();
};

const getPaidAmount = (statement: any) => Number(statement?.paid_amount || 0);

const getRemainingAmount = (statement: any) => {
  const total = Number(statement?.total_amount || 0);
  const remaining = statement?.remaining_amount;

  if (remaining !== undefined && remaining !== null) {
    return Number(remaining || 0);
  }

  return Math.max(total - getPaidAmount(statement), 0);
};


const getStatementItems = (statementId: string) => statementItemsMap[statementId] || [];

const getItemNameSummary = (statementId: string) => {
  const rows = getStatementItems(statementId);
  const first = rows[0];

  if (!first) return "-";

  const name = first.product_name_snapshot || "-";
  return rows.length > 1 ? `${name} 외 ${rows.length - 1}건` : name;
};

const getItemSpecSummary = (statementId: string) => {
  const rows = getStatementItems(statementId);
  const first = rows[0];

  if (!first) return "-";

  const spec = first.specification_snapshot || "-";
  return rows.length > 1 ? `${spec} 외` : spec;
};

const getItemUnitSummary = (statementId: string) => {
  const rows = getStatementItems(statementId);
  const first = rows[0];

  if (!first) return "-";

  const unit = first.unit_snapshot || "-";
  return rows.length > 1 ? `${unit} 외` : unit;
};

const getItemQuantitySummary = (statementId: string) => {
  const rows = getStatementItems(statementId);
  const first = rows[0];

  if (!first) return "-";

  const quantity = formatCurrency(Number(first.quantity || 0));
  return rows.length > 1 ? `${quantity} 외` : quantity;
};

const handleDatePresetClick = (preset: "today" | "thisWeek" | "thisMonth" | "lastMonth") => {
  const range = getDateRangeByPreset(preset);

  setDatePreset(preset);
  setDateFrom(range.from);
  setDateTo(range.to);
};

const handleSort = (key: "statement_date" | "customer" | "total_amount") => {
  if (sortKey === key) {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    return;
  }

  setSortKey(key);
  setSortDirection("asc");
};

const sortMark = (key: "statement_date" | "customer" | "total_amount") => {
  if (sortKey !== key) return "↕";
  return sortDirection === "asc" ? "↑" : "↓";
};

const filteredStatements = useMemo(() => {
  const keyword = listCustomerSearch.trim().toLowerCase();

  return statements
    .filter((statement: any) => {
      const statementDate = statement.statement_date || "";

      if (dateFrom && statementDate < dateFrom) return false;
      if (dateTo && statementDate > dateTo) return false;

      if (!keyword) return true;

      const text = [
        statement.customer_name_snapshot,
        statement.customer_business_no_snapshot,
        statement.customer_ceo_snapshot,
        statement.customer_phone_snapshot,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    })
    .sort((a: any, b: any) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      if (sortKey === "statement_date") {
        aValue = a.statement_date || "";
        bValue = b.statement_date || "";
      }

      if (sortKey === "customer") {
        aValue = a.customer_name_snapshot || "";
        bValue = b.customer_name_snapshot || "";
      }

      if (sortKey === "total_amount") {
        aValue = Number(a.total_amount || 0);
        bValue = Number(b.total_amount || 0);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
  const primaryResult =
    sortDirection === "asc" ? aValue - bValue : bValue - aValue;

  if (primaryResult !== 0) return primaryResult;
} else {
  const primaryResult =
    sortDirection === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));

  if (primaryResult !== 0) return primaryResult;
}

const aCreatedAt = a.created_at || "";
const bCreatedAt = b.created_at || "";

return String(bCreatedAt).localeCompare(String(aCreatedAt));
    });
}, [statements, listCustomerSearch, dateFrom, dateTo, sortKey, sortDirection]);

const totalPages = Math.max(Math.ceil(filteredStatements.length / pageSize), 1);

const paginatedStatements = useMemo(() => {
  const startIndex = (currentPage - 1) * pageSize;
  return filteredStatements.slice(startIndex, startIndex + pageSize);
}, [filteredStatements, currentPage, pageSize]);

useEffect(() => {
  setCurrentPage(1);
}, [listCustomerSearch, dateFrom, dateTo, pageSize]);

const pageStyles: Record<string, React.CSSProperties> = {
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
    width: "100%",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
    boxSizing: "border-box",
  },
};

return (
  <AppLayout>
    <style>{statementPageCss}</style>

    <div
  style={{
    ...pageStyles.page,
    paddingTop: 0,
  }}
>
      <div
  style={{
    ...pageStyles.header,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  }}
>
  <div>
    <h1 style={pageStyles.title}>거래명세표</h1>
    <p style={pageStyles.description}>
      매출/매입 거래명세표를 작성하고 관리합니다.
    </p>
  </div>

  <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
  <button
    type="button"
    onClick={handleOpenPdfSettings}
    style={{
      minWidth: "130px",
      height: "46px",
      padding: "0 18px",
      borderRadius: "12px",
      border: "1px solid #d1d5db",
      background: "#ffffff",
      color: "#374151",
      fontSize: "15px",
      fontWeight: 800,
      cursor: "pointer",
    }}
  >
    PDF 설정
  </button>

  <button
    type="button"
    onClick={() => setIsFormOpen((prev) => !prev)}
    style={{
      minWidth: "180px",
      height: "46px",
      padding: "0 22px",
      borderRadius: "12px",
      border: "1px solid #1d4ed8",
      background: "#2563eb",
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: 800,
      boxShadow: "0 8px 18px rgba(37, 99, 235, 0.22)",
      cursor: "pointer",
    }}
  >
    {isFormOpen ? "작성 닫기" : "새 거래명세표 작성"}
  </button>
</div>
      </div>

      {isFormOpen && (

          <div style={pageStyles.card}>
            <div className="mb-5 flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-semibold">거래명세표 작성</h2>
                <p className="text-sm text-gray-500">
                  거래처와 품목을 검색해서 빠르게 불러올 수 있습니다.
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
  <button
    type="button"
    onClick={() => setStatementType("sales")}
    style={{
      padding: "8px 20px",
      borderRadius: "8px",
      border: statementType === "sales" ? "2px solid #2563eb" : "1px solid #d1d5db",
      backgroundColor: statementType === "sales" ? "#2563eb" : "#ffffff",
      color: statementType === "sales" ? "#ffffff" : "#374151",
      fontWeight: statementType === "sales" ? 700 : 500,
      cursor: "pointer",
    }}
  >
    매출
  </button>

  <button
    type="button"
    onClick={() => setStatementType("purchase")}
    style={{
      padding: "8px 20px",
      borderRadius: "8px",
      border: statementType === "purchase" ? "2px solid #2563eb" : "1px solid #d1d5db",
      backgroundColor: statementType === "purchase" ? "#2563eb" : "#ffffff",
      color: statementType === "purchase" ? "#ffffff" : "#374151",
      fontWeight: statementType === "purchase" ? 700 : 500,
      cursor: "pointer",
    }}
  >
    매입
  </button>
</div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
  <div className="relative">
    <label className="mb-1 block text-sm font-medium">거래처 검색</label>

    <input
  lang="ko"
  autoComplete="off"
  inputMode="text"
  value={customerSearch}
      onChange={(event) => {
        setCustomerSearch(event.target.value);
        setCustomerId("");
        setActiveCustomerIndex(0);
      }}
      onKeyDown={handleCustomerSearchKeyDown}
      className="w-full rounded-lg border px-3 py-2 text-sm"
      placeholder="거래처명, 사업자번호, 전화번호 검색"
    />

    {customerSearch && !customerId && (
      <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border bg-white shadow-lg">
        {filteredCustomers.length === 0 && (
  <div className="px-3 py-3 text-sm">
    <div className="mb-2 text-gray-500">검색 결과가 없습니다.</div>

    <button
      type="button"
      onClick={handleOpenCustomerCreate}
      style={{
        width: "100%",
        padding: "9px 10px",
        borderRadius: "8px",
        border: "1px solid #bfdbfe",
        background: "#eff6ff",
        color: "#1d4ed8",
        fontWeight: 800,
        textAlign: "left",
      }}
    >
      + "{customerSearch.trim()}" 거래처 등록
    </button>
  </div>
)}

        {filteredCustomers.map((customer, customerIndex) => {
          const isActive = customerIndex === activeCustomerIndex;

          return (
            <button
              key={customer.id}
              type="button"
              onMouseEnter={() => setActiveCustomerIndex(customerIndex)}
              onClick={() => selectCustomer(customer)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
              style={{
                background: isActive ? "#eff6ff" : "#ffffff",
                borderLeft: isActive ? "4px solid #2563eb" : "4px solid transparent",
              }}
            >
              <div className="font-medium">{customer.name}</div>
              <div className="text-xs text-gray-500">
                {customer.business_number || "-"} · {customer.phone || "-"}
              </div>
            </button>
          );
        })}
      </div>
    )}
  </div>

  <div>
    <label className="mb-1 block text-sm font-medium">작성일</label>
    <input
      type="date"
      value={statementDate}
      onChange={(event) => setStatementDate(event.target.value)}
      className="w-full rounded-lg border px-3 py-2 text-sm"
    />
  </div>

  <div>
    <label className="mb-1 block text-sm font-medium">메모</label>
    <input
      value={memo}
      onChange={(event) => setMemo(event.target.value)}
      className="w-full rounded-lg border px-3 py-2 text-sm"
      placeholder="내부 메모"
    />
  </div>
</div>
            <div className="rounded-xl border" style={{ overflow: "visible" }}>
              <table
  className="w-full min-w-[1000px] border-collapse text-sm"
  style={{ overflow: "visible" }}
>
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-3 py-3 text-left">품목 검색</th>
                    <th className="px-3 py-3 text-left">규격</th>
                    <th className="px-3 py-3 text-left">단위</th>
                    <th className="px-3 py-3 text-right">수량</th>
                    <th className="px-3 py-3 text-right">단가</th>
                    <th className="px-3 py-3 text-right">공급가액</th>
                    <th className="px-3 py-3 text-right">세액</th>
                    <th className="px-3 py-3 text-center">과세</th>
                    <th className="px-3 py-3 text-center">삭제</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => {
                    const supply =
                      Number(item.quantity || 0) * Number(item.unit_price || 0);
                    const tax = item.taxable ? Math.floor(supply * 0.1) : 0;
                    const filteredProducts = getFilteredProducts(item.product_search);

                    return (
                      <tr
  key={index}
  className="border-b"
  style={{
    position: "relative",
    zIndex:
  (item.product_search || focusedProductRowIndex === index) && !item.product_id
    ? 1000
    : 1,
  }}
>
                        <td className="px-3 py-2" style={{ position: "relative", zIndex: 1001 }}>
  <div style={{ position: "relative", width: "100%" }}>
    <input
  lang="ko"
  autoComplete="off"
  inputMode="text"
  ref={(element) => {
    itemInputRefs.current[`${index}-product`] = element;
  }}
  onFocus={() => setFocusedProductRowIndex(index)}
value={item.product_search}
      onChange={(event) => {
        updateItem(index, "product_search", event.target.value);
        updateItem(index, "product_id", "");
        updateItem(index, "product_name", event.target.value);
        setProductDropdownOpenMap((prev) => ({
          ...prev,
          [index]: true,
        }));
        setActiveProductIndexMap((prev) => ({
          ...prev,
          [index]: 0,
        }));
      }}
      onKeyDown={(event) =>
        handleProductSearchKeyDown(event, index, filteredProducts)
      }
      className="w-full rounded-lg border px-3 py-2"
      placeholder="품목명, 코드, 별칭 검색"
    />

    {customerId && productDropdownOpenMap[index] && !item.product_id && (
      <div
        className="overflow-y-auto rounded-lg border bg-white shadow-lg"
        style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          width: "420px",
          zIndex: 9999,
          maxHeight: "260px",
        }}
      >
        {(() => {
  const recentProducts = getFilteredRecentProducts(item.product_search);
  const recentProductIds = new Set(recentProducts.map((product) => product.id));
  const normalProducts = filteredProducts.filter(
    (product) => !recentProductIds.has(product.id)
  );

  const hasNoProducts = recentProducts.length === 0 && normalProducts.length === 0;

  return (
    <>
      {hasNoProducts && (
        <div className="px-3 py-3 text-sm">
          <div className="mb-2 text-gray-500">검색 결과가 없습니다.</div>

          <button
            type="button"
            onClick={() => handleOpenProductCreate(index)}
            style={{
              width: "100%",
              padding: "9px 10px",
              borderRadius: "8px",
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontWeight: 800,
              textAlign: "left",
            }}
          >
            + "{item.product_search.trim()}" 품목 등록
          </button>
        </div>
      )}

      {recentProducts.length > 0 && (
        <div>
          <div
            style={{
              padding: "8px 12px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#92400e",
              background: "#fffbeb",
              borderBottom: "1px solid #fde68a",
            }}
          >
            ⭐ 최근 사용 품목
          </div>

          {recentProducts.map((product, recentIndex) => {
  const isActive = recentIndex === (activeProductIndexMap[index] ?? 0);

  return (
  <button
    key={`recent-${product.id}`}
              type="button"
              onClick={() => {
                selectProduct(index, product);
                focusItemInput(index, "quantity");
              }}
              className="block w-full px-3 py-2 text-left hover:bg-blue-50"
              style={{
  background: isActive ? "#fffbeb" : "#ffffff",
  borderLeft: isActive ? "4px solid #f59e0b" : "4px solid transparent",
}}
            >
              <div className="font-medium">{product.name}</div>
              <div className="text-xs text-gray-500">
                {product.product_code || "-"} ·{" "}
                {product.specification || "-"} ·{" "}
                {formatCurrency(Number(product.default_price || 0))}원
              </div>
            </button>
            );
          })}
        </div>
      )}

      {normalProducts.length > 0 && (
        <div>
          {recentProducts.length > 0 && (
            <div
              style={{
                padding: "8px 12px",
                fontSize: "12px",
                fontWeight: 800,
                color: "#6b7280",
                background: "#f9fafb",
                borderTop: "1px solid #e5e7eb",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              전체 품목
            </div>
          )}

          {normalProducts.map((product, productIndex) => {
  const actualIndex = recentProducts.length + productIndex;
  const isActive = actualIndex === (activeProductIndexMap[index] ?? 0);

            return (
              <button
                key={product.id}
                type="button"
                onMouseEnter={() =>
                  setActiveProductIndexMap((prev) => ({
                    ...prev,
                    [index]: actualIndex,
                  }))
                }
                onClick={() => {
                  selectProduct(index, product);
                  focusItemInput(index, "quantity");
                }}
                className="block w-full px-3 py-2 text-left hover:bg-blue-50"
                style={{
                  background: isActive ? "#eff6ff" : "#ffffff",
                  borderLeft: isActive ? "4px solid #2563eb" : "4px solid transparent",
                }}
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-gray-500">
                  {product.product_code || "-"} ·{" "}
                  {product.specification || "-"} ·{" "}
                  {formatCurrency(Number(product.default_price || 0))}원
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
})()}

        
      </div>
    )}
  </div>
</td>

                        <td className="px-3 py-2">
                          <input
  ref={(element) => {
    itemInputRefs.current[`${index}-specification`] = element;
  }}
  value={item.specification}
  onChange={(event) =>
    updateItem(index, "specification", event.target.value)
  }
  onKeyDown={(event) => handleItemEnter(event, index, "specification")}
  className="w-full rounded-lg border px-3 py-2"
/>
                        </td>

                        <td className="px-3 py-2">
                          <input
  ref={(element) => {
    itemInputRefs.current[`${index}-unit`] = element;
  }}
  value={item.unit}
  onChange={(event) =>
    updateItem(index, "unit", event.target.value)
  }
  onKeyDown={(event) => handleItemEnter(event, index, "unit")}
  className="w-full rounded-lg border px-3 py-2"
/>
                        </td>

                        <td className="px-3 py-2 text-right">
                          <input
  type="text"
  ref={(element) => {
    itemInputRefs.current[`${index}-quantity`] = element;
  }}
  value={item.quantity === 0 ? "" : String(item.quantity)}
  onFocus={handleNumberFocus}
onClick={handleNumberClick}
  onKeyDown={(event) => handleItemEnter(event, index, "quantity")}
  onChange={(event) =>
    updateItem(index, "quantity", parseNumberInput(event.target.value))
  }
  className="w-24 rounded-lg border px-3 py-2 text-right"
/>
                        </td>

                        <td className="px-3 py-2 text-right">
                          <input
  type="text"
  ref={(element) => {
    itemInputRefs.current[`${index}-unit_price`] = element;
  }}
  value={item.unit_price === 0 ? "" : String(item.unit_price)}
  onFocus={handleNumberFocus}
onClick={handleNumberClick}
  onKeyDown={(event) => handleItemEnter(event, index, "unit_price")}
  onChange={(event) =>
    updateItem(index, "unit_price", parseNumberInput(event.target.value))
  }
  className="w-32 rounded-lg border px-3 py-2 text-right"
/>
                        </td>

                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(supply)}원
                        </td>

                        <td className="px-3 py-2 text-right">
                          {formatCurrency(tax)}원
                        </td>

                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={item.taxable}
                            onChange={(event) =>
                              updateItem(index, "taxable", event.target.checked)
                            }
                          />
                        </td>

                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="rounded-lg border px-3 py-1 text-xs disabled:opacity-40"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex items-start justify-between">
              <button
                type="button"
                onClick={addItem}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                + 품목 추가
              </button>

              <div className="w-80 rounded-xl border bg-gray-50 p-4 text-sm">
                <div className="flex justify-between py-1">
                  <span>공급가액</span>
                  <strong>{formatCurrency(totals.supplyAmount)}원</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>세액</span>
                  <strong>{formatCurrency(totals.taxAmount)}원</strong>
                </div>
                <div className="mt-2 flex justify-between border-t pt-3 text-lg">
                  <span className="font-bold">합계</span>
                  <strong className="text-blue-700">
                    {formatCurrency(totals.totalAmount)}원
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsFormOpen(false);
                }}
                className="rounded-lg border px-5 py-2 text-sm font-medium"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSaving
  ? editingStatementId
    ? "수정 중..."
    : "저장 중..."
  : editingStatementId
    ? "수정 저장"
    : "저장"}
              </button>
            </div>
          </div>
        )}

        

          <section style={pageStyles.card}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">거래명세표 목록</h2>
            <p className="mt-1 text-sm text-gray-500">
              거래명세표 작성, 조회, 수정, 삭제, PDF 발행을 관리합니다.
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            총 {filteredStatements.length}건
          </span>
        </div>

        <div
          className="mb-4 rounded-xl border bg-gray-50 p-4"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(240px, 1fr) 170px 170px auto",
            gap: "12px",
            alignItems: "end",
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-medium">거래처 검색</label>
            <input
              value={listCustomerSearch}
              onChange={(event) => setListCustomerSearch(event.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="거래처명, 사업자번호, 대표자, 전화번호"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">시작일</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDatePreset("custom");
                setDateFrom(event.target.value);
              }}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">종료일</label>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDatePreset("custom");
                setDateTo(event.target.value);
              }}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[
              ["today", "오늘"],
              ["thisWeek", "이번주"],
              ["thisMonth", "이번달"],
              ["lastMonth", "지난달"],
            ].map(([preset, label]) => (
              <button
                key={preset}
                type="button"
                onClick={() =>
                  handleDatePresetClick(
                    preset as "today" | "thisWeek" | "thisMonth" | "lastMonth"
                  )
                }
                style={{
                  height: "38px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: datePreset === preset ? "1px solid #2563eb" : "1px solid #d1d5db",
                  background: datePreset === preset ? "#eff6ff" : "#ffffff",
                  color: datePreset === preset ? "#1d4ed8" : "#374151",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <p className="text-sm text-gray-500">불러오는 중입니다.</p>}

        {error && (
          <p className="text-sm text-red-500">
            거래명세표를 불러오지 못했습니다.
          </p>
        )}

        {!isLoading && !error && filteredStatements.length === 0 && (
          <div
            style={{
              minHeight: "260px",
              border: "1px dashed #d1d5db",
              borderRadius: "14px",
              background: "#f9fafb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "32px",
            }}
          >
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#374151" }}>
                조회된 거래명세표가 없습니다
              </div>
              <p style={{ marginTop: "8px", color: "#6b7280", fontSize: "14px" }}>
                거래처 검색어나 기간을 변경해서 다시 확인해주세요.
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && filteredStatements.length > 0 && (
          <>
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full min-w-[1000px] border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-3 py-3 text-left">구분</th>
                    <th
                      className="px-3 py-3 text-left"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("statement_date")}
                    >
                      작성일 {sortMark("statement_date")}
                    </th>
                    <th
                      className="px-3 py-3 text-left"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("customer")}
                    >
                      거래처 {sortMark("customer")}
                    </th>
                    <th className="px-3 py-3 text-left">품목명</th>
<th className="px-3 py-3 text-left">규격</th>
<th className="px-3 py-3 text-left">단위</th>
<th className="px-3 py-3 text-right">수량</th>
                    <th
                      className="px-3 py-3 text-right"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("total_amount")}
                    >
                      합계 {sortMark("total_amount")}
                    </th>
                    <th className="px-3 py-3 text-left">세금계산서</th>
                    <th className="px-3 py-3 text-center">작업</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedStatements.map((statement: any) => (
                    <tr
  key={statement.id}
  className="hover:bg-gray-50"
  style={{
    background:
      recentSavedStatementId === statement.id ? "#fef3c7" : undefined,
    transition: "background 0.3s ease",
  }}
>
                      <td className="px-3 py-3">
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 8px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 700,
                            background:
                              statement.statement_type === "purchase"
                                ? "#f3e8ff"
                                : "#dbeafe",
                            color:
                              statement.statement_type === "purchase"
                                ? "#7e22ce"
                                : "#1d4ed8",
                          }}
                        >
                          {getTypeLabel(statement.statement_type)}
                        </span>
                      </td>

                      <td className="px-3 py-3">{statement.statement_date}</td>

                      <td className="px-3 py-3 font-medium">
                        {statement.customer_name_snapshot || "-"}
                      </td>

                      <td className="px-3 py-3 font-medium">
                        {getItemNameSummary(statement.id)}
                      </td>

                      <td className="px-3 py-3 text-gray-600">
  {getItemSpecSummary(statement.id)}
</td>

<td className="px-3 py-3 text-gray-600">
  {getItemUnitSummary(statement.id)}
</td>

<td className="px-3 py-3 text-right">
  {getItemQuantitySummary(statement.id)}
</td>

                      <td className="px-3 py-3 text-right font-semibold">
                        {formatCurrency(Number(statement.total_amount || 0))}원
                      </td>

                      <td className="px-3 py-3">
  <button
    type="button"
    onClick={() => handleToggleTaxInvoiceIssued(statement)}
    title={
      statement.tax_invoice_issued
        ? "클릭하면 미발행으로 변경됩니다"
        : "클릭하면 발행완료로 변경됩니다"
    }
    style={{
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "82px",
  padding: "5px 0",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 800,
  border: "none",
  cursor: "pointer",
  background: statement.tax_invoice_issued ? "#dcfce7" : "#fee2e2",
  color: statement.tax_invoice_issued ? "#15803d" : "#b91c1c",
  whiteSpace: "nowrap",
}}
  >
    {statement.tax_invoice_issued ? "🟢 " : "🔴 "}
    {getTaxInvoiceLabel(statement.tax_invoice_issued)}
  </button>
</td>

                      <td className="px-3 py-3 text-center">
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            type="button"
                            onClick={() => handlePreview(statement)}
                            style={{
                              padding: "7px 10px",
                              background: "#eff6ff",
                              color: "#1d4ed8",
                              border: "none",
                              borderRadius: "8px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            보기
                          </button>

                          <button
  type="button"
  onClick={() => handleEdit(statement)}
  style={{
    padding: "7px 10px",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
  }}
>
  수정
</button>

<button
  type="button"
  onClick={() => handleCopy(statement)}
  style={{
    padding: "7px 10px",
    background: "#ecfdf5",
    color: "#047857",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
  }}
>
  복사
</button>

<button
  type="button"
  onClick={() => handleDelete(statement.id, statement)}
                            style={{
                              padding: "7px 10px",
                              background: "#fee2e2",
                              color: "#b91c1c",
                              border: "none",
                              borderRadius: "8px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="text-sm text-gray-600">페이지당</span>
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <option value={20}>20건</option>
                  <option value={50}>50건</option>
                  <option value={100}>100건</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                >
                  이전
                </button>

                <span className="text-sm font-semibold text-gray-700">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {selectedStatement && isDetailModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "980px",
              maxHeight: "92vh",
              overflow: "auto",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "22px",
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.35)",
            }}
          >
            <div className="mb-4 flex items-start justify-between border-b pb-4">
              <div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "4px 8px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 700,
                      background:
                        selectedStatement.statement_type === "purchase"
                          ? "#f3e8ff"
                          : "#dbeafe",
                      color:
                        selectedStatement.statement_type === "purchase"
                          ? "#7e22ce"
                          : "#1d4ed8",
                    }}
                  >
                    {getTypeLabel(selectedStatement.statement_type)}
                  </span>

                
                </div>

                <h2 className="text-2xl font-bold">
                  {selectedStatement.customer_name_snapshot || "-"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  작성일 {selectedStatement.statement_date || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsPdfPreviewOpen(false);
                }}
                style={{
                  padding: "7px 12px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                닫기
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                ["공급가액", Number(selectedStatement.supply_amount || 0), "#f9fafb", "#111827"],
                ["세액", Number(selectedStatement.tax_amount || 0), "#f9fafb", "#111827"],
                ["합계", Number(selectedStatement.total_amount || 0), "#eff6ff", "#1d4ed8"],
              ].map(([label, amount, background, color]) => (
                <div
                  key={String(label)}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "14px",
                    background: String(background),
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 700 }}>
                    {label}
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: label === "합계" ? "22px" : "18px",
                      fontWeight: 800,
                      color: String(color),
                    }}
                  >
                    {formatCurrency(Number(amount || 0))}원
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border mb-5">
              <div className="border-b bg-gray-50 px-4 py-3 font-semibold">
                거래처 정보
              </div>
              <div style={{ padding: "16px", display: "grid", gap: "10px", fontSize: "14px" }}>
                {[
                  ["사업자번호", selectedStatement.customer_business_no_snapshot || "-"],
                  ["대표자", selectedStatement.customer_ceo_snapshot || "-"],
                  ["전화번호", selectedStatement.customer_phone_snapshot || "-"],
                  ["주소", selectedStatement.customer_address_snapshot || "-"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                    <span style={{ color: "#6b7280" }}>{label}</span>
                    <span style={{ fontWeight: 700, textAlign: "right" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border mb-5">
              <div className="border-b bg-gray-50 px-4 py-3 font-semibold">
                품목내역
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-2 text-left">품목</th>
                      <th className="px-4 py-2 text-left">규격</th>
                      <th className="px-4 py-2 text-left">단위</th>
                      <th className="px-4 py-2 text-right">수량</th>
                      <th className="px-4 py-2 text-right">단가</th>
                      <th className="px-4 py-2 text-right">공급가액</th>
                      <th className="px-4 py-2 text-right">세액</th>
                      <th className="px-4 py-2 text-right">합계</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedItems.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-3 text-center text-gray-500">
                          품목 내역이 없습니다.
                        </td>
                      </tr>
                    )}

                    {selectedItems.map((item) => (
                      <tr key={item.id || `${item.product_name_snapshot}-${item.sort_order}`} className="border-b">
                        <td className="px-4 py-3 font-semibold">
                          {item.product_name_snapshot || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {item.specification_snapshot || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {item.unit_snapshot || "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(Number(item.quantity || 0))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(Number(item.unit_price || 0))}원
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(Number(item.supply_amount || 0))}원
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(Number(item.tax_amount || 0))}원
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatCurrency(Number(item.total_amount || 0))}원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedStatement.memo && (
              <div className="rounded-xl border bg-gray-50 p-4 mb-5">
                <div style={{ fontWeight: 800, marginBottom: "6px" }}>메모</div>
                <div style={{ fontSize: "14px", color: "#374151" }}>
                  {selectedStatement.memo}
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setIsPdfPreviewOpen(true)}
                style={{
                  height: "40px",
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                PDF 보기
              </button>

              <button
                type="button"
                onClick={handlePrintPreview}
                style={{
                  height: "40px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                인쇄
              </button>

              <button
                type="button"
                onClick={() => handleEdit(selectedStatement)}
                style={{
                  height: "40px",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                수정
              </button>

<button
  type="button"
  onClick={() => handleCopy(selectedStatement)}
  style={{
    height: "40px",
    background: "#ecfdf5",
    color: "#047857",
    border: "none",
    borderRadius: "10px",
    fontWeight: 800,
    cursor: "pointer",
  }}
>
  복사
</button>
              <button
                type="button"
                onClick={() => handleDelete(selectedStatement.id, selectedStatement)}
                style={{
                  height: "40px",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                삭제
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsPdfPreviewOpen(false);
                }}
                style={{
                  height: "40px",
                  background: "#ffffff",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedStatement && (
  <div
    style={{
      position: "fixed",
      left: "-10000px",
      top: 0,
      width: "210mm",
      height: "297mm",
      overflow: "hidden",
    }}
  >
    <div ref={previewRef}>
      <StatementPdfRenderer
  selectedStatement={selectedStatement}
  selectedItems={selectedItems}
  pdfPrintSettings={pdfPrintSettings}
  formatCurrency={formatCurrency}
  getPaidAmount={getPaidAmount}
  getRemainingAmount={getRemainingAmount}
  organization={organization}
/>
    </div>
  </div>
)}

      {selectedStatement && isPdfPreviewOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1100px",
              maxHeight: "92vh",
              overflow: "auto",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.35)",
            }}
          >
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold">거래명세표 PDF 미리보기</h3>
                <p className="text-sm text-gray-500">
                  실제 PDF/인쇄 양식입니다.
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  style={{
                    height: "38px",
                    padding: "0 14px",
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  PDF 다운로드
                </button>
                <button
                  type="button"
                  onClick={handlePrintPreview}
                  style={{
                    height: "38px",
                    padding: "0 14px",
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  인쇄
                </button>
                <button
                  type="button"
                  onClick={() => setIsPdfPreviewOpen(false)}
                  style={{
                    height: "38px",
                    padding: "0 14px",
                    background: "#ffffff",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  닫기
                </button>
              </div>
            </div>

            <div
  style={{
    display: "flex",
    justifyContent: "center",
    overflow: "auto",
    background: "#f3f4f6",
    padding: "16px",
  }}
>
  <StatementPdfRenderer
  selectedStatement={selectedStatement}
  selectedItems={selectedItems}
  pdfPrintSettings={pdfPrintSettings}
  formatCurrency={formatCurrency}
  getPaidAmount={getPaidAmount}
  getRemainingAmount={getRemainingAmount}
  organization={organization}
/>
</div>
          </div>
        </div>
      )}
  
                {isCustomerCreateOpen && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 20000,
      background: "rgba(0, 0, 0, 0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "520px",
        background: "#ffffff",
        borderRadius: "16px",
        padding: "22px",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.3)",
      }}
    >
      <div className="mb-4 flex items-start justify-between border-b pb-3">
        <div>
          <h3 className="text-xl font-bold">거래처 간편 등록</h3>
          <p className="mt-1 text-sm text-gray-500">
            등록 후 현재 거래명세표의 거래처로 자동 선택됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCustomerCreateOpen(false)}
          className="rounded-lg border px-3 py-2 text-sm font-medium"
        >
          닫기
        </button>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        <div>
          <label className="mb-1 block text-sm font-medium">거래처명 *</label>
          <input
            value={newCustomerForm.name}
            onChange={(event) =>
              setNewCustomerForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="거래처명"
          />
        </div>

        <button
  type="button"
  onClick={() => setShowCustomerExtraFields((prev) => !prev)}
  className="rounded-lg border px-3 py-2 text-sm font-semibold"
  style={{
    textAlign: "left",
    background: "#f9fafb",
  }}
>
  {showCustomerExtraFields ? "▲ 추가 정보 닫기" : "▼ 추가 정보 입력"}
</button>

{showCustomerExtraFields && (
  <>
    <div>
      <label className="mb-1 block text-sm font-medium">사업자번호</label>
      <input
        value={newCustomerForm.business_number}
        onChange={(event) =>
          setNewCustomerForm((prev) => ({
            ...prev,
            business_number: event.target.value,
          }))
        }
        className="w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="사업자번호"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium">대표자</label>
      <input
        value={newCustomerForm.ceo_name}
        onChange={(event) =>
          setNewCustomerForm((prev) => ({
            ...prev,
            ceo_name: event.target.value,
          }))
        }
        className="w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="대표자명"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium">전화번호</label>
      <input
        value={newCustomerForm.phone}
        onChange={(event) =>
          setNewCustomerForm((prev) => ({
            ...prev,
            phone: event.target.value,
          }))
        }
        className="w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="전화번호"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium">주소</label>
      <input
        value={newCustomerForm.address}
        onChange={(event) =>
          setNewCustomerForm((prev) => ({
            ...prev,
            address: event.target.value,
          }))
        }
        className="w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="주소"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium">이메일</label>
      <input
        value={newCustomerForm.email}
        onChange={(event) =>
          setNewCustomerForm((prev) => ({
            ...prev,
            email: event.target.value,
          }))
        }
        className="w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="이메일"
      />
    </div>
  </>
)}
</div>
      <div className="mt-5 flex justify-end gap-2 border-t pt-4">
        <button
          type="button"
          onClick={() => setIsCustomerCreateOpen(false)}
          className="rounded-lg border px-5 py-2 text-sm font-medium"
        >
          취소
        </button>

        <button
          type="button"
          onClick={handleCreateCustomerAndSelect}
          disabled={isCreatingCustomer}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isCreatingCustomer ? "등록 중..." : "등록 후 선택"}
        </button>
      </div>
    </div>
  </div>
)}

{isProductCreateOpen && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 20000,
      background: "rgba(0, 0, 0, 0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "520px",
        background: "#ffffff",
        borderRadius: "16px",
        padding: "22px",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.3)",
      }}
    >
      <div className="mb-4 flex items-start justify-between border-b pb-3">
        <div>
          <h3 className="text-xl font-bold">품목 간편 등록</h3>
          <p className="mt-1 text-sm text-gray-500">
            등록 후 현재 행의 품목으로 자동 선택됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsProductCreateOpen(false)}
          className="rounded-lg border px-3 py-2 text-sm font-medium"
        >
          닫기
        </button>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        <div>
          <label className="mb-1 block text-sm font-medium">품목명 *</label>
          <input
            value={newProductForm.name}
            onChange={(event) =>
              setNewProductForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="품목명"
          />
        </div>

        <button
  type="button"
  onClick={() => setShowProductExtraFields((prev) => !prev)}
  className="rounded-lg border px-3 py-2 text-sm font-semibold"
  style={{
    textAlign: "left",
    background: "#f9fafb",
  }}
>
  {showProductExtraFields ? "▲ 추가 정보 닫기" : "▼ 추가 정보 입력"}
</button>

{showProductExtraFields && (
  <>
    <div>
      <label className="mb-1 block text-sm font-medium">규격</label>
      <input
        value={newProductForm.specification}
        onChange={(event) =>
          setNewProductForm((prev) => ({
            ...prev,
            specification: event.target.value,
          }))
        }
        className="w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="규격"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium">단위</label>
      <input
        value={newProductForm.unit}
        onChange={(event) =>
          setNewProductForm((prev) => ({
            ...prev,
            unit: event.target.value,
          }))
        }
        className="w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="단위"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium">기본단가</label>
      <input
        type="text"
        inputMode="numeric"
        value={newProductForm.default_price}
        onChange={(event) =>
          setNewProductForm((prev) => ({
            ...prev,
            default_price: event.target.value.replace(/[^0-9]/g, ""),
          }))
        }
        className="w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="기본단가"
      />
    </div>

    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        fontWeight: 700,
      }}
    >
      <input
        type="checkbox"
        checked={newProductForm.taxable}
        onChange={(event) =>
          setNewProductForm((prev) => ({
            ...prev,
            taxable: event.target.checked,
          }))
        }
      />
      과세 품목
    </label>
  </>
)}
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t pt-4">
        <button
          type="button"
          onClick={() => setIsProductCreateOpen(false)}
          className="rounded-lg border px-5 py-2 text-sm font-medium"
        >
          취소
        </button>

        <button
          type="button"
          onClick={handleCreateProductAndSelect}
          disabled={isCreatingProduct}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isCreatingProduct ? "등록 중..." : "등록 후 선택"}
        </button>
      </div>
    </div>
  </div>
)}

<PdfSettingsModal
  isOpen={isPdfSettingsOpen}
  pdfPrintSettings={pdfPrintSettings}
  setPdfPrintSettings={setPdfPrintSettings}
  selectedStatement={selectedStatement}
  selectedItems={selectedItems}
  formatCurrency={formatCurrency}
  getPaidAmount={getPaidAmount}
  getRemainingAmount={getRemainingAmount}
  organization={organization}
  onClose={() => setIsPdfSettingsOpen(false)}
  onReset={handleResetPdfSettings}
  onSave={handleSavePdfSettings}
/>
{toastMessage && (
  <div
          style={{
            position: "fixed",
            right: "24px",
            bottom: "24px",
            zIndex: 9999,
            background: "#111827",
            color: "#ffffff",
            padding: "16px 24px",
borderRadius: "14px",
fontSize: "16px",
fontWeight: 700,
minWidth: "260px",
textAlign: "center",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.25)",
          }}
        >
          ✅ {toastMessage}
        </div>
      )}
    </div>
  </AppLayout>
);
}
