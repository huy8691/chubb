"use client";
/** Tháng cũ — cùng màn C01 với tháng được chọn (C04 gộp vào C01 ngày 09/09). Đích của C03, ô chọn tháng và bảng Lưu trữ theo tháng. */
import { use } from "react";
import { BangVinhDanhThang } from "@/components/vinh-danh/BangVinhDanhThang";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BangVinhDanhThang thangId={id} />;
}
