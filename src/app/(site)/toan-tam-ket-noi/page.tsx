"use client";
/** E01 · Toàn Tâm Kết Nối (Tab 4 · Danh thiếp) — trang tổng (09/09): Tìm Tư vấn viên gần bạn (bản đồ) · Danh bạ Tư vấn viên (tìm + lọc + danh sách) · bảng xếp hạng chia sẻ · CTA Tư vấn viên. Bỏ "Danh thiếp mẫu" và "Cách hoạt động" (dư khi đã có danh bạ). */
import Link from "next/link";
import { useState } from "react";
import { Avatar, Button, Chip, H2, Hero, Muted, Table } from "@/components/ui";
import { R } from "@/lib/routes";
import { fmtNum } from "@/lib/seed";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { QuickView } from "@/components/danh-thiep/QuickView";
import { DanhBa } from "@/components/danh-thiep/DanhBa";
import { GanBan } from "@/components/danh-thiep/GanBan";
import { THANG_BXH, isThangChot, tinhThanh, xepHang } from "@/components/danh-thiep/lib";

export default function Page() {
  const { data } = useStore();
  const tvv = useCurrentAdvisor();
  const [xemNhanh, setXemNhanh] = useState<string>();
  const [moRong, setMoRong] = useState(false);
  const [vanPhongLoc, setVanPhongLoc] = useState<string[] | null>(null);

  const bxh = xepHang(data, true);
  const top = moRong ? bxh.slice(0, 20) : bxh.slice(0, 5);
  const daChot = isThangChot(data);

  return (
    <>
      <Hero eyebrow="Toàn Tâm Kết Nối" title="Nắm Chắc Cơ Hội" desc="Toàn Tâm trong từng điểm chạm, chủ động trong từng kết nối. Danh thiếp điện tử giúp Tư vấn viên dễ dàng chia sẻ dấu ấn cá nhân và mở ra cơ hội mới." image="/img/e01-kv.jpg" />

      <div className="wrap py-14 space-y-16">
        <GanBan onLocVanPhong={(l) => { setVanPhongLoc(l); if (l) document.getElementById("danh-ba")?.scrollIntoView({ behavior: "smooth" }); }} />
        <DanhBa vanPhongLoc={vanPhongLoc} />

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
