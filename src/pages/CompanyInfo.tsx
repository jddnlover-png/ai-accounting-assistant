import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useOrganization } from "../contexts/OrganizationContext";
import { pageStyles } from "../styles/pageStyles";
import { cardStyles } from "../styles/cardStyles";
import { formStyles } from "../styles/formStyles";
import {
  formatBusinessNumber,
  formatFaxNumber,
  formatMobileNumber,
  formatPhoneNumber,
} from "../utils/formatters";

export default function CompanyInfo() {
  const { organization, loading, refreshOrganization } = useOrganization();

  const [name, setName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessItem, setBusinessItem] = useState("");
  const [phone, setPhone] = useState("");
const [mobilePhone, setMobilePhone] = useState("");
const [fax, setFax] = useState("");
const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
const [logoUrl, setLogoUrl] = useState("");
const [stampUrl, setStampUrl] = useState("");
const [saving, setSaving] = useState(false);
const [uploadingLogo, setUploadingLogo] = useState(false);
const [uploadingStamp, setUploadingStamp] = useState(false);

  useEffect(() => {
    if (!organization) return;

    setName(organization.name || "");
    setRepresentativeName(organization.representative_name || "");
    setBusinessNumber(formatBusinessNumber(organization.business_number || ""));
setBusinessType(organization.business_type || "");
setBusinessItem(organization.business_item || "");
setPhone(formatPhoneNumber(organization.phone || ""));
setMobilePhone(formatMobileNumber(organization.mobile_phone || ""));
setFax(formatFaxNumber(organization.fax || ""));
setEmail(organization.email || "");
setAddress(organization.address || "");
setLogoUrl(organization.logo_url || "");
setStampUrl(organization.stamp_url || "");
  }, [organization]);

  const handleSave = async () => {

  if (!organization?.id) {
    alert("회사 정보를 찾을 수 없습니다.");
    return;
  }

    if (!name.trim()) {
      alert("회사명을 입력하세요.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
  .from("organizations")
  .update({
    name: name.trim(),
    representative_name: representativeName.trim() || null,
    business_number: businessNumber.trim() || null,
    business_type: businessType.trim() || null,
    business_item: businessItem.trim() || null,
    phone: phone.trim() || null,
mobile_phone: mobilePhone.trim() || null,
fax: fax.trim() || null,
email: email.trim() || null,
address: address.trim() || null,
  })
  .eq("id", organization.id)
  .select()
  .single();


    setSaving(false);

    if (error) {
  console.error("회사정보 저장 오류:", error);
  alert(`회사정보 저장 오류\n\n${error.message}`);
  return;
}

if (!data) {
  alert("회사정보가 저장되지 않았습니다. 업데이트된 데이터가 없습니다.");
  return;
}

    await refreshOrganization();


alert("회사정보가 저장되었습니다.");
  };
const handleAssetUpload = async (
  file: File,
  type: "logo" | "stamp"
) => {
  if (!organization?.id) {
    alert("회사 정보를 찾을 수 없습니다.");
    return;
  }

  const isLogo = type === "logo";
const setUploading = isLogo ? setUploadingLogo : setUploadingStamp;
const columnName = isLogo ? "logo_url" : "stamp_url";
const extension = file.name.split(".").pop() || "png";
const fileName = `${type}-${Date.now()}.${extension}`;
const filePath = `organizations/${organization.id}/${fileName}`;
const currentUrl = isLogo ? logoUrl : stampUrl;
const oldFilePath = currentUrl
  ? currentUrl.split("/organization-assets/")[1]
  : "";

setUploading(true);

if (oldFilePath) {
  await supabase.storage
    .from("organization-assets")
    .remove([oldFilePath]);
}

  const { error: uploadError } = await supabase.storage
    .from("organization-assets")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    setUploading(false);
    console.error("이미지 업로드 오류:", uploadError);
    alert(`이미지 업로드 오류\n\n${uploadError.message}`);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("organization-assets")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("organizations")
    .update({
      [columnName]: publicUrl,
    })
    .eq("id", organization.id);

  setUploading(false);

  if (updateError) {
    console.error("이미지 URL 저장 오류:", updateError);
    alert(`이미지 URL 저장 오류\n\n${updateError.message}`);
    return;
  }

  if (isLogo) {
    setLogoUrl(publicUrl);
  } else {
    setStampUrl(publicUrl);
  }

  await refreshOrganization();

  alert(isLogo ? "회사 로고가 업로드되었습니다." : "회사 도장이 업로드되었습니다.");
};
const handleAssetDelete = async (type: "logo" | "stamp") => {
  if (!organization?.id) {
    alert("회사 정보를 찾을 수 없습니다.");
    return;
  }

  const isLogo = type === "logo";
  const label = isLogo ? "회사 로고" : "회사 도장";

  if (!confirm(`${label}를 삭제하시겠습니까?`)) {
    return;
  }

  const columnName = isLogo ? "logo_url" : "stamp_url";
const currentUrl = isLogo ? logoUrl : stampUrl;
const filePath = currentUrl
  ? currentUrl.split("/organization-assets/")[1]
  : "";

if (filePath) {
  const { error: removeError } = await supabase.storage
    .from("organization-assets")
    .remove([filePath]);

  if (removeError) {
    console.error(`${label} Storage 삭제 오류:`, removeError);
  }
}

  const { error } = await supabase
    .from("organizations")
    .update({
      [columnName]: null,
    })
    .eq("id", organization.id);

  if (error) {
    console.error(`${label} URL 삭제 오류:`, error);
    alert(`${label} 삭제 오류\n\n${error.message}`);
    return;
  }

  if (isLogo) {
    setLogoUrl("");
  } else {
    setStampUrl("");
  }

  await refreshOrganization();

  alert(`${label}가 삭제되었습니다.`);
};

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.header}>
        <div>
          <h1 style={pageStyles.title}>회사정보</h1>
          <p style={pageStyles.description}>
            거래명세표, 견적서, 발주서, 납품서, 이메일 등에 공통으로 사용될 회사 정보를 관리합니다.
          </p>
        </div>
      </div>

      <section style={cardStyles.card}>
        <h2 style={cardStyles.sectionTitle}>기본 정보</h2>

        {loading ? (
          <p style={styles.emptyText}>회사정보를 불러오는 중입니다...</p>
        ) : (
          <>
            <div style={formStyles.formGrid}>
              <InfoField label="회사명" value={name} onChange={setName} />
              <InfoField
                label="대표자"
                value={representativeName}
                onChange={setRepresentativeName}
              />
              <InfoField
  label="사업자번호"
  value={businessNumber}
  onChange={(value) => setBusinessNumber(formatBusinessNumber(value))}
/>
              <InfoField label="업태" value={businessType} onChange={setBusinessType} />
              <InfoField label="종목" value={businessItem} onChange={setBusinessItem} />
              <InfoField
  label="핸드폰번호"
  value={mobilePhone}
  onChange={(value) => setMobilePhone(formatMobileNumber(value))}
/>

<InfoField
  label="전화번호"
  value={phone}
  onChange={(value) => setPhone(formatPhoneNumber(value))}
/>

<InfoField
  label="팩스번호"
  value={fax}
  onChange={(value) => setFax(formatFaxNumber(value))}
/>
              <InfoField label="이메일" value={email} onChange={setEmail} />

              <div style={{ ...formStyles.field, ...formStyles.fullWidth }}>
                <label style={formStyles.label}>주소</label>
                <input
                  style={formStyles.input}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="회사 주소를 입력하세요"
                />
              </div>
            </div>

            <div style={pageStyles.actionRow}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  ...pageStyles.primaryButton,
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "저장 중..." : "회사정보 저장"}
              </button>
            </div>
          </>
        )}
      </section>

      <section style={cardStyles.card}>
  <h2 style={cardStyles.sectionTitle}>이미지 정보</h2>

  <div style={formStyles.formGrid}>
        <ImageUploadField
      label="회사 로고"
      imageUrl={logoUrl}
      uploading={uploadingLogo}
      onUpload={(file) => handleAssetUpload(file, "logo")}
      onDelete={() => handleAssetDelete("logo")}
    />

        <ImageUploadField
      label="회사 도장"
      imageUrl={stampUrl}
      uploading={uploadingStamp}
      onUpload={(file) => handleAssetUpload(file, "stamp")}
      onDelete={() => handleAssetDelete("stamp")}
    />
  </div>
</section>
    </div>
  );
}

function InfoField({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div style={formStyles.field}>
      <label style={formStyles.label}>{label}</label>
      <input
        style={disabled ? formStyles.disabledInput : formStyles.input}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `${label}을 입력하세요`}
      />
    </div>
  );
}

function ImageUploadField({
  label,
  imageUrl,
  uploading,
  onUpload,
  onDelete,
}: {
  label: string;
  imageUrl: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
}) {
  const inputId = `upload-${label.replace(/\s/g, "")}`;

  return (
    <div style={formStyles.field}>
      <label style={formStyles.label}>{label}</label>

      <div style={styles.imagePreviewBox}>
        {imageUrl ? (
          <img src={imageUrl} alt={label} style={styles.previewImage} />
        ) : (
          <>
            <div style={styles.emptyImageIcon}>🖼️</div>
            <div style={styles.emptyImageText}>등록된 이미지가 없습니다.</div>
          </>
        )}
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        style={{ display: "none" }}
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onUpload(file);
          e.target.value = "";
        }}
      />

            <div style={styles.imageButtonRow}>
        <label
          htmlFor={inputId}
          style={{
            ...pageStyles.primaryButton,
            flex: 1,
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "업로드 중..." : "이미지 변경"}
        </label>

        <button
          type="button"
          onClick={onDelete}
          disabled={!imageUrl || uploading}
          style={{
            ...styles.deleteButton,
            opacity: imageUrl && !uploading ? 1 : 0.5,
            cursor: imageUrl && !uploading ? "pointer" : "not-allowed",
          }}
        >
          삭제
        </button>
      </div>

      <p style={styles.helperText}>PNG · JPG · WEBP</p>
    </div>
  );
}
const styles: Record<string, React.CSSProperties> = {
  emptyText: {
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "18px",
  },
  imagePreviewBox: {
  width: "100%",
  height: "180px",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  backgroundColor: "#fafafa",
  overflow: "hidden",
  marginBottom: "10px",
},
previewImage: {
  maxWidth: "90%",
  maxHeight: "90%",
  objectFit: "contain",
},
emptyImageIcon: {
  fontSize: "42px",
},
emptyImageText: {
  color: "#9ca3af",
  fontSize: "13px",
},
helperText: {
  marginTop: "6px",
  fontSize: "12px",
  color: "#6b7280",
},
imageButtonRow: {
  display: "flex",
  gap: "10px",
  marginTop: "12px",
},
deleteButton: {
  flex: 1,
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  backgroundColor: "#ffffff",
  color: "#374151",
  fontSize: "14px",
  fontWeight: 600,
  padding: "10px 16px",
},
};