import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useOrganization } from "../contexts/OrganizationContext";

export type CustomerType = "sales" | "purchase" | "both";

export type Customer = {
  id: string;
  organization_id: string;

  name: string;
  business_number: string | null;
  representative_name: string | null;
  address: string | null;
  business_type: string | null;
  business_item: string | null;
  customer_type: CustomerType;
  phone: string | null;
  fax: string | null;
  email: string | null;
  memo: string | null;

  created_at: string;
  updated_at: string;
};

export type CreateCustomerPayload = Omit<
  Customer,
  "id" | "created_at" | "updated_at"
>;

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

export function useCustomers() {
  const { organization } = useOrganization();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    if (!organization?.id) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("거래처 조회 오류:", error);
    } else {
      setCustomers((data || []) as Customer[]);
    }

    setLoading(false);
  };

  const createCustomer = async (payload: CreateCustomerPayload) => {
    const { error } = await supabase.from("customers").insert(payload);

    if (error) {
      console.error("거래처 등록 오류:", error);
      return false;
    }

    await fetchCustomers();
    return true;
  };

  const updateCustomer = async (id: string, payload: UpdateCustomerPayload) => {
    const { error } = await supabase
      .from("customers")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("거래처 수정 오류:", error);
      return false;
    }

    await fetchCustomers();
    return true;
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) {
      console.error("거래처 삭제 오류:", error);
      return false;
    }

    await fetchCustomers();
    return true;
  };

  useEffect(() => {
    fetchCustomers();
  }, [organization?.id]);

  return {
    customers,
    loading,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}