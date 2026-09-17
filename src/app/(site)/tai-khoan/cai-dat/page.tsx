"use client";
/**
 * G06 · Trang cá nhân › Tài khoản & cài đặt.
 * Khối Tài khoản đăng nhập (họ tên · mã · ảnh đại diện · email · SĐT nội bộ · văn phòng · Lưu thay đổi · Huỷ)
 * · Cài đặt: 4 công tắc ghi thẳng vào store.advisors.
 * (Đăng xuất nằm ở menu tài khoản trên nav — khớp wireframe G06.)
 */
import Link from "next/link";
import { useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import type { Advisor } from "@/lib/types";
import { Avatar, Button, Card, Field, H2, Input, Muted, Select, Toggle, useFlash } from "@/components/ui";

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

  const datCongTac = (key: "theCongKhai" | "hienTrenBXH" | "nhanThongBaoEmail" | "nhanBanTin", v: boolean) => {
    ghi((a) => key === "theCongKhai" ? { ...a, theCongKhai: v, theAnBoi: v ? undefined : "tvv" } : { ...a, [key]: v });
    const nhan: Record<typeof key, [string, string]> = {
      theCongKhai: ["Danh thiếp đang hiện trên trang công khai", "Danh thiếp đã tạm ẩn — khách quét QR sẽ thấy trang “đã tạm ẩn”"],
      hienTrenBXH: ["Bạn sẽ hiện trên bảng xếp hạng chia sẻ danh thiếp", "Bạn đã ẩn khỏi bảng xếp hạng chia sẻ danh thiếp"],
      nhanThongBaoEmail: ["Đã bật nhận thông báo qua email", "Đã tắt nhận thông báo qua email"],
      nhanBanTin: ["Đã đăng ký bản tin nội bộ hàng tháng", "Đã huỷ bản tin nội bộ hàng tháng"],
    };
    flash(v ? nhan[key][0] : nhan[key][1]);
  };

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

      <section>
        <H2>Cài đặt</H2>
        <Card className="mt-6 px-6">
          <Toggle checked={tvv.theCongKhai} onChange={(v) => datCongTac("theCongKhai", v)} label="Hiện danh thiếp của tôi trên trang công khai" />
          <Toggle checked={tvv.hienTrenBXH} onChange={(v) => datCongTac("hienTrenBXH", v)} label="Hiện tôi trên bảng xếp hạng chia sẻ danh thiếp" />
          <Toggle checked={tvv.nhanThongBaoEmail} onChange={(v) => datCongTac("nhanThongBaoEmail", v)} label="Nhận thông báo qua email (ảnh Studio được duyệt · tháng vinh danh mới · bài viết mới)" />
          <Toggle checked={tvv.nhanBanTin ?? false} onChange={(v) => datCongTac("nhanBanTin", v)} label="Nhận bản tin nội bộ hàng tháng" />
        </Card>
      </section>
    </div>
  );
}
