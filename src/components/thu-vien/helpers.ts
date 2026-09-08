/**
 * Tiện ích cụm Thư viện (F01 · F02 · F03 · H04 · H04b · H06).
 * Chỉ hàm thuần — không state, không fetch.
 */
import type { Article, ChuyenDe } from "@/lib/types";

/** Bỏ dấu, thành slug: "Toàn Tâm Bảo Vệ" → "toan-tam-bao-ve" */
export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Bài đã xuất bản (chỉ những bài này hiện trên F01 · F02 · F03) */
export const daXuatBan = (a: Article) => a.trangThai === "da-xuat-ban";

/** Chuyên đề đang hiện, theo thứ tự */
export const chuyenDeHien = (list: ChuyenDe[]) => [...list].filter((c) => c.hien).sort((a, b) => a.thuTu - b.thuTu);

/** Số phút đọc ước tính từ độ dài thân bài (~200 từ/phút, tối thiểu 3) */
export const phutDoc = (a: Article) => Math.max(3, Math.round(a.thanBai.split(/\s+/).length / 200) + 3);

/** Sắp xếp: mới nhất (ngày xuất bản giảm) hoặc xem nhiều (lượt xem giảm) */
export type SapXep = "moi-nhat" | "xem-nhieu";
export const sapXep = (list: Article[], mode: SapXep) =>
  [...list].sort((a, b) => (mode === "xem-nhieu" ? b.luotXem - a.luotXem : (b.ngayXuatBan ?? b.capNhat).localeCompare(a.ngayXuatBan ?? a.capNhat)));

/** Mục lục: mọi dòng "## " trong thân bài, id = slug của tiêu đề */
export const mucLuc = (md: string) =>
  md.split("\n").filter((l) => l.startsWith("## ")).map((l) => {
    const text = l.slice(3).trim();
    return { id: slugify(text), text };
  });

/** Bộ đếm ký tự có ngưỡng — trả màu chữ: trong ngưỡng xanh lá, ngoài ngưỡng đỏ, chưa tới mức tối thiểu vàng */
export const mauBoDem = (len: number, min: number, max: number) => (len > max ? "text-red-fg" : len < min ? "text-amber-fg" : "text-green-fg");
