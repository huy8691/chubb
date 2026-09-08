"use client";
/**
 * H18 · CMS — Trắc nghiệm tính cách nghề tư vấn: MỘT trang HAI khối.
 * Khối Câu hỏi (đếm · bảng Thứ tự ⋮⋮ · Câu hỏi · Đáp án → kiểu kết quả · Trạng thái · Sửa · "+ Thêm câu hỏi")
 *   → popup H18a: câu hỏi ≤ 160 · 3–4 đáp án (ô chữ + Kiểu kết quả ▾, thêm/bỏ) · Thứ tự ▾ · ☑ Hiện trong bộ đề · Lưu · Huỷ.
 * Khối Kiểu kết quả (Huy hiệu · Tên kiểu · Điểm mạnh · Số đáp án trỏ tới · Sửa · "+ Thêm kiểu kết quả")
 *   → popup H18b: tên ≤ 40 · huy hiệu 1:1 · điểm mạnh ≤ 120 · phong cách ≤ 160 · phù hợp với ≤ 120 · định hướng ≤ 300 · ảnh chia sẻ 1200×630 · Lưu · Xem trước kết quả (D05 tab mới) · Huỷ.
 * Kết quả của người làm = kiểu được chọn nhiều nhất. Không xoá kiểu còn đáp án trỏ tới. Ghi store.quizQuestions / quizResultTypes.
 */
import { useRef, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import type { QuizQuestion, QuizResultType } from "@/lib/types";
import { Button, Checkbox, Chip, Field, ImageBox, Input, Modal, Select, Table, Textarea, cx, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { NHAN_DAP_AN } from "@/components/cong-cu/tinh-toan";
import { slugify } from "@/components/thu-vien/helpers";

const MAX_CAU = 160, MAX_TEN = 40, MAX_DM = 120, MAX_PC = 160, MAX_PH = 120, MAX_DH = 300;
const MIN_DA = 3, MAX_DA = 4;
const HUY_HIEU_MAU = ["🤝", "📐", "🌐", "🚀", "🌱", "💡", "🎯", "⭐"];

type FormCau = { id?: string; cauHoi: string; dapAn: { text: string; kieuId: string }[]; thuTu: number; hien: boolean };
type FormKieu = { id?: string; ten: string; huyHieu: string; diemManh: string; phongCach: string; phuHopVoi: string; dinhHuong: string; anhChiaSe: "tu-tao" | "tai-len" };

export default function Page() {
  const { data, actions } = useStore();
  const { flash, node } = useFlash();
  const [fc, setFc] = useState<FormCau | null>(null);
  const [fk, setFk] = useState<FormKieu | null>(null);
  const [err, setErr] = useState<Record<string, string>>({});
  const [keo, setKeo] = useState<string | null>(null);
  const anhRef = useRef<HTMLInputElement>(null);
  const [anhDich, setAnhDich] = useState<"huy-hieu" | "chia-se">("huy-hieu");

  const cauHoi = [...data.quizQuestions].sort((a, b) => a.thuTu - b.thuTu);
  const kieu = data.quizResultTypes;
  const tenKieu = (id: string) => kieu.find((k) => k.id === id)?.ten ?? "—";
  const tenNgan = (id: string) => tenKieu(id).replace(/^(Người|Nhà)\s+/i, "").replace(/^\p{Ll}/u, (c) => c.toUpperCase());
  const soDapAnTro = (id: string) => data.quizQuestions.reduce((n, q) => n + q.dapAn.filter((d) => d.kieuId === id).length, 0);

  /* ---------- Câu hỏi ---------- */
  const moThemCau = () => { setErr({}); setFc({ cauHoi: "", dapAn: Array.from({ length: MIN_DA }, (_, i) => ({ text: "", kieuId: kieu[i % Math.max(1, kieu.length)]?.id ?? "" })), thuTu: cauHoi.length + 1, hien: true }); };
  const moSuaCau = (q: QuizQuestion) => { setErr({}); setFc({ id: q.id, cauHoi: q.cauHoi, dapAn: q.dapAn.map((d) => ({ ...d })), thuTu: q.thuTu, hien: q.hien }); };
  const setDa = (i: number, patch: Partial<{ text: string; kieuId: string }>) => { if (!fc) return; setFc({ ...fc, dapAn: fc.dapAn.map((d, k) => (k === i ? { ...d, ...patch } : d)) }); };
  const themDa = () => { if (fc && fc.dapAn.length < MAX_DA) setFc({ ...fc, dapAn: [...fc.dapAn, { text: "", kieuId: kieu[0]?.id ?? "" }] }); };
  const boDa = (i: number) => { if (fc && fc.dapAn.length > MIN_DA) setFc({ ...fc, dapAn: fc.dapAn.filter((_, k) => k !== i) }); };

  const luuCau = () => {
    if (!fc) return;
    const e: Record<string, string> = {};
    if (!fc.cauHoi.trim()) e.cauHoi = "Nhập câu hỏi.";
    else if (fc.cauHoi.length > MAX_CAU) e.cauHoi = `Tối đa ${MAX_CAU} ký tự.`;
    fc.dapAn.forEach((d, i) => { if (!d.text.trim()) e[`da${i}`] = `Nhập nội dung đáp án ${NHAN_DAP_AN[i]}.`; else if (!d.kieuId) e[`da${i}`] = `Chọn kiểu kết quả cho đáp án ${NHAN_DAP_AN[i]}.`; });
    setErr(e);
    if (Object.keys(e).length) return;
    const id = fc.id ?? `q${Date.now()}`;
    actions.update("quizQuestions", (list) => {
      const others = list.filter((q) => q.id !== id).sort((a, b) => a.thuTu - b.thuTu);
      const pos = Math.min(Math.max(1, fc.thuTu), others.length + 1) - 1;
      others.splice(pos, 0, { id, cauHoi: fc.cauHoi.trim(), dapAn: fc.dapAn.map((d) => ({ text: d.text.trim(), kieuId: d.kieuId })), thuTu: 0, hien: fc.hien });
      return others.map((q, i) => ({ ...q, thuTu: i + 1 }));
    });
    flash(fc.id ? "Đã lưu câu hỏi" : "Đã thêm câu hỏi vào bộ đề");
    setFc(null);
  };

  const move = (id: string, dir: -1 | 1) => {
    const i = cauHoi.findIndex((q) => q.id === id); const j = i + dir;
    if (j < 0 || j >= cauHoi.length) return;
    const order = cauHoi.map((q) => q.id); [order[i], order[j]] = [order[j], order[i]];
    actions.update("quizQuestions", (list) => list.map((q) => ({ ...q, thuTu: order.indexOf(q.id) + 1 })));
  };
  const tha = (dichId: string) => {
    if (!keo || keo === dichId) return;
    const ds = [...cauHoi];
    const tu = ds.findIndex((q) => q.id === keo), den = ds.findIndex((q) => q.id === dichId);
    if (tu < 0 || den < 0) return;
    const [m] = ds.splice(tu, 1); ds.splice(den, 0, m);
    const thuTu = new Map(ds.map((q, i) => [q.id, i + 1]));
    actions.update("quizQuestions", (list) => list.map((q) => ({ ...q, thuTu: thuTu.get(q.id) ?? q.thuTu })));
    setKeo(null);
  };

  /* ---------- Kiểu kết quả ---------- */
  const moThemKieu = () => { setErr({}); setFk({ ten: "", huyHieu: HUY_HIEU_MAU[kieu.length % HUY_HIEU_MAU.length], diemManh: "", phongCach: "", phuHopVoi: "", dinhHuong: "", anhChiaSe: "tu-tao" }); };
  const moSuaKieu = (k: QuizResultType) => { setErr({}); setFk({ id: k.id, ten: k.ten, huyHieu: k.huyHieu, diemManh: k.diemManh, phongCach: k.phongCach, phuHopVoi: k.phuHopVoi, dinhHuong: k.dinhHuong, anhChiaSe: k.anhChiaSe ? "tai-len" : "tu-tao" }); };

  const kiemKieu = () => {
    if (!fk) return false;
    const e: Record<string, string> = {};
    const ten = fk.ten.trim();
    if (!ten) e.ten = "Nhập tên kiểu.";
    else if (ten.length > MAX_TEN) e.ten = `Tối đa ${MAX_TEN} ký tự.`;
    else if (kieu.some((k) => k.ten.toLowerCase() === ten.toLowerCase() && k.id !== fk.id)) e.ten = "Tên kiểu không được trùng.";
    if (!fk.diemManh.trim()) e.diemManh = "Nhập điểm mạnh."; else if (fk.diemManh.length > MAX_DM) e.diemManh = `Tối đa ${MAX_DM} ký tự.`;
    if (fk.phongCach.length > MAX_PC) e.phongCach = `Tối đa ${MAX_PC} ký tự.`;
    if (fk.phuHopVoi.length > MAX_PH) e.phuHopVoi = `Tối đa ${MAX_PH} ký tự.`;
    if (!fk.dinhHuong.trim()) e.dinhHuong = "Nhập đoạn định hướng nghề."; else if (fk.dinhHuong.length > MAX_DH) e.dinhHuong = `Tối đa ${MAX_DH} ký tự.`;
    setErr(e);
    return Object.keys(e).length === 0;
  };
  /** Ghi kiểu vào store; trả về id */
  const ghiKieu = (): string => {
    const f = fk!;
    const id = f.id ?? (kieu.some((k) => k.id === slugify(f.ten)) ? `${slugify(f.ten)}-${Date.now()}` : slugify(f.ten));
    const saved: QuizResultType = { id, ten: f.ten.trim(), huyHieu: f.huyHieu || "⭐", diemManh: f.diemManh.trim(), phongCach: f.phongCach.trim(), phuHopVoi: f.phuHopVoi.trim(), dinhHuong: f.dinhHuong.trim(), anhChiaSe: f.anhChiaSe === "tai-len" ? "tai-len" : undefined };
    actions.update("quizResultTypes", (list) => (list.some((k) => k.id === id) ? list.map((k) => (k.id === id ? saved : k)) : [...list, saved]));
    return id;
  };
  const luuKieu = () => { if (!kiemKieu()) return; ghiKieu(); flash(fk?.id ? "Đã lưu kiểu kết quả" : "Đã thêm kiểu kết quả — chọn được trong đáp án câu hỏi"); setFk(null); };
  const xemTruocKieu = () => { if (!kiemKieu()) return; const id = ghiKieu(); if (fk && !fk.id) setFk({ ...fk, id }); window.open(`${R.D05}?kieu=${id}`, "_blank"); };
  const xoaKieu = (k: QuizResultType) => {
    const n = soDapAnTro(k.id);
    if (n > 0) { flash(`Không xoá được: còn ${n} đáp án trỏ tới “${k.ten}”. Đổi kiểu cho các đáp án đó trước.`); return; }
    actions.update("quizResultTypes", (list) => list.filter((x) => x.id !== k.id));
    flash(`Đã xoá kiểu “${k.ten}”`);
  };
  const chonAnh = (file: File | undefined) => {
    if (!file) return;
    const ok = /\.(png|jpe?g)$/i.test(file.name);
    if (!ok) { flash("Chỉ nhận ảnh PNG hoặc JPG."); return; }
    if (!fk) return;
    if (anhDich === "chia-se") setFk({ ...fk, anhChiaSe: "tai-len" });
    flash(anhDich === "huy-hieu" ? `Đã chọn ảnh huy hiệu “${file.name}” — bấm Lưu để áp dụng` : `Đã chọn ảnh chia sẻ “${file.name}” — bấm Lưu để áp dụng`);
  };

  const dangDung = cauHoi.filter((q) => q.hien).length;

  return (
    <>
      <CmsHeader title="Trắc nghiệm tính cách nghề tư vấn" desc={`${dangDung} câu hỏi · ${kieu.length} kiểu kết quả · đang chạy từ 01/08/2026`} right={<Button kind="secondary" onClick={() => window.open(R.D04, "_blank")}>Xem trước trắc nghiệm</Button>} />
      <input ref={anhRef} type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={(e) => { chonAnh(e.target.files?.[0]); e.target.value = ""; }} />

      <div className="space-y-6">
        {/* Khối Câu hỏi */}
        <CmsCard title="Câu hỏi" desc={`${cauHoi.length} câu · mỗi câu 3 đáp án, mỗi đáp án trỏ về một kiểu kết quả`} right={<Button size="sm" onClick={moThemCau}>+ Thêm câu hỏi</Button>}>
          <Table head={["Thứ tự", "Câu hỏi", "Đáp án → kiểu kết quả", "Trạng thái", ""]}>
            {cauHoi.map((q, i) => (
              <tr key={q.id} draggable onDragStart={() => setKeo(q.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => tha(q.id)} onDragEnd={() => setKeo(null)} className={cx("cursor-grab", keo === q.id && "opacity-40", !q.hien && "opacity-60")}>
                <td className="whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-mut select-none" aria-hidden>⋮⋮</span>
                    <span className="w-6 text-center tabular-nums">{q.thuTu}</span>
                    <button type="button" onClick={() => move(q.id, -1)} disabled={i === 0} aria-label="Chuyển lên" className="size-6 rounded-sm border border-vien text-[11px] hover:border-blue disabled:opacity-30">▲</button>
                    <button type="button" onClick={() => move(q.id, 1)} disabled={i === cauHoi.length - 1} aria-label="Chuyển xuống" className="size-6 rounded-sm border border-vien text-[11px] hover:border-blue disabled:opacity-30">▼</button>
                  </span>
                </td>
                <td className="text-den max-w-[440px]">{q.cauHoi}</td>
                <td className="text-ink2 text-[12.5px] whitespace-nowrap">{q.dapAn.map((d, k) => `${NHAN_DAP_AN[k]} → ${tenNgan(d.kieuId)}`).join(" · ")}</td>
                <td>{q.hien ? <Chip tone="green">Đang dùng</Chip> : <Chip tone="grey">Ẩn</Chip>}</td>
                <td className="text-right"><button type="button" className="text-blue font-bold" onClick={() => moSuaCau(q)}>Sửa</button></td>
              </tr>
            ))}
          </Table>
          {cauHoi.length === 0 && <div className="text-[13px] text-mut py-6 text-center">Chưa có câu hỏi. Bấm “+ Thêm câu hỏi”.</div>}
        </CmsCard>

        {/* Khối Kiểu kết quả */}
        <CmsCard title="Kiểu kết quả" desc={`${kieu.length} kiểu · mỗi kiểu có huy hiệu, điểm mạnh, phong cách, phù hợp với, đoạn định hướng nghề`} right={<Button size="sm" onClick={moThemKieu}>+ Thêm kiểu kết quả</Button>}>
          <Table head={["Huy hiệu", "Tên kiểu", "Điểm mạnh", "Số đáp án trỏ tới", ""]}>
            {kieu.map((k) => {
              const n = soDapAnTro(k.id);
              return (
                <tr key={k.id}>
                  <td><span className="size-8 rounded-full bg-blue-soft inline-flex items-center justify-center text-[18px]" aria-label="Huy hiệu">{k.huyHieu}</span></td>
                  <td className="font-bold text-den whitespace-nowrap">{k.ten}</td>
                  <td className="text-ink2 text-[12.5px]">{k.diemManh}</td>
                  <td className="tabular-nums">{n}</td>
                  <td className="text-right whitespace-nowrap">
                    <button type="button" className="text-blue font-bold" onClick={() => moSuaKieu(k)}>Sửa</button>
                    <button type="button" onClick={() => xoaKieu(k)} title={n > 0 ? "Còn đáp án trỏ tới — không xoá được" : "Xoá kiểu"} className={n > 0 ? "ml-4 text-mut cursor-not-allowed" : "ml-4 text-ink2 hover:text-red-fg"}>Xoá</button>
                  </td>
                </tr>
              );
            })}
          </Table>
        </CmsCard>
      </div>
      <p className="mt-4 text-[13px] text-ink2">Kéo ⋮⋮ để đổi thứ tự câu hỏi. Kết quả của người làm là kiểu được chọn nhiều nhất.</p>

      {/* H18a · Popup câu hỏi */}
      <Modal open={!!fc} onClose={() => setFc(null)} width={760} title={fc?.id ? `Sửa câu hỏi ${fc.thuTu} / ${cauHoi.length}` : "Thêm câu hỏi"}
        footer={fc && <div className="flex items-center gap-3 w-full"><Button onClick={luuCau}>Lưu</Button><Button kind="secondary" className="ml-auto" onClick={() => setFc(null)}>Huỷ</Button></div>}>
        {fc && (
          <div className="space-y-5">
            <Field label={`Câu hỏi (≤ ${MAX_CAU} ký tự)`} count={`${fc.cauHoi.length}/${MAX_CAU}`} error={err.cauHoi}>
              <Input value={fc.cauHoi} maxLength={MAX_CAU + 20} placeholder="Khi gặp một khách hàng mới, điều đầu tiên bạn muốn làm là gì?" onChange={(e) => setFc({ ...fc, cauHoi: e.target.value })} />
            </Field>
            <div>
              <div className="text-[12.5px] text-ink2 mb-1.5">Đáp án và kiểu kết quả trỏ tới</div>
              <div className="space-y-3">
                {fc.dapAn.map((d, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3">
                      <span className="size-9 shrink-0 rounded-sm bg-blue text-white font-bold inline-flex items-center justify-center">{NHAN_DAP_AN[i]}</span>
                      <Input value={d.text} placeholder="Nội dung đáp án" onChange={(e) => setDa(i, { text: e.target.value })} />
                      <Select value={d.kieuId} onChange={(e) => setDa(i, { kieuId: e.target.value })} className="w-[240px] shrink-0" aria-label={`Kiểu kết quả cho đáp án ${NHAN_DAP_AN[i]}`}>
                        {!d.kieuId && <option value="">Kiểu kết quả…</option>}
                        {kieu.map((k) => <option key={k.id} value={k.id}>{k.ten}</option>)}
                      </Select>
                      <button type="button" onClick={() => boDa(i)} disabled={fc.dapAn.length <= MIN_DA} aria-label={`Bỏ đáp án ${NHAN_DAP_AN[i]}`} className="size-9 shrink-0 rounded-sm border border-vien text-mut hover:text-red-fg hover:border-red-fg disabled:opacity-30">✕</button>
                    </div>
                    {err[`da${i}`] && <p className="mt-1 ml-12 text-[12px] text-red-fg">{err[`da${i}`]}</p>}
                  </div>
                ))}
              </div>
              <button type="button" onClick={themDa} disabled={fc.dapAn.length >= MAX_DA} className="mt-3 text-[13px] text-blue font-bold disabled:opacity-40">+ Thêm đáp án (tối đa {MAX_DA})</button>
            </div>
            <div className="flex items-end gap-8">
              <Field label="Thứ tự" className="w-[200px]">
                <Select value={fc.thuTu} onChange={(e) => setFc({ ...fc, thuTu: Number(e.target.value) })}>
                  {Array.from({ length: cauHoi.length + (fc.id ? 0 : 1) }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </Field>
              <div className="pb-2"><Checkbox label="Hiện trong bộ đề" checked={fc.hien} onChange={(e) => setFc({ ...fc, hien: e.target.checked })} /></div>
            </div>
          </div>
        )}
      </Modal>

      {/* H18b · Popup kiểu kết quả */}
      <Modal open={!!fk} onClose={() => setFk(null)} width={760} title={fk?.id ? "Sửa kiểu kết quả" : "Thêm kiểu kết quả"}
        footer={fk && <div className="flex items-center gap-3 w-full"><Button onClick={luuKieu}>Lưu</Button><Button kind="secondary" onClick={xemTruocKieu}>Xem trước kết quả</Button><Button kind="secondary" className="ml-auto" onClick={() => setFk(null)}>Huỷ</Button></div>}>
        {fk && (
          <div className="space-y-5">
            <Field label={`Tên kiểu (≤ ${MAX_TEN} ký tự)`} count={`${fk.ten.length}/${MAX_TEN}`} error={err.ten}>
              <Input value={fk.ten} maxLength={MAX_TEN + 10} placeholder="Người đồng hành tận tâm" onChange={(e) => setFk({ ...fk, ten: e.target.value })} />
            </Field>
            <div>
              <div className="text-[12.5px] text-ink2 mb-1.5">Huy hiệu (ảnh 1:1, PNG nền trong)</div>
              <div className="flex items-center gap-4">
                <span className="size-16 rounded-full bg-blue-soft inline-flex items-center justify-center text-[32px]" aria-label="Huy hiệu">{fk.huyHieu || "⭐"}</span>
                <div className="flex flex-wrap gap-1.5">
                  {HUY_HIEU_MAU.map((h) => <button key={h} type="button" onClick={() => setFk({ ...fk, huyHieu: h })} className={cx("size-9 rounded-sm border text-[18px]", fk.huyHieu === h ? "border-blue bg-blue-soft" : "border-vien hover:border-blue")} aria-label={`Chọn huy hiệu ${h}`}>{h}</button>)}
                </div>
                <button type="button" className="text-[13px] text-blue font-bold" onClick={() => { setAnhDich("huy-hieu"); anhRef.current?.click(); }}>Thay ảnh</button>
              </div>
            </div>
            <Field label={`Điểm mạnh (≤ ${MAX_DM} ký tự)`} count={`${fk.diemManh.length}/${MAX_DM}`} error={err.diemManh}>
              <Input value={fk.diemManh} maxLength={MAX_DM + 20} placeholder="Lắng nghe kiên nhẫn · Giữ liên lạc dài lâu · Giải thích rõ ràng, dễ hiểu" onChange={(e) => setFk({ ...fk, diemManh: e.target.value })} />
            </Field>
            <Field label={`Phong cách tư vấn (≤ ${MAX_PC} ký tự)`} count={`${fk.phongCach.length}/${MAX_PC}`} error={err.phongCach}>
              <Input value={fk.phongCach} maxLength={MAX_PC + 20} placeholder="Đi từ nhu cầu thật của khách hàng, ưu tiên giải pháp phù hợp thay vì tối đa doanh số." onChange={(e) => setFk({ ...fk, phongCach: e.target.value })} />
            </Field>
            <Field label={`Phù hợp với (≤ ${MAX_PH} ký tự)`} count={`${fk.phuHopVoi.length}/${MAX_PH}`} error={err.phuHopVoi}>
              <Input value={fk.phuHopVoi} maxLength={MAX_PH + 20} placeholder="Gia đình trẻ · Khách hàng cần kế hoạch dài hạn · Khách hàng được người quen giới thiệu" onChange={(e) => setFk({ ...fk, phuHopVoi: e.target.value })} />
            </Field>
            <Field label={`Đoạn định hướng nghề (≤ ${MAX_DH} ký tự)`} count={`${fk.dinhHuong.length}/${MAX_DH}`} error={err.dinhHuong}>
              <Textarea value={fk.dinhHuong} maxLength={MAX_DH + 20} className="min-h-[88px]" placeholder="Với nhóm tính cách này, bạn có thể phát triển tốt trong nghề Tư vấn tài chính nhờ khả năng xây dựng niềm tin lâu dài với khách hàng." onChange={(e) => setFk({ ...fk, dinhHuong: e.target.value })} />
            </Field>
            <div>
              <div className="text-[12.5px] text-ink2 mb-1.5">Ảnh chia sẻ (1200×630)</div>
              <div className="grid grid-cols-[200px_1fr] gap-4 items-start">
                <ImageBox ratio="1200/630" alt="Ảnh chia sẻ" />
                <div className="space-y-2">
                  <Select value={fk.anhChiaSe} onChange={(e) => setFk({ ...fk, anhChiaSe: e.target.value as FormKieu["anhChiaSe"] })}>
                    <option value="tu-tao">Tự tạo từ huy hiệu và tên kiểu</option>
                    <option value="tai-len">Ảnh tải lên</option>
                  </Select>
                  <button type="button" className="text-[13px] text-blue font-bold" onClick={() => { setAnhDich("chia-se"); anhRef.current?.click(); }}>Chọn ảnh khác</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
      {node}
    </>
  );
}
