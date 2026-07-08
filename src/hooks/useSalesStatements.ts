import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useOrganization } from "../contexts/OrganizationContext";

export interface SalesStatement {
  id: string;
  organization_id: string;
  customer_id: string | null;
  statement_no: string | null;
  statement_date: string;
  customer_name_snapshot: string;
  supply_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_status: string;
  status: string;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export function useSalesStatements() {
  const { organization } = useOrganization();

  const [data, setData] = useState<SalesStatement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!organization?.id) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("sales_statements")
      .select("*")
      .eq("organization_id", organization.id)
      .order("statement_date", { ascending: false });

    if (error) {
      console.error("거래명세표 조회 오류:", error);
      setError(error);
      setData([]);
    } else {
      setData((data || []) as SalesStatement[]);
    }

    setIsLoading(false);
  }, [organization?.id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}