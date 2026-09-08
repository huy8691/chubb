"use client";
/**
 * H11b · CMS — Thêm / sửa Tư vấn viên. Dùng chung cho /cms/tu-van-vien/moi và /cms/tu-van-vien/[ma]/sua.
 * Không có khối trạng thái tài khoản: tạo mới là hoạt động; nghỉ việc xử lý bằng "Gỡ" trên H11a.
 * Đổi email đăng nhập tại đây — mã đăng nhập gửi tới email mới.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CmsCard, CmsFormActions, CmsHeader } from "@/components/cms/CmsShell";
import { Button, Field, Input, Select, useFlash } from "@/components/ui";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import type { Advisor } from "@/lib/types";

const CHUC_DANH = ["Tư vấn tài chính", "Tư vấn tài chính cao cấp", "Trưởng nhóm kinh doanh", "Giám đốc kinh doanh khu vực"];
const VAN_PHONG = ["TP. Hồ Chí Minh — Q.1", "TP. Hồ Chí Minh — Q.7", "Hà Nội — Cầu Giấy", "Đà Nẵng — Hải Châu", "Cần Thơ — Ninh Kiều", "Hải Phòng — Lê Chân"];

type Form = { ma: string; hoTen: string; email: string; chucDanh: string; vanPhong: string; ngayBatDau: string };
const trong = (): Form => ({ ma: "", hoTen: "", email: "", chucDanh: CHUC_DANH[0], vanPhong: VAN_PHONG[0], ngayBatDau: new Date().toISOString().slice(0, 10) });

export function TvvForm({ ma }: { ma?: string }) {
  const router = useRouter();
  const { data, actions, ready } = useStore();
  const { flash, node } = useFlash();
  const goc = ma ? data.advisors.find((a) => a.ma === ma) : undefined;
  const [f, setF] = useState<Form>(() => goc ? { ma: goc.ma, hoTen: goc.hoTen, email: goc.email, chucDanh: goc.chucDanh, vanPhong: goc.vanPhong, ngayBatDau: goc.ngayBatDau.slice(0, 10) } : trong());
  const [err, setErr] = useState<Partial<Record<keyof Form, string>>>({});
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setF({ ...f, [k]: e.target.value }); setErr({ ...err, [k]: undefined }); };

  if (!ready) return null;
  if (ma && !goc) return <CmsHeader crumbs={[{ label: "Tư vấn viên", href: R.H11 }]} title="Không tìm thấy Tư vấn viên" />;

  const kiem = (): boolean => {
    const e: typeof err = {};
    if (!/^\d{7}$/.test(f.ma)) e.ma = "Mã Tư vấn viên phải đủ 7 chữ số";
    else if (data.advisors.some((a) => a.ma === f.ma && a.ma !== goc?.ma)) e.ma = `Mã đã dùng cho Tư vấn viên ${data.advisors.find((a) => a.ma === f.ma)!.hoTen}`;
    if (!f.hoTen.trim()) e.hoTen = "Nhập họ tên"; else if (f.hoTen.trim().length > 60) e.hoTen = "Họ tên tối đa 60 ký tự";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Email không đúng định dạng";
    else { const trung = data.advisors.find((a) => a.email.toLowerCase() === f.email.toLowerCase() && a.ma !== goc?.ma); if (trung) e.email = `Email đã dùng cho Tư vấn viên ${trung.ma}`; }
    if (!f.ngayBatDau) e.ngayBatDau = "Chọn ngày bắt đầu";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const luu = (themTiep: boolean) => {
    if (!kiem()) return;
    const doiEmail = goc && goc.email.toLowerCase() !== f.email.toLowerCase();
    if (goc) {
      actions.update("advisors", (list) => list.map((a) => a.ma === goc.ma ? { ...a, hoTen: f.hoTen.trim(), email: f.email.trim(), chucDanh: f.chucDanh, vanPhong: f.vanPhong, ngayBatDau: f.ngayBatDau } : a));
      router.push(`${R.H11a(goc.ma)}?da=${doiEmail ? "moi" : "sua"}`);
      return;
    }
    const moi: Advisor = {
      ma: f.ma, hoTen: f.hoTen.trim(), email: f.email.trim(), chucDanh: f.chucDanh, vanPhong: f.vanPhong, ngayBatDau: f.ngayBatDau,
      soDienThoai: "09" + String(Math.floor(10000000 + Math.random() * 89999999)), theCongKhai: true, hienTrenBXH: true, nhanThongBaoEmail: true,
      danhHieu: [], luotChiaSeThangNay: 0, moTuLinkThangNay: 0, trangThaiTaiKhoan: "hoat-dong",
    };
    moi.zalo = moi.soDienThoai;
    actions.update("advisors", (list) => [moi, ...list]);
    actions.update("ranking", (rows) => [...rows, { advisorMa: moi.ma, luotDuocTinh: 0, luotKhongHopLe: 0, nutBamNhieuNhat: "Zalo", moTuLink: 0 }]);
    if (themTiep) { setF(trong()); flash(`Đã tạo ${moi.hoTen} và gửi mã đăng nhập tới ${moi.email}`); return; }
    router.push(`${R.H11a(moi.ma)}?da=moi`);
  };

  const tieuDe = goc ? "Sửa thông tin Tư vấn viên" : "Thêm Tư vấn viên";
  return (
    <>
      <CmsHeader crumbs={[{ label: "Tư vấn viên", href: R.H11 }, ...(goc ? [{ label: `${goc.hoTen} · ${goc.ma}`, href: R.H11a(goc.ma) }] : []), { label: goc ? "Sửa thông tin" : "Thêm Tư vấn viên" }]} title={tieuDe} />
      <CmsCard title="Thông tin Tư vấn viên" className="max-w-[1100px]">
        <form onSubmit={(e) => { e.preventDefault(); luu(false); }} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Mã Tư vấn viên (7 chữ số)" error={err.ma} hint={goc ? "Mã không đổi sau khi tạo" : undefined}>
              <Input value={f.ma} onChange={set("ma")} inputMode="numeric" maxLength={7} placeholder="0174120" disabled={!!goc} />
            </Field>
            <Field label="Họ tên (≤ 60 ký tự)" error={err.hoTen} count={`${f.hoTen.length}/60`}>
              <Input value={f.hoTen} onChange={set("hoTen")} maxLength={60} placeholder="Trần Văn Hùng" />
            </Field>
            <Field label="Email đăng nhập" error={err.email} hint={goc ? "Đổi email thì mã đăng nhập mới gửi tới email mới" : "Mã đăng nhập 6 số sẽ gửi tới email này"}>
              <Input type="email" value={f.email} onChange={set("email")} placeholder="vanhung@chubblife.vn" />
            </Field>
            <Field label="Chức danh">
              <Select value={f.chucDanh} onChange={set("chucDanh")}>{CHUC_DANH.map((c) => <option key={c}>{c}</option>)}</Select>
            </Field>
            <Field label="Văn phòng">
              <Select value={f.vanPhong} onChange={set("vanPhong")}>{VAN_PHONG.map((c) => <option key={c}>{c}</option>)}</Select>
            </Field>
            <Field label="Ngày bắt đầu" error={err.ngayBatDau}>
              <Input type="date" value={f.ngayBatDau} onChange={set("ngayBatDau")} />
            </Field>
          </div>
          <CmsFormActions>
            <Button type="submit">Lưu</Button>
            {!goc && <Button kind="secondary" onClick={() => luu(true)}>Lưu & thêm tiếp</Button>}
            <Button kind="ghost" className="ml-auto" onClick={() => router.push(goc ? R.H11a(goc.ma) : R.H11)}>Huỷ</Button>
          </CmsFormActions>
        </form>
      </CmsCard>
      {node}
    </>
  );
}
