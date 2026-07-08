import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

type Organization = {
  id: string;
  name: string;
  owner_user_id: string;
  created_at: string;
  representative_name: string | null;
  business_number: string | null;
  business_type: string | null;
  business_item: string | null;
  address: string | null;
  phone: string | null;
  mobile_phone: string | null;
  fax: string | null;
  email: string | null;
  logo_url: string | null;
  stamp_url: string | null;
};

type OrganizationContextType = {
  organization: Organization | null;
  loading: boolean;
  refreshOrganization: () => Promise<void>;
};

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshOrganization = async () => {
    if (!user) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: member, error: memberError } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (memberError) {
      console.error("멤버 조회 오류:", memberError.message);
      setOrganization(null);
      setLoading(false);
      return;
    }

    if (!member?.organization_id) {
      console.log("연결된 회사가 없습니다.", user.id);
      setOrganization(null);
      setLoading(false);
      return;
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select(
        `
        id,
        name,
        owner_user_id,
        created_at,
        representative_name,
        business_number,
        business_type,
        business_item,
        address,
        phone,
mobile_phone,
fax,
email,
logo_url,
stamp_url
        `
      )
      .eq("id", member.organization_id)
      .maybeSingle();

    if (orgError) {
      console.error("회사 조회 오류:", orgError.message);
      setOrganization(null);
      setLoading(false);
      return;
    }

    setOrganization(org);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    refreshOrganization();
  }, [user, authLoading]);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        loading,
        refreshOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }

  return context;
}