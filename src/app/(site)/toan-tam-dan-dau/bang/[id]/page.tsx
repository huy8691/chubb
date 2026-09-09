"use client";
/** C04 · Bảng vinh danh mở từ lưu trữ — trạng thái của C01: cùng thân trang, đầu trang gọn (không hero). Đích của C03 "Xem bảng", ô chọn bảng, "Các bảng gần đây", C02 "Xem cả bảng", H03b "Xem trang công khai". */
import { use } from "react";
import { BangVinhDanhThang } from "@/components/vinh-danh/BangVinhDanhThang";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BangVinhDanhThang thangId={id} />;
}
