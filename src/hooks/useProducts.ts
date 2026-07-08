import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useOrganization } from "../contexts/OrganizationContext";

export type Product = {
  id: string;
  organization_id: string;
  product_code: string | null;
  name: string;
  specification: string | null;
  unit: string | null;
  default_price: number;
  taxable: boolean;
  is_active: boolean;
  aliases: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductInput = {
  product_code?: string;
  name: string;
  specification?: string;
  unit?: string;
  default_price?: number;
  taxable?: boolean;
  is_active?: boolean;
  aliases?: string;
  memo?: string;
};

export function useProducts() {
  const { organization } = useOrganization();
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!organization?.id) return;

    setIsLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("품목 조회 오류:", error);
      setIsLoading(false);
      return;
    }

    setData((data || []) as Product[]);
    setIsLoading(false);
  }, [organization?.id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, refetch };
}

export function useCreateProduct() {
  const { organization } = useOrganization();
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (input: ProductInput) => {
    if (!organization?.id) {
      throw new Error("회사 정보가 없습니다.");
    }

    setIsPending(true);

    const { data, error } = await supabase
      .from("products")
      .insert({
        organization_id: organization.id,
        product_code: input.product_code || null,
        name: input.name,
        specification: input.specification || null,
        unit: input.unit || null,
        default_price: input.default_price || 0,
        taxable: input.taxable ?? true,
        is_active: input.is_active ?? true,
        aliases: input.aliases || null,
        memo: input.memo || null,
      })
      .select()
      .single();

    setIsPending(false);

    if (error) throw error;
    return data as Product;
  };

  return { mutateAsync, isPending };
}

export function useUpdateProduct() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async ({
    id,
    input,
  }: {
    id: string;
    input: ProductInput;
  }) => {
    setIsPending(true);

    const { data, error } = await supabase
      .from("products")
      .update({
        product_code: input.product_code || null,
        name: input.name,
        specification: input.specification || null,
        unit: input.unit || null,
        default_price: input.default_price || 0,
        taxable: input.taxable ?? true,
        is_active: input.is_active ?? true,
        aliases: input.aliases || null,
        memo: input.memo || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    setIsPending(false);

    if (error) throw error;
    return data as Product;
  };

  return { mutateAsync, isPending };
}

export function useDeleteProduct() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (id: string) => {
    setIsPending(true);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    setIsPending(false);

    if (error) throw error;
  };

  return { mutateAsync, isPending };
}