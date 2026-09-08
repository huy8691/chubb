/**
 * Hàm tính dùng chung cho cụm Công cụ (D03 · H17 · D04–D06 · H18).
 * Thuần hàm — không phụ thuộc React.
 */
import type { QuizQuestion, QuizResultType } from "@/lib/types";

/* ---------- Quản lý tài chính cá nhân (D03 · H17 Chạy thử) ---------- */
export interface TaiChinhInput {
  thuNhap: number; // ₫ / tháng
  tyLe: number; // % thu nhập tiết kiệm mỗi tháng
  laiSuat: number; // % / năm
  soNam: number;
  mucTieu: { ten: string; soTien: number }[];
}
export interface TaiChinhKetQua {
  tietKiemThang: number;
  tichLuy: number;
  tongMucTieu: number;
  conThieu: number;
  canMoiThang: number;
  theoNam: { nam: number; giaTri: number }[];
}
/** Lãi kép theo tháng: FV = PMT × ((1+r)^n − 1) / r */
export function tinhTaiChinh(i: TaiChinhInput): TaiChinhKetQua {
  const pmt = (i.thuNhap * i.tyLe) / 100;
  const r = i.laiSuat / 100 / 12;
  const heSo = (n: number) => (r > 0 ? (Math.pow(1 + r, n) - 1) / r : n);
  const n = Math.max(0, Math.round(i.soNam * 12));
  const tichLuy = pmt * heSo(n);
  const tongMucTieu = i.mucTieu.reduce((s, m) => s + (m.soTien || 0), 0);
  const conThieu = Math.max(0, tongMucTieu - tichLuy);
  const canMoiThang = n > 0 ? tongMucTieu / heSo(n) : 0;
  const theoNam = Array.from({ length: Math.max(1, Math.round(i.soNam)) }, (_, k) => ({ nam: k + 1, giaTri: pmt * heSo((k + 1) * 12) }));
  return { tietKiemThang: pmt, tichLuy, tongMucTieu, conThieu, canMoiThang, theoNam };
}
/** Làm tròn hiển thị: ≈ 931.000.000 ₫ */
export const fmtTien = (n: number) => Math.round(n / 1000) * 1000 === 0 && n > 0 ? "< 1.000 ₫" : (Math.round(n / 1000) * 1000).toLocaleString("vi-VN") + " ₫";

/* ---------- Trắc nghiệm (D04 · D05 · D06) ---------- */
export const QUIZ_KEY = "quiz-answers";
export type QuizAnswers = Record<string, string>; // questionId → kieuId

export function docDapAn(): QuizAnswers {
  try { return JSON.parse(sessionStorage.getItem(QUIZ_KEY) || "{}"); } catch { return {}; }
}
export function ghiDapAn(a: QuizAnswers) {
  try { sessionStorage.setItem(QUIZ_KEY, JSON.stringify(a)); } catch {}
}
export function xoaDapAn() {
  try { sessionStorage.removeItem(QUIZ_KEY); } catch {}
}
/** Kết quả = kiểu được chọn nhiều nhất (hoà → kiểu đứng trước trong danh sách) */
export function kieuKetQua(answers: QuizAnswers, types: QuizResultType[]): QuizResultType | undefined {
  const dem = new Map<string, number>();
  Object.values(answers).forEach((k) => dem.set(k, (dem.get(k) ?? 0) + 1));
  let best: QuizResultType | undefined; let max = 0;
  for (const t of types) { const c = dem.get(t.id) ?? 0; if (c > max) { max = c; best = t; } }
  return best;
}
export const cauHoiDangHien = (qs: QuizQuestion[]) => qs.filter((q) => q.hien).sort((a, b) => a.thuTu - b.thuTu);
export const NHAN_DAP_AN = ["A", "B", "C", "D"];
