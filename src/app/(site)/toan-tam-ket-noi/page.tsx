"use client";
/** E01 · Toàn Tâm Kết Nối (Tab 4 · Danh thiếp) — trang tổng: tìm danh thiếp · danh thiếp mẫu · cách hoạt động · bảng xếp hạng chia sẻ · CTA Tư vấn viên. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Button, Chip, H2, Hero, Input, Muted, Table, MoreLink } from "@/components/ui";
import { R } from "@/lib/routes";
import { fmtNum } from "@/lib/seed";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { QuickView } from "@/components/danh-thiep/QuickView";
import { QrBox } from "@/components/danh-thiep/QrBox";
import { THANG_BXH, danhHieuCongKhai, fmtPhone, isThangChot, laMa7So, linkDanhThiep, tinhThanh, xepHang } from "@/components/danh-thiep/lib";

export default function Page() {
  const router = useRouter();
  const { data } = useStore();
  const tvv = useCurrentAdvisor();
  const [q, setQ] = useState("");
  const [xemNhanh, setXemNhanh] = useState<string>();
  const [moRong, setMoRong] = useState(false);

  const mau = data.advisors.find((a) => a.theCongKhai && a.trangThaiTaiKhoan === "hoat-dong" && a.hoSoNangLuc?.noiBat) ?? data.advisors[0];
  const bxh = xepHang(data, true);
  const top = moRong ? bxh.slice(0, 20) : bxh.slice(0, 5);
  const daChot = isThangChot(data);

  const tim = (e: React.FormEvent) => {
    e.preventDefault();
    const s = q.trim();
    if (!s) return;
    router.push(laMa7So(s) ? R.E03(s) : R.E06(s));
  };

  return (
    <>
      <Hero eyebrow="Toàn Tâm Kết Nối" title="Nắm Chắc Cơ Hội" desc="Toàn Tâm trong từng điểm chạm, chủ động trong từng kết nối. Danh thiếp điện tử giúp Tư vấn viên dễ dàng chia sẻ dấu ấn cá nhân và mở ra cơ hội mới." image="/img/e01-kv.jpg" />

      <div className="wrap py-14 space-y-16">
        {/* Tìm danh thiếp */}
        <section>
          <div className="flex items-end justify-between gap-6"><H2 className="text-[22px]">Tìm danh thiếp Tư vấn viên</H2><MoreLink href={R.E06()}>Xem tất cả Tư vấn viên</MoreLink></div>
          <form onSubmit={tim} className="mt-5 flex gap-3 max-w-[820px]">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nhập mã Tư vấn viên (7 chữ số) hoặc họ tên" aria-label="Tìm danh thiếp Tư vấn viên" className="h-11" />
            <Button type="submit">Tìm</Button>
          </form>
        </section>

        {/* Danh thiếp mẫu */}
        <section>
          <H2 className="text-[22px]">Danh thiếp mẫu</H2>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 items-start">
            <div className="bg-white border border-vien rounded-sm p-6 flex gap-6">
              <Avatar name={mau.hoTen} size={140} src={mau.avatar} />
              <div className="flex-1 min-w-0">
                <div className="font-serif font-semibold text-[18px] text-den uppercase">{mau.hoTen}</div>
                <div className="text-[12.5px] text-ink2 mt-1">{[mau.chucDanh, ...danhHieuCongKhai(mau)].join(" · ")}</div>
                <div className="text-[12.5px] text-den mt-4">{fmtPhone(mau.soDienThoai)}</div>
                <div className="text-[12.5px] text-den mt-1">{mau.email}</div>
                <div className="text-[12.5px] text-den mt-1">VP Chubb Life · {mau.vanPhong}</div>
                <div className="mt-4 flex items-end gap-4">
                  <QrBox value={linkDanhThiep(mau.ma, "qr")} size={72} />
                  <div className="flex flex-col gap-2">
                    <a href={`https://zalo.me/${mau.zalo ?? mau.soDienThoai}`} target="_blank" rel="noopener" className="inline-flex items-center justify-center h-8 px-3 rounded-sm text-[13px] font-bold bg-blue text-white border border-blue hover:bg-blue2">Kết nối Zalo</a>
                    <Button kind="secondary" size="sm" onClick={() => setXemNhanh(mau.ma)}>Xem nhanh</Button>
                    <Button kind="ghost" size="sm" href={R.E03(mau.ma)}>Xem trang đầy đủ</Button>
                  </div>
                </div>
              </div>
            </div>
            <Muted className="text-[13px]">Ví dụ danh thiếp của Tư vấn viên</Muted>
          </div>
        </section>

        {/* Cách hoạt động */}
        <section>
          <H2 className="text-[22px]">Cách hoạt động</H2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {["Quét mã QR hoặc mở liên kết", "Xem thông tin Tư vấn viên", "Kết nối qua Zalo hoặc gọi điện"].map((t, i) => (
              <div key={t} className="bg-white border border-vien rounded-sm p-6">
                <div className="size-9 rounded-full bg-blue text-white font-bold flex items-center justify-center text-[16px]">{i + 1}</div>
                <div className="mt-5 font-bold text-[16px] text-den">{t}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Bảng xếp hạng chia sẻ */}
        <section>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <H2 className="text-[22px]">Danh thiếp được chia sẻ nhiều nhất</H2>
            <div className="flex items-center gap-3 text-[13px] text-ink2">Tháng {THANG_BXH} {daChot ? <Chip tone="green">Đã chốt</Chip> : <Chip tone="amber">Đang tính</Chip>}</div>
          </div>
          <div className="mt-5 bg-white border border-vien rounded-sm p-2">
            <Table head={["#", "Tư vấn viên", "Khu vực", "Số lượt chia sẻ"]}>
              {top.map(({ r, a, hang }) => (
                <tr key={a.ma} className="hover:bg-xam cursor-pointer" onClick={() => setXemNhanh(a.ma)}>
                  <td className="font-bold w-14">{hang}</td>
                  <td><div className="flex items-center gap-3"><Avatar name={a.hoTen} size={36} src={a.avatar} /><span className="font-bold text-den">{a.hoTen}</span></div></td>
                  <td className="text-ink2">{tinhThanh(a.vanPhong)}</td>
                  <td className="font-bold text-right pr-6">{fmtNum(r.luotDuocTinh)}</td>
                </tr>
              ))}
            </Table>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
            <Muted className="text-[12.5px]">1 lượt = 1 lần bấm nút Chia sẻ trên danh thiếp. Đã loại lưu lượng nội bộ và các lượt trùng.</Muted>
            {bxh.length > 5 && <button type="button" onClick={() => setMoRong(!moRong)} className="link-more">{moRong ? "Thu gọn" : "Xem đầy đủ"}</button>}
          </div>
        </section>

        {/* CTA Tư vấn viên */}
        <section className="bg-xam rounded-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <H2 className="text-[22px]">Bạn là Tư vấn viên Chubb Life?</H2>
            <p className="text-[15px] text-ink2 mt-2">Tạo danh thiếp điện tử của bạn, tải mã QR để in lên thẻ giấy, theo dõi lượt xem.</p>
          </div>
          <Button href={tvv ? R.E04 : `${R.G01}?next=${encodeURIComponent(R.E04)}`}>Tạo / sửa danh thiếp của tôi</Button>
        </section>
        <p className="text-[13px] text-ink2 -mt-8">Không tìm thấy Tư vấn viên? <Link href={R.S03} className="text-blue font-bold hover:underline">Liên hệ & trợ giúp</Link></p>
      </div>

      <QuickView ma={xemNhanh} onClose={() => setXemNhanh(undefined)} />
    </>
  );
}
