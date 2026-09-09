"use client";
/**
 * Helper dùng chung cho cụm Vinh danh (C01 · C02 · C03 · C04 · H03*).
 * Không sửa store/ui — chỉ đọc store và gói lại vài phép tính lặp nhiều nơi.
 */
import Link from "next/link";
import { useState } from "react";
import { R } from "@/lib/routes";
import { fmtDateTime } from "@/lib/seed";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import type { Advisor, HangMuc, HonorMonth, NguoiDat } from "@/lib/types";
import { Button, Chip, Field, H2, ImageBox, Modal, Muted, Textarea, cx } from "@/components/ui";

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
  const published = data.honorMonths.filter((m) => m.trangThai === "da-cong-bo").sort((a, b) => b.id.localeCompare(a.id));
  const latest: HonorMonth | undefined = published[0];
  const hangMucById = (id: string) => data.hangMuc.find((h) => h.id === id);
  /** mọi người đạt của một hạng mục trong tháng (CMS), sắp theo thứ hạng */
  const tatCa = (m: HonorMonth, hmId: string) => [...(m.hangMuc.find((h) => h.hangMucId === hmId)?.nguoiDat ?? [])].sort((a, b) => a.thuHang - b.thuHang).map((n) => resolveNguoiDat(n, data.advisors));
  /** người đạt ĐÃ ĐỒNG Ý công khai của một hạng mục trong tháng (trang công khai) */
  const congKhai = (m: HonorMonth, hmId: string) => tatCa(m, hmId).filter((v) => v.nd.dongYCongKhai === "dong-y");
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

/** Thẻ Tư vấn viên (ảnh 3:4 · tên · dòng phụ · Chi tiết → C02). Không có "Xem danh thiếp" trong danh sách tháng — chỉ có trên trang Thành tích (chủ dự án 08/09). */
export function TheTVV({ v, sub, thangId, hangMucId, size = "md", chiTiet = true }: { v: NguoiDatView; sub: string; thangId: string; hangMucId: string; size?: "md" | "sm"; chiTiet?: boolean }) {
  const sm = size === "sm";
  return (
    <div className="bg-white border border-vien rounded-sm p-4 flex flex-col">
      <ImageBox src={anhTVV(v.ma)} alt={v.hoTen} ratio={sm ? "1/1" : "3/4"} />
      <div className={cx("mt-3 font-bold text-den", sm ? "text-[14px]" : "text-[16px]")}>{chiTiet ? <Link href={linkC02(v.ma, thangId, hangMucId)} className="hover:text-blue">{v.hoTen}</Link> : v.hoTen}</div>
      <div className={cx("text-ink2", sm ? "text-[12px]" : "text-[13px] mt-0.5")}>{sub.replace(/ — .*$/, "")}</div>
      {!sm && (
        <div className="mt-4 flex flex-wrap gap-2">
                    {chiTiet && <Link href={linkC02(v.ma, thangId, hangMucId)} className="h-8 inline-flex items-center text-[13px] font-bold text-blue hover:underline">Chi tiết</Link>}
        </div>
      )}
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

/** Ô chọn tháng đã công bố — đổi tháng thì chuyển trang */
export function ChonThang({ months, value, onChange }: { months: HonorMonth[]; value: string; onChange: (id: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <select value={v} onChange={(e) => { setV(e.target.value); onChange(e.target.value); }} aria-label="Chọn tháng vinh danh" className="h-10 rounded-sm border border-vien bg-white px-3 text-[14px] text-den focus:outline-none focus:border-blue">
      {months.map((m) => <option key={m.id} value={m.id}>Tháng {m.thang}/{m.nam}</option>)}
    </select>
  );
}

/* ---------- Lời chúc (09/09, phương án B) ---------- */
const coLienKet = (t: string) => /https?:\/\/|www\.|bit\.ly|\.vn\b|\.com\b/i.test(t);

/** Nút "Gửi lời chúc" + popup C02a. Chỉ TVV đã đăng nhập; khách thấy nút kèm chip "Cần đăng nhập" → G01; 1 lời chúc / người gửi / người nhận / tháng. */
export function GuiLoiChucButton({ nguoiNhan, thangId, hangMucId, kind = "primary", onDone }: { nguoiNhan: { ma: string; hoTen: string }; thangId: string; hangMucId: string; kind?: "primary" | "secondary"; onDone?: (msg: string) => void }) {
  const { data, actions } = useStore();
  const me = useCurrentAdvisor();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const m = data.honorMonths.find((x) => x.id === thangId);
  const hm = data.hangMuc.find((h) => h.id === hangMucId)?.ten ?? hangMucId;
  const thang = m ? `Tháng ${m.thang}/${m.nam}` : thangId;
  if (!me) return <span className="inline-flex items-center gap-2"><Button kind={kind} href={R.G01}>Gửi lời chúc</Button><Chip>Cần đăng nhập</Chip></span>;
  if (me.ma === nguoiNhan.ma) return null;
  const daGui = data.loiChuc.some((l) => l.nguoiGuiMa === me.ma && l.nguoiNhanMa === nguoiNhan.ma && l.thangId === thangId && l.hangMucId === hangMucId);
  if (daGui) return <Button kind="secondary" disabled>Bạn đã gửi lời chúc</Button>;
  const gui = () => {
    const noiDung = text.trim(); if (!noiDung) return;
    const co = coLienKet(noiDung);
    actions.update("loiChuc", (ls) => [{ id: `lc${Date.now()}`, nguoiGuiMa: me.ma, nguoiNhanMa: nguoiNhan.ma, thangId, hangMucId, noiDung, ngay: new Date().toISOString(), trangThai: co ? "gan-co" : "hien", lyDoCo: co ? "Chứa liên kết ngoài" : undefined }, ...ls]);
    actions.notify(nguoiNhan.ma, `${me.hoTen} gửi lời chúc cho danh hiệu ${hm} ${thang.toLowerCase()}`, linkC02(nguoiNhan.ma, thangId, hangMucId));
    setOpen(false); setText(""); onDone?.(co ? "Đã gửi. Lời chúc có liên kết sẽ hiện sau khi Chubb Life kiểm tra." : "Đã gửi lời chúc");
  };
  return (
    <>
      <Button kind={kind} onClick={() => setOpen(true)}>Gửi lời chúc</Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Gửi lời chúc tới ${nguoiNhan.hoTen}`} width={560}
        footer={<><Button onClick={gui} disabled={!text.trim()}>Gửi lời chúc</Button><Button kind="secondary" onClick={() => setOpen(false)}>Huỷ</Button></>}>
        <Muted className="mb-4 text-[13.5px]">{hm} · {thang}</Muted>
        <Field label="Lời chúc" count={`${text.length}/200`}>
          <Textarea maxLength={200} rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Viết lời chúc của bạn (tối đa 200 ký tự)…" />
        </Field>
        <Muted className="mt-3 text-[12.5px]">Lời chúc hiện công khai trên trang Thành tích của {nguoiNhan.hoTen}. Chubb Life có thể ẩn nội dung không phù hợp.</Muted>
      </Modal>
    </>
  );
}

/** Khối "Lời chúc từ đồng nghiệp" trên C02 (công khai): 3 lời chúc mới nhất + Xem thêm, nút Gửi lời chúc ở góc phải. */
export function LoiChucBlock({ nguoiNhan, thangId, hangMucId, onDone }: { nguoiNhan: { ma: string; hoTen: string }; thangId: string; hangMucId: string; onDone: (msg: string) => void }) {
  const { data } = useStore();
  const [moRong, setMoRong] = useState(false);
  const ds = data.loiChuc.filter((l) => l.nguoiNhanMa === nguoiNhan.ma && l.thangId === thangId && l.hangMucId === hangMucId && l.trangThai === "hien").sort((a, b) => b.ngay.localeCompare(a.ngay));
  const hien = moRong ? ds : ds.slice(0, 3);
  const ten = (ma: string) => { const a = data.advisors.find((x) => x.ma === ma); return a ? `${a.hoTen} · ${a.vanPhong.replace(/ — .*$/, "")}` : ma; };
  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <H2 className="text-[22px]">Lời chúc từ đồng nghiệp ({ds.length})</H2>
        <GuiLoiChucButton nguoiNhan={nguoiNhan} thangId={thangId} hangMucId={hangMucId} onDone={onDone} />
      </div>
      {ds.length === 0 ? <Muted className="mt-4">Chưa có lời chúc nào.</Muted> : (
        <ul className="mt-4 divide-y divide-vien2">
          {hien.map((l) => (
            <li key={l.id} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-bold text-[15px] text-den">{ten(l.nguoiGuiMa)}</span><span className="text-[12.5px] text-mut">{fmtDateTime(l.ngay)}</span></div>
              <p className="mt-1.5 text-[14px] text-ink2 max-w-[900px]">{l.noiDung}</p>
            </li>
          ))}
        </ul>
      )}
      {ds.length > 3 && <button type="button" onClick={() => setMoRong(!moRong)} className="mt-2 text-[13px] font-bold text-blue">{moRong ? "Thu gọn" : "Xem thêm lời chúc"}</button>}
    </section>
  );
}
