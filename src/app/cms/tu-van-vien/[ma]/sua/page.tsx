"use client";
/** H11b · CMS — Sửa thông tin Tư vấn viên (form điền sẵn, mở từ "Sửa thông tin" trên H11a). */
import { use } from "react";
import { TvvForm } from "@/components/danh-thiep/TvvForm";

export default function Page({ params }: { params: Promise<{ ma: string }> }) {
  const { ma } = use(params);
  return <TvvForm ma={ma} />;
}
