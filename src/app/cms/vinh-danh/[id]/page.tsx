"use client";
/**
 * H03b · CMS — Một bảng vinh danh (tên · thời gian, 09/09): hạng mục sửa tại chỗ (tên · Ẩn/Hiện · thứ tự · + Thêm hạng mục)
 * và mỗi hạng mục một bảng Người đạt (+ Thêm TVV → popup H03c · Thêm từ Excel → H03d). Công bố / Gỡ công bố.
 */
import { fmtTien } from "@/components/vinh-danh/honor";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { R } from "@/lib/routes";
import { thangLabel } from "@/lib/seed";
import type { HangMuc, NguoiDat, HonorMonth } from "@/lib/types";
import { Button, Chip, EmptyState, Field, Input, Table, cx, useFlash } from "@/components/ui";
import { CmsCard, CmsFormActions, CmsHeader } from "@/components/cms/CmsShell";
import { ThemTvvModal } from "@/components/vinh-danh/ThemTvvModal";
import { useHonor } from "@/components/vinh-danh/honor";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { flash, node } = useFlash();
  const { data, actions, hangMucSorted, tatCa } = useHonor();
  const month = data.honorMonths.find((m) => m.id === id);
  const [suaHm, setSuaHm] = useState<{ id: string; ten: string } | null>(null);
  const [themHm, setThemHm] = useState<string | null>(null);
  const [modal, setModal] = useState<{ hm: HangMuc; edit?: NguoiDat } | null>(null);

  if (!month) {
    return (<><CmsHeader crumbs={[{ label: "Vinh danh", href: R.H03 }]} title="Không tìm thấy tháng" /><EmptyState title="Tháng này không có trong danh sách" action={<Button kind="secondary" href={R.H03}>Về danh sách</Button>} /></>);
  }

  const daCongBo = month.trangThai === "da-cong-bo";
  const capNhatThang = () => actions.update("honorMonths", (ms) => ms.map((m) => m.id === id ? { ...m, capNhat: new Date().toISOString() } : m));

  /* --- hạng mục dùng chung mọi bảng --- */
  const luuTenHm = () => {
    if (!suaHm) return;
    const ten = suaHm.ten.trim();
    if (!ten) { flash("Tên hạng mục không được để trống"); return; }
    actions.update("hangMuc", (hs) => hs.map((h) => h.id === suaHm.id ? { ...h, ten } : h));
    setSuaHm(null); flash("Đã lưu tên hạng mục");
  };
  const toggleHien = (h: HangMuc) => { actions.update("hangMuc", (hs) => hs.map((x) => x.id === h.id ? { ...x, hien: !x.hien } : x)); flash(h.hien ? `Đã ẩn ${h.ten} trên trang Vinh danh` : `Đã hiện ${h.ten}`); };
  const doiThuTu = (h: HangMuc, dir: -1 | 1) => {
    const i = hangMucSorted.findIndex((x) => x.id === h.id); const j = i + dir;
    if (j < 0 || j >= hangMucSorted.length) return;
    const order = [...hangMucSorted]; [order[i], order[j]] = [order[j], order[i]];
    actions.update("hangMuc", (hs) => hs.map((x) => ({ ...x, thuTu: order.findIndex((o) => o.id === x.id) + 1 })));
  };
  const themHangMuc = () => {
    const ten = (themHm ?? "").trim();
    if (!ten) { flash("Nhập tên hạng mục"); return; }
    const slug = ten.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `hm-${Date.now()}`;
    if (data.hangMuc.some((h) => h.id === slug)) { flash("Hạng mục này đã có"); return; }
    actions.update("hangMuc", (hs) => [...hs, { id: slug, ten, hien: true, thuTu: hs.length + 1 }]);
    setThemHm(null); flash(`Đã thêm hạng mục ${ten}`);
  };

  /* --- người đạt --- */
  const xoaNguoi = (hm: HangMuc, nd: NguoiDat) => {
    actions.update("honorMonths", (ms) => ms.map((m) => m.id !== id ? m : { ...m, capNhat: new Date().toISOString(), hangMuc: m.hangMuc.map((h) => h.hangMucId !== hm.id ? h : { ...h, nguoiDat: h.nguoiDat.filter((x) => x.advisorMa !== nd.advisorMa).map((x, i) => ({ ...x, thuHang: i + 1 })) }) }));
    flash("Đã xoá khỏi bảng");
  };

  /* --- tên & thời gian bảng (09/09) --- */
  const suaBang = (patch: Partial<HonorMonth>) => actions.update("honorMonths", (ms) => ms.map((m) => (m.id === id ? { ...m, ...patch, capNhat: new Date().toISOString() } : m)));

  const tongNguoi = month.hangMuc.reduce((n, h) => n + h.nguoiDat.length, 0);
  const soHangMucCo = month.hangMuc.filter((h) => h.nguoiDat.length > 0).length;

  /* --- công bố: admin quyết; người có tài khoản được báo (thông báo + email), không có bước đồng ý (09/09) --- */
  const congBo = () => {
    actions.update("honorMonths", (ms) => ms.map((m) => m.id === id ? { ...m, trangThai: "da-cong-bo", congBo: new Date().toISOString(), capNhat: new Date().toISOString() } : m));
    for (const h of month.hangMuc) for (const n of h.nguoiDat) if (data.advisors.some((a) => a.ma === n.advisorMa)) actions.notify(n.advisorMa, `Bạn được vinh danh ${data.hangMuc.find((x) => x.id === h.hangMucId)?.ten ?? h.hangMucId} · ${thangLabel(month)} — bảng đã công bố.`, R.G02a);
    router.push(R.H03);
  };
  const goCongBo = () => {
    actions.update("honorMonths", (ms) => ms.map((m) => m.id === id ? { ...m, trangThai: "nhap", congBo: undefined, capNhat: new Date().toISOString() } : m));
    flash(`Đã gỡ công bố ${thangLabel(month)}`);
  };

  return (
    <>
      <CmsHeader crumbs={[{ label: "Vinh danh", href: R.H03 }, { label: thangLabel(month) }]} title={
        <span className="flex flex-wrap items-center gap-3">
          <Input value={month.ten} maxLength={60} onChange={(e) => suaBang({ ten: e.target.value })} aria-label="Tên bảng" className="h-11 w-[420px] font-bold text-[20px]" />
          <Input type="date" value={month.tuNgay ?? ""} onChange={(e) => suaBang({ tuNgay: e.target.value || undefined })} aria-label="Từ ngày" className="h-11 w-[160px]" />
          <Input type="date" value={month.denNgay ?? ""} onChange={(e) => suaBang({ denNgay: e.target.value || undefined })} aria-label="Đến ngày" className="h-11 w-[160px]" />
          <Chip tone={daCongBo ? "green" : "amber"}>{daCongBo ? "ĐÃ CÔNG BỐ" : "NHÁP — CHƯA CÔNG BỐ"}</Chip>
        </span>
      } desc="Tên bảng do Chubb đặt — hiện làm tiêu đề trên trang Vinh danh. Thời gian tuỳ chọn." right={<Button kind="secondary" href={R.H03d(month.id)}>Thêm từ Excel</Button>} />

      <div className="space-y-5">
        {hangMucSorted.map((h, idx) => {
          const ds = tatCa(month, h.id);
          const tomTat = ds.length === 0 ? "chưa có người" : `${ds.length} người`;
          return (
            <CmsCard key={h.id} className={cx(!h.hien && "opacity-80")}
              title={<span className="flex items-center gap-2">
                <span className="inline-flex flex-col text-[10px] leading-none text-mut">
                  <button type="button" aria-label="Lên" disabled={idx === 0} onClick={() => doiThuTu(h, -1)} className="hover:text-blue disabled:opacity-30">▲</button>
                  <button type="button" aria-label="Xuống" disabled={idx === hangMucSorted.length - 1} onClick={() => doiThuTu(h, 1)} className="hover:text-blue disabled:opacity-30">▼</button>
                </span>
                {idx + 1} · {h.ten} — {tomTat}
                {!h.hien && <Chip tone="grey">Đã ẩn</Chip>}
              </span>}
              right={<div className="flex flex-wrap gap-2">
                <Button size="sm" kind="ghost" onClick={() => setSuaHm({ id: h.id, ten: h.ten })}>Sửa hạng mục</Button>
                <Button size="sm" kind="ghost" onClick={() => toggleHien(h)}>{h.hien ? "Ẩn" : "Hiện"}</Button>
                <Button size="sm" kind="secondary" onClick={() => setModal({ hm: h })}>+ Thêm TVV</Button>
              </div>}>
              {suaHm?.id === h.id && (
                <div className="mb-4 p-4 bg-xam rounded-sm flex flex-wrap items-end gap-3">
                  <Field label="Tên hạng mục (≤ 30 ký tự)" className="w-[260px]"><Input maxLength={30} value={suaHm.ten} onChange={(e) => setSuaHm({ ...suaHm, ten: e.target.value })} /></Field>
                  <Button size="sm" onClick={luuTenHm}>Lưu</Button>
                  <Button size="sm" kind="secondary" onClick={() => setSuaHm(null)}>Huỷ</Button>
                </div>
              )}
              {ds.length === 0 ? (
                <p className="text-[13px] text-ink2">Chưa có người được vinh danh ở hạng mục này trong bảng — bấm + Thêm TVV hoặc Thêm từ Excel.</p>
              ) : (
                <Table head={["Thứ tự", "Mã TVV", "Họ tên", "Văn phòng", "Doanh số · phí năm đầu", "Hợp đồng", "Khách hàng", "Nguồn", ""]}>
                  {ds.map((v) => (
                    <tr key={v.ma}>
                      <td className="text-ink2">{v.nd.thuHang}</td>
                      <td className="text-ink2">{v.coTaiKhoan ? v.ma : "—"}</td>
                      <td><span className="font-bold">{v.hoTen}</span>{v.nd.thuHang === 1 && <Chip tone="blue" className="ml-2 h-[22px] text-[11px]">DẪN ĐẦU</Chip>}</td>
                      <td className="text-[12.5px] text-ink2">{v.vanPhong}</td>
                      <td className="text-[12.5px] text-den whitespace-nowrap">{fmtTien(v.nd.doanhSo)}</td>
                      <td className="text-[12.5px] text-den">{v.nd.hopDong ?? "—"}</td>
                      <td className="text-[12.5px] text-den">{v.nd.khachHang ?? "—"}</td>
                      <td className="text-[12.5px] text-ink2">{v.nd.nguon === "excel" ? "Excel" : "Thêm tay"}</td>
                      <td className="text-right whitespace-nowrap">
                        <button type="button" className="font-bold text-blue hover:underline" onClick={() => setModal({ hm: h, edit: v.nd })}>Sửa</button>
                        <button type="button" className="ml-3 font-bold text-red-fg hover:underline" onClick={() => xoaNguoi(h, v.nd)}>Xoá</button>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </CmsCard>
          );
        })}

        <CmsCard>
          <div className="flex flex-wrap items-center gap-4">
            {themHm === null ? <Button kind="secondary" size="sm" onClick={() => setThemHm("")}>+ Thêm hạng mục</Button> : (
              <div className="flex flex-wrap items-end gap-3">
                <Field label="Tên hạng mục (≤ 30 ký tự)" className="w-[260px]"><Input autoFocus maxLength={30} value={themHm} onChange={(e) => setThemHm(e.target.value)} /></Field>
                <Button size="sm" onClick={themHangMuc}>Lưu</Button>
                <Button size="sm" kind="secondary" onClick={() => setThemHm(null)}>Huỷ</Button>
              </div>
            )}
            <span className="text-[12.5px] text-ink2">Hạng mục dùng chung cho mọi bảng; tên đổi ở đây thì các bảng trước đổi theo.</span>
          </div>
        </CmsCard>

        <CmsCard title="Công bố">
          <p className="text-[12.5px] text-ink2">{tongNguoi} người đạt · {soHangMucCo} hạng mục — hiện công khai trên trang Vinh danh ngay khi công bố.</p>
          <CmsFormActions>
            <Button kind="secondary" onClick={() => { capNhatThang(); flash("Đã lưu nháp"); }}>Lưu nháp</Button>
            <Button kind="secondary" onClick={() => window.open(daCongBo ? R.C04(month.id) : R.C01, "_blank")}>Xem trước</Button>
            {daCongBo ? <Button kind="danger" onClick={goCongBo}>Gỡ công bố</Button> : <Button onClick={congBo} disabled={tongNguoi === 0}>Công bố</Button>}
            <Button kind="ghost" href={R.H03}>Huỷ</Button>
          </CmsFormActions>
        </CmsCard>
      </div>

      {modal && <ThemTvvModal key={`${modal.hm.id}-${modal.edit?.advisorMa ?? "new"}`} open onClose={() => setModal(null)} month={month} hangMuc={modal.hm} edit={modal.edit} onDone={flash} />}
      {node}
    </>
  );
}
