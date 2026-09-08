"use client";
/**
 * H17 · CMS — Tài chính cá nhân — MỘT trang tham số (hiện trên D03).
 * 1 Tham số mặc định · 2 Danh mục mục tiêu (sửa tại chỗ, thêm/xoá, lên/xuống) · 3 Giới hạn ô nhập · 4 Chữ trên công cụ.
 * Cột phải: Trạng thái (Đang áp dụng · lưu gần nhất · người sửa · Lịch sử thay đổi) + Chạy thử với số mẫu.
 * Nút: Lưu thay đổi (ghi store.financeParams) · Xem trước công cụ → D03 tab mới · Huỷ (khôi phục giá trị đang lưu).
 */
import { useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentCmsUser, useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/seed";
import type { FinanceParams } from "@/lib/types";
import { Button, Chip, EmptyState, Field, Input, Modal, Table, Textarea, useFlash } from "@/components/ui";
import { CmsCard, CmsFormActions, CmsHeader } from "@/components/cms/CmsShell";
import { fmtTien, tinhTaiChinh } from "@/components/cong-cu/tinh-toan";

const soLe = (v: string) => Number(String(v).replace(/[^\d]/g, "")) || 0;
const nhomSo = (n: number) => (n ? n.toLocaleString("vi-VN") : "");
const THU_NHAP_MAU = 30_000_000;

const clone = (p: FinanceParams): FinanceParams => ({ ...p, mucTieu: p.mucTieu.map((m) => ({ ...m })), gioiHan: { ...p.gioiHan }, lichSu: p.lichSu ? [...p.lichSu] : [] });

export default function Page() {
  const { data, ready, actions } = useStore();
  const user = useCurrentCmsUser();
  const { flash, node } = useFlash();
  const [f, setF] = useState<FinanceParams | null>(null);
  const [err, setErr] = useState<Record<string, string>>({});
  const [lichSu, setLichSu] = useState(false);
  const [daChay, setDaChay] = useState(false);

  // Nạp form một lần khi store sẵn sàng (điều chỉnh state trong lúc render — không dùng effect)
  const [daNap, setDaNap] = useState(false);
  if (ready && !daNap) { setDaNap(true); setF(clone(data.financeParams)); }

  const kq = useMemo(() => {
    if (!f) return null;
    const mt = f.mucTieu.filter((m) => m.soTienGoiY > 0).slice(0, 2).map((m) => ({ ten: m.ten, soTien: m.soTienGoiY }));
    return { mt, ...tinhTaiChinh({ thuNhap: THU_NHAP_MAU, tyLe: f.tyLeTietKiemGoiY, laiSuat: f.laiSuatMacDinh, soNam: f.thoiGianMacDinh, mucTieu: mt }) };
  }, [f]);

  if (!ready || !f || !kq) return null;
  const g = f.gioiHan;
  const daLuu = data.financeParams;
  const thayDoi = JSON.stringify({ ...f, lichSu: undefined, capNhat: undefined }) !== JSON.stringify({ ...daLuu, lichSu: undefined, capNhat: undefined });

  const set = (patch: Partial<FinanceParams>) => setF({ ...f, ...patch });
  const setGH = (patch: Partial<FinanceParams["gioiHan"]>) => setF({ ...f, gioiHan: { ...f.gioiHan, ...patch } });
  const setMT = (i: number, patch: Partial<FinanceParams["mucTieu"][number]>) => set({ mucTieu: f.mucTieu.map((m, k) => (k === i ? { ...m, ...patch } : m)) });
  const themMT = () => set({ mucTieu: [...f.mucTieu, { id: `mt${Date.now()}`, ten: "", soTienGoiY: 0 }] });
  const xoaMT = (i: number) => set({ mucTieu: f.mucTieu.filter((_, k) => k !== i) });
  const doiCho = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= f.mucTieu.length) return; const l = [...f.mucTieu]; [l[i], l[j]] = [l[j], l[i]]; set({ mucTieu: l }); };

  const validate = () => {
    const e: Record<string, string> = {};
    const duong = (v: number | undefined) => v !== undefined && v < 0;
    if (duong(f.laiSuatMacDinh)) e.laiSuat = "Lãi suất không được âm.";
    if (f.tyLeTietKiemGoiY <= 0 || f.tyLeTietKiemGoiY > 100) e.tyLe = "Nhập từ 1 đến 100 %.";
    if (f.thoiGianMacDinh <= 0) e.thoiGian = "Thời gian phải lớn hơn 0.";
    if (duong(g.thuNhapMin) || duong(g.thuNhapMax)) e.thuNhap = "Thu nhập không được âm.";
    else if (g.thuNhapMin > g.thuNhapMax) e.thuNhap = "Giá trị nhỏ nhất phải nhỏ hơn giá trị lớn nhất.";
    if ((g.tyLeMax ?? 80) <= 0 || (g.tyLeMax ?? 80) > 100) e.tyLeMax = "Nhập từ 1 đến 100 %.";
    if (duong(g.laiSuatMax)) e.laiSuatMax = "Lãi suất không được âm.";
    if ((g.thoiGianMin ?? 1) <= 0 || g.thoiGianMax <= 0) e.thoiGianGH = "Thời gian phải lớn hơn 0.";
    else if ((g.thoiGianMin ?? 1) > g.thoiGianMax) e.thoiGianGH = "Giá trị nhỏ nhất phải nhỏ hơn giá trị lớn nhất.";
    if (f.laiSuatMacDinh > (g.laiSuatMax ?? 15)) e.laiSuat = `Lãi suất mặc định vượt giới hạn ${g.laiSuatMax ?? 15} %.`;
    if (f.tyLeTietKiemGoiY > (g.tyLeMax ?? 80)) e.tyLe = `Tỷ lệ gợi ý vượt giới hạn ${g.tyLeMax ?? 80} %.`;
    if (f.thoiGianMacDinh > g.thoiGianMax) e.thoiGian = `Thời gian mặc định vượt giới hạn ${g.thoiGianMax} năm.`;
    if (f.mucTieu.some((m) => !m.ten.trim())) e.mucTieu = "Mỗi mục tiêu cần có tên.";
    if (f.mucTieu.some((m) => m.soTienGoiY < 0)) e.mucTieu = "Số tiền gợi ý không được âm.";
    if (f.mucTieu.length === 0) e.mucTieu = "Cần ít nhất một mục tiêu.";
    if (!f.luuY.trim()) e.luuY = "Nhập dòng lưu ý.";
    else if (f.luuY.length > 200) e.luuY = "Dòng lưu ý tối đa 200 ký tự.";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const tomTat = () => {
    const d: string[] = [];
    if (f.laiSuatMacDinh !== daLuu.laiSuatMacDinh) d.push(`lãi suất mặc định ${daLuu.laiSuatMacDinh}% → ${f.laiSuatMacDinh}%`);
    if (f.tyLeTietKiemGoiY !== daLuu.tyLeTietKiemGoiY) d.push(`tỷ lệ tiết kiệm gợi ý ${daLuu.tyLeTietKiemGoiY}% → ${f.tyLeTietKiemGoiY}%`);
    if (f.thoiGianMacDinh !== daLuu.thoiGianMacDinh) d.push(`thời gian mặc định ${daLuu.thoiGianMacDinh} → ${f.thoiGianMacDinh} năm`);
    if (JSON.stringify(f.mucTieu) !== JSON.stringify(daLuu.mucTieu)) d.push(`danh mục mục tiêu (${f.mucTieu.length} mục)`);
    if (JSON.stringify(f.gioiHan) !== JSON.stringify(daLuu.gioiHan)) d.push("giới hạn ô nhập");
    if (f.luuY !== daLuu.luuY) d.push("dòng lưu ý");
    return d.length ? `Đổi ${d.join(" · ")}.` : "Lưu lại không đổi giá trị.";
  };

  const luu = () => {
    if (!validate()) return;
    const now = new Date().toISOString();
    const boi = user?.hoTen ?? "Quản trị";
    const saved: FinanceParams = { ...f, mucTieu: f.mucTieu.map((m) => ({ ...m, ten: m.ten.trim() })), capNhat: now, capNhatBoi: boi, lichSu: [{ ngay: now, boi, noiDung: tomTat() }, ...(daLuu.lichSu ?? [])] };
    actions.update("financeParams", () => saved);
    setF(clone(saved));
    flash("Đã lưu — công cụ Quản lý tài chính cá nhân dùng tham số mới ngay");
  };
  const huy = () => { setF(clone(daLuu)); setErr({}); setDaChay(false); flash("Đã bỏ thay đổi, về giá trị đang lưu"); };
  const xemTruoc = () => window.open(R.D03, "_blank");

  const soLon = (n: number) => (n >= 1e9 ? `${(n / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ` : n >= 1e6 ? `${Math.round(n / 1e6).toLocaleString("vi-VN")} triệu` : nhomSo(n));

  return (
    <>
      <CmsHeader title="Tài chính cá nhân" desc="Tham số của công cụ Quản lý tài chính cá nhân · đang áp dụng" />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6">
          <CmsCard title="1 · Tham số mặc định" desc="Điền sẵn trên công cụ, người dùng sửa được">
            <div className="grid grid-cols-3 gap-5">
              <Field label="Lãi suất ước tính mặc định" error={err.laiSuat}>
                <div className="relative"><Input type="number" step={0.1} min={0} value={f.laiSuatMacDinh} onChange={(e) => set({ laiSuatMacDinh: Number(e.target.value) })} className="pr-16" /><span className="absolute right-3 top-2 text-[13px] text-mut">% / năm</span></div>
              </Field>
              <Field label="Tỷ lệ tiết kiệm gợi ý" error={err.tyLe}>
                <div className="relative"><Input type="number" min={1} max={100} value={f.tyLeTietKiemGoiY} onChange={(e) => set({ tyLeTietKiemGoiY: Number(e.target.value) })} className="pr-10" /><span className="absolute right-3 top-2 text-[13px] text-mut">%</span></div>
              </Field>
              <Field label="Thời gian mặc định" error={err.thoiGian}>
                <div className="relative"><Input type="number" min={1} value={f.thoiGianMacDinh} onChange={(e) => set({ thoiGianMacDinh: Number(e.target.value) })} className="pr-14" /><span className="absolute right-3 top-2 text-[13px] text-mut">năm</span></div>
              </Field>
            </div>
          </CmsCard>

          <CmsCard title="2 · Danh mục mục tiêu" desc='Hiện trong ô chọn "Thêm mục tiêu"' right={<Button size="sm" kind="secondary" onClick={themMT}>+ Thêm mục tiêu</Button>}>
            {f.mucTieu.length === 0 ? <EmptyState title="Chưa có mục tiêu" desc="Người dùng sẽ không chọn được mục tiêu nào trên công cụ." action={<Button size="sm" onClick={themMT}>+ Thêm mục tiêu</Button>} /> : (
              <Table head={["Thứ tự", "Tên mục tiêu", "Số tiền gợi ý (₫)", ""]}>
                {f.mucTieu.map((m, i) => (
                  <tr key={m.id}>
                    <td className="whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-ink2">
                        <span className="w-5 text-[13px] tabular-nums">{i + 1}</span>
                        <button type="button" aria-label="Lên" disabled={i === 0} onClick={() => doiCho(i, -1)} className="size-7 rounded-sm border border-vien hover:border-blue hover:text-blue disabled:opacity-30">↑</button>
                        <button type="button" aria-label="Xuống" disabled={i === f.mucTieu.length - 1} onClick={() => doiCho(i, 1)} className="size-7 rounded-sm border border-vien hover:border-blue hover:text-blue disabled:opacity-30">↓</button>
                      </span>
                    </td>
                    <td><Input value={m.ten} onChange={(e) => setMT(i, { ten: e.target.value })} placeholder="Tên mục tiêu" className="max-w-[300px] font-bold" /></td>
                    <td>
                      <Input inputMode="numeric" value={nhomSo(m.soTienGoiY)} onChange={(e) => setMT(i, { soTienGoiY: soLe(e.target.value) })} placeholder="người dùng nhập" className="max-w-[220px] tabular-nums" />
                    </td>
                    <td className="text-right"><button type="button" className="text-[13px] text-ink2 hover:text-red-fg" onClick={() => xoaMT(i)}>Xoá</button></td>
                  </tr>
                ))}
              </Table>
            )}
            {err.mucTieu && <div className="mt-2 text-[12px] text-red-fg">{err.mucTieu}</div>}
            <div className="mt-2 text-[12px] text-mut">Để trống số tiền nếu muốn người dùng tự nhập.</div>
          </CmsCard>

          <CmsCard title="3 · Giới hạn ô nhập">
            <div className="grid grid-cols-2 gap-5">
              <Field label="Thu nhập hàng tháng (₫)" error={err.thuNhap}>
                <div className="flex items-center gap-2">
                  <Input inputMode="numeric" value={nhomSo(g.thuNhapMin)} onChange={(e) => setGH({ thuNhapMin: soLe(e.target.value) })} aria-label="Thu nhập nhỏ nhất" />
                  <span className="text-mut">–</span>
                  <Input inputMode="numeric" value={nhomSo(g.thuNhapMax)} onChange={(e) => setGH({ thuNhapMax: soLe(e.target.value) })} aria-label="Thu nhập lớn nhất" />
                </div>
              </Field>
              <Field label="Tỷ lệ tiết kiệm mỗi tháng" error={err.tyLeMax}>
                <div className="flex items-center gap-2">
                  <Input value="1" disabled aria-label="Tỷ lệ nhỏ nhất" /><span className="text-mut">–</span>
                  <div className="relative w-full"><Input type="number" min={1} max={100} value={g.tyLeMax ?? 80} onChange={(e) => setGH({ tyLeMax: Number(e.target.value) })} className="pr-10" aria-label="Tỷ lệ lớn nhất" /><span className="absolute right-3 top-2 text-[13px] text-mut">%</span></div>
                </div>
              </Field>
              <Field label="Lãi suất ước tính" error={err.laiSuatMax}>
                <div className="flex items-center gap-2">
                  <Input value="0" disabled aria-label="Lãi suất nhỏ nhất" /><span className="text-mut">–</span>
                  <div className="relative w-full"><Input type="number" step={0.1} min={0} value={g.laiSuatMax ?? 15} onChange={(e) => setGH({ laiSuatMax: Number(e.target.value) })} className="pr-16" aria-label="Lãi suất lớn nhất" /><span className="absolute right-3 top-2 text-[13px] text-mut">% / năm</span></div>
                </div>
              </Field>
              <Field label="Thời gian tiết kiệm / đầu tư" error={err.thoiGianGH}>
                <div className="flex items-center gap-2">
                  <Input type="number" min={1} value={g.thoiGianMin ?? 1} onChange={(e) => setGH({ thoiGianMin: Number(e.target.value) })} aria-label="Thời gian nhỏ nhất" /><span className="text-mut">–</span>
                  <div className="relative w-full"><Input type="number" min={1} value={g.thoiGianMax} onChange={(e) => setGH({ thoiGianMax: Number(e.target.value) })} className="pr-14" aria-label="Thời gian lớn nhất" /><span className="absolute right-3 top-2 text-[13px] text-mut">năm</span></div>
                </div>
              </Field>
            </div>
          </CmsCard>

          <CmsCard title="4 · Chữ trên công cụ">
            <Field label="Dòng lưu ý dưới kết quả (≤ 200 ký tự)" count={`${f.luuY.length}/200`} error={err.luuY}>
              <Textarea value={f.luuY} onChange={(e) => set({ luuY: e.target.value })} className="min-h-[64px]" />
            </Field>
          </CmsCard>

          <CmsCard>
            <CmsFormActions>
              <Button onClick={luu}>Lưu thay đổi</Button>
              <Button kind="secondary" onClick={xemTruoc}>Xem trước công cụ</Button>
              {thayDoi && <span className="text-[12.5px] text-amber-fg">Có thay đổi chưa lưu — công cụ vẫn dùng bản đang áp dụng.</span>}
              <Button kind="ghost" className="ml-auto" onClick={huy} disabled={!thayDoi}>Huỷ</Button>
            </CmsFormActions>
          </CmsCard>
        </div>

        <aside className="space-y-6">
          <CmsCard title="Trạng thái">
            <Chip tone="green">Đang áp dụng</Chip>
            <div className="mt-3 text-[13px] text-ink2">Lưu gần nhất {fmtDateTime(daLuu.capNhat)} · {daLuu.capNhatBoi}</div>
            <button type="button" className="mt-2 text-[13px] text-blue font-bold" onClick={() => setLichSu(true)}>Lịch sử thay đổi ({daLuu.lichSu?.length ?? 0}) · Xem</button>
          </CmsCard>

          <CmsCard title="Chạy thử với số mẫu" desc="Dùng tham số đang sửa ở bên trái">
            <dl className="text-[13px] space-y-2.5">
              <div><dt className="text-ink2 text-[12px]">Thu nhập hàng tháng</dt><dd className="font-bold text-den">{nhomSo(THU_NHAP_MAU)} ₫</dd></div>
              <div><dt className="text-ink2 text-[12px]">Tỷ lệ tiết kiệm</dt><dd className="font-bold text-den">{f.tyLeTietKiemGoiY} %</dd></div>
              <div><dt className="text-ink2 text-[12px]">Lãi suất · thời gian</dt><dd className="font-bold text-den">{f.laiSuatMacDinh} % / năm · {f.thoiGianMacDinh} năm</dd></div>
              <div><dt className="text-ink2 text-[12px]">Mục tiêu</dt><dd className="font-bold text-den">{kq.mt.length ? kq.mt.map((m) => `${m.ten} ${soLon(m.soTien)}`).join(" · ") : "— chưa có mục tiêu có số tiền gợi ý"}</dd></div>
            </dl>
            {daChay && (
              <div className="mt-4 pt-4 border-t border-vien2 text-[13px] space-y-2">
                <div className="flex justify-between gap-3"><span className="text-ink2">Tiết kiệm mỗi tháng</span><b className="text-den whitespace-nowrap">{fmtTien(kq.tietKiemThang)}</b></div>
                <div className="flex justify-between gap-3"><span className="text-ink2">Tích luỹ sau {f.thoiGianMacDinh} năm</span><b className="text-den whitespace-nowrap">≈ {fmtTien(kq.tichLuy)}</b></div>
                {kq.tongMucTieu > 0 && <div className="flex justify-between gap-3"><span className="text-ink2">Cần mỗi tháng cho {soLon(kq.tongMucTieu)}</span><b className="text-den whitespace-nowrap">≈ {fmtTien(kq.canMoiThang)}</b></div>}
              </div>
            )}
            <Button kind="secondary" size="sm" className="mt-4" onClick={() => setDaChay(true)}>{daChay ? "Chạy lại" : "Chạy thử"}</Button>
          </CmsCard>
        </aside>
      </div>

      <Modal open={lichSu} onClose={() => setLichSu(false)} title="Lịch sử thay đổi" width={600}>
        {!daLuu.lichSu?.length ? <div className="text-ink2 text-[14px]">Chưa có thay đổi nào.</div> : (
          <ul className="divide-y divide-vien2 text-[14px]">
            {daLuu.lichSu.map((h, i) => (
              <li key={i} className="py-3"><div className="text-[12.5px] text-ink2">{fmtDateTime(h.ngay)} · {h.boi}</div><div className="text-den mt-0.5">{h.noiDung}</div></li>
            ))}
          </ul>
        )}
      </Modal>
      {node}
    </>
  );
}
