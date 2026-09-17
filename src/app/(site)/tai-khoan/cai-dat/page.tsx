"use client";
/**
 * G06 · Trang cá nhân › Tài khoản & cài đặt.
 * Khối Tài khoản đăng nhập (họ tên · mã · ảnh đại diện · email · SĐT nội bộ · văn phòng · Lưu thay đổi · Huỷ).
 * (Mục Cài đặt/công tắc và Đăng xuất đã bỏ — khớp wireframe G06; Đăng xuất ở menu nav.)
 */
import Link from "next/link";
import { useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import type { Advisor } from "@/lib/types";
import { Avatar, Button, Field, H2, Input, Muted, Select, useFlash } from "@/components/ui";

const VAN_PHONG = ["TP. Hồ Chí Minh — Q.1", "Hà Nội — Cầu Giấy", "Đà Nẵng — Hải Châu", "Cần Thơ — Ninh Kiều", "Hải Phòng — Lê Chân"];

export default function Page() {
  const { actions } = useStore();
  const tvv = useCurrentAdvisor();
  const { flash, node } = useFlash();
  const [sdt, setSdt] = useState<string | null>(null);
  const [vp, setVp] = useState<string | null>(null);
  if (!tvv) return null;

  const sdtHien = sdt ?? tvv.soDienThoaiNoiBo ?? "";
  const vpHien = vp ?? tvv.vanPhong;
  const coThayDoi = sdtHien !== (tvv.soDienThoaiNoiBo ?? "") || vpHien !== tvv.vanPhong;

  const ghi = (fn: (a: Advisor) => Advisor) => actions.update("advisors", (list) => list.map((a) => (a.ma === tvv.ma ? fn(a) : a)));
  const luuThayDoi = () => {
    ghi((a) => ({ ...a, soDienThoaiNoiBo: sdtHien.trim() || undefined, vanPhong: vpHien }));
    setSdt(null); setVp(null);
    flash("Đã lưu thay đổi tài khoản");
  };
  const huy = () => { setSdt(null); setVp(null); };

  return (
    <div className="space-y-12 max-w-[1100px]">
      {node}

      <section>
        <H2>Tài khoản đăng nhập</H2>
        <Muted className="mt-2">Thông tin hiện trên danh thiếp công khai sửa ở <Link href={R.E04} className="text-blue font-bold hover:underline">Danh thiếp của tôi</Link></Muted>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-x-10 gap-y-5">
          <Field label="Họ và tên · theo hồ sơ Chubb, không sửa được"><Input value={tvv.hoTen} disabled readOnly /></Field>
          <Field label="Mã Tư vấn viên · không sửa được"><Input value={tvv.ma} disabled readOnly /></Field>
          <div className="row-span-2">
            <div className="text-[12.5px] text-ink2 mb-1.5">Ảnh đại diện tài khoản</div>
            <div className="flex items-center gap-4">
              <Avatar name={tvv.hoTen} size={72} />
              <Button kind="secondary" onClick={() => flash("Đã chọn ảnh đại diện mới — hiện sau khi Lưu thay đổi")}>Tải ảnh</Button>
            </div>
          </div>
          <Field label="Email đăng nhập · đổi thì xác thực lại bằng mã" hint="Đổi email: liên hệ Quản trị qua Liên hệ & trợ giúp">
            <Input value={tvv.email} disabled readOnly />
          </Field>
          <Field label="Số điện thoại liên hệ nội bộ">
            <Input value={sdtHien} onChange={(e) => setSdt(e.target.value)} placeholder="0901 234 567" inputMode="tel" />
          </Field>
          <Field label="Khu vực / Văn phòng" className="md:col-span-2">
            <Select value={vpHien} onChange={(e) => setVp(e.target.value)}>
              {(VAN_PHONG.includes(tvv.vanPhong) ? VAN_PHONG : [tvv.vanPhong, ...VAN_PHONG]).map((v) => <option key={v} value={v}>{v}</option>)}
            </Select>
          </Field>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button onClick={luuThayDoi} disabled={!coThayDoi}>Lưu thay đổi</Button>
          <Button kind="secondary" onClick={huy} disabled={!coThayDoi}>Huỷ</Button>
          <Link href={R.S03} className="ml-auto text-[13px] font-bold text-blue hover:underline">Liên hệ & trợ giúp</Link>
        </div>
      </section>
    </div>
  );
}
