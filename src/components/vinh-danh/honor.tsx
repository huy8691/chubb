"use client";
/**
 * Helper dùng chung cho cụm Vinh danh (C01 · C02 · C03 · C04 · H03*).
 * Không sửa store/ui — chỉ đọc store và gói lại vài phép tính lặp nhiều nơi.
 */
import Link from "next/link";
import { useState } from "react";
import { R } from "@/lib/routes";
import { thangLabel } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { Advisor, HangMuc, HonorMonth, NguoiDat } from "@/lib/types";
import { Button, ImageBox, Modal, cx } from "@/components/ui";
import { XemNhanhButton } from "@/components/danh-thiep/XemNhanh";

export interface NguoiDatView {
  nd: NguoiDat;
  ma: string;
  hoTen: string;
  vanPhong: string;
  chucDanh?: string;
  advisor?: Advisor;
  /** có tài khoản TVV thật (bấm được Xem danh thiếp) */
  coTaiKhoan: boolean;
}

/** Ảnh chân dung mẫu theo mã (không tải ảnh ngoài) */
export const anhTVV = (ma: string) => `/img/tvv-av-${(parseInt(ma.replace(/\D/g, "").slice(-3) || "0", 10) % 6) + 1}.png`;

export function resolveNguoiDat(nd: NguoiDat, advisors: Advisor[]): NguoiDatView {
  const a = advisors.find((x) => x.ma === nd.advisorMa);
  return { nd, ma: nd.advisorMa, hoTen: a?.hoTen ?? nd.hoTen ?? "—", vanPhong: a?.vanPhong ?? nd.vanPhong ?? "—", chucDanh: a?.chucDanh, advisor: a, coTaiKhoan: !!a };
}

/** Link tới C02 — trang thành tích của một người trong một tháng · hạng mục */
export const linkC02 = (ma: string, thangId: string, hangMucId: string) => `${R.C02(ma)}?thang=${thangId}&hm=${hangMucId}`;

export function useHonor() {
  const { data, actions } = useStore();
  const hangMucSorted = [...data.hangMuc].sort((a, b) => a.thuTu - b.thuTu);
  const published = data.honorMonths.filter((m) => m.trangThai === "da-cong-bo").sort((a, b) => (b.congBo ?? b.capNhat).localeCompare(a.congBo ?? a.capNhat)); // bảng công bố gần nhất lên đầu
  const latest: HonorMonth | undefined = published[0];
  const hangMucById = (id: string) => data.hangMuc.find((h) => h.id === id);
  /** mọi người đạt của một hạng mục trong tháng (CMS), sắp theo thứ hạng */
  const tatCa = (m: HonorMonth, hmId: string) => [...(m.hangMuc.find((h) => h.hangMucId === hmId)?.nguoiDat ?? [])].sort((a, b) => a.thuHang - b.thuHang).map((n) => resolveNguoiDat(n, data.advisors));
  /** người đạt hiện công khai của một hạng mục trong bảng = toàn bộ danh sách (09/09: admin quyết, không cần TVV đồng ý) */
  const congKhai = (m: HonorMonth, hmId: string) => tatCa(m, hmId);
  /** hạng mục đang hiện và có ít nhất một người công khai */
  const hangMucCoNguoi = (m: HonorMonth): HangMuc[] => hangMucSorted.filter((h) => h.hien && congKhai(m, h.id).length > 0);
  const tongCongKhai = (m: HonorMonth) => hangMucCoNguoi(m).reduce((s, h) => s + congKhai(m, h.id).length, 0);
  return { data, actions, hangMucSorted, published, latest, hangMucById, tatCa, congKhai, hangMucCoNguoi, tongCongKhai };
}

/** Popup chia sẻ (Zalo · Facebook · Sao chép liên kết) — dùng cho "Chia sẻ thành tựu" C01/C02 */
export function ShareModal({ open, onClose, title, onDone }: { open: boolean; onClose: () => void; title: string; onDone: (msg: string) => void }) {
  const pick = (kenh: string) => { onDone(kenh === "Sao chép liên kết" ? "Đã sao chép liên kết" : `Đã mở ${kenh} để chia sẻ`); onClose(); };
  return (
    <Modal open={open} onClose={onClose} title={title} width={480}>
      <p className="text-[14px] text-ink2 mb-4">Chọn nơi bạn muốn chia sẻ thành tựu này.</p>
      <div className="flex flex-wrap gap-3">
        {["Zalo", "Facebook", "Sao chép liên kết"].map((k) => <Button key={k} kind="secondary" onClick={() => pick(k)}>{k}</Button>)}
      </div>
    </Modal>
  );
}

/**
 * Thẻ Tư vấn viên (ảnh 3:4 · tên · dòng phụ · Chi tiết → C02). Không có "Xem danh thiếp" trong danh sách tháng — chỉ có trên trang Thành tích (chủ dự án 08/09).
 * `danhThiep`: dùng trên C02 "Tư vấn viên cùng hạng mục" — action "Xem danh thiếp" mở popup E02 (như nut-dich), thay cho "Chi tiết" → C02.
 */
export function TheTVV({ v, sub, thangId, hangMucId, size = "md", chiTiet = true, danhThiep = false }: { v: NguoiDatView; sub: string; thangId: string; hangMucId: string; size?: "md" | "sm"; chiTiet?: boolean; danhThiep?: boolean }) {
  const sm = size === "sm";
  const dt = danhThiep && v.coTaiKhoan;
  return (
    <div className="bg-white border border-vien rounded-sm overflow-hidden flex flex-col">
      <ImageBox src={anhTVV(v.ma)} alt={v.hoTen} ratio={sm ? "1/1" : "3/4"} bordered={false} />
      <div className="p-4 flex flex-col flex-1">
        <div className={cx("font-bold text-den", sm ? "text-[14px]" : "text-[16px]")}>{chiTiet && !dt ? <Link href={linkC02(v.ma, thangId, hangMucId)} className="hover:text-blue">{v.hoTen}</Link> : v.hoTen}</div>
        <div className={cx("text-ink2", sm ? "text-[12px]" : "text-[13px] mt-0.5")}>{sub.replace(/ — .*$/, "")}</div>
        {!sm && chiTiet && <div className="mt-auto pt-3">{dt ? <XemNhanhButton ma={v.ma} label="Xem danh thiếp" kind="ghost" size="sm" /> : <Link href={linkC02(v.ma, thangId, hangMucId)} className="text-[13px] font-bold text-blue hover:underline">Chi tiết</Link>}</div>}
      </div>
    </div>
  );
}

/** Ba nút chia sẻ nội tuyến (C04 "Chia sẻ trang này") */
export function ShareButtons({ onDone }: { onDone: (msg: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {["Zalo", "Facebook", "Sao chép liên kết"].map((k) => <Button key={k} size="sm" kind="secondary" onClick={() => onDone(k === "Sao chép liên kết" ? "Đã sao chép liên kết" : `Đã mở ${k} để chia sẻ`)}>{k}</Button>)}
    </div>
  );
}

/** Ô chọn bảng vinh danh đã công bố — đổi bảng thì chuyển trang */
export function ChonThang({ months, value, onChange }: { months: HonorMonth[]; value: string; onChange: (id: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <select value={v} onChange={(e) => { setV(e.target.value); onChange(e.target.value); }} aria-label="Chọn bảng vinh danh" className="h-10 rounded-sm border border-vien bg-white px-3 text-[14px] text-den focus:outline-none focus:border-blue">
      {months.map((m) => <option key={m.id} value={m.id}>{thangLabel(m)}</option>)}
    </select>
  );
}

/** 2.450.000.000 → "2,45 tỷ ₫"; 850.000.000 → "850 triệu ₫" (dùng cho C01 · C02 · H03b) */
export const fmtTien = (n?: number) => n === undefined ? "—" : n >= 1e9 ? `${(n / 1e9).toFixed(2).replace(".", ",").replace(/,?0+$/, "")} tỷ ₫` : `${Math.round(n / 1e6)} triệu ₫`;
