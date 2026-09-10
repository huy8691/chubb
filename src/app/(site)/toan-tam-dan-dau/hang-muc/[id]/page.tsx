"use client";
/**
 * C02 · Chi tiết thành tích TVV (chủ dự án 08/09: "thành tích thì nên là tháng đó doanh số bao nhiêu,
 * bao nhiêu khách hàng, bao nhiêu hợp đồng" — không lặp hồ sơ năng lực của danh thiếp).
 * [id] = mã TVV; ?thang=2026-08&hm=mdrt (thiếu thì lấy tháng đã công bố gần nhất có người này).
 * Bố cục bám Figma C02 (10/09): masthead một thẻ trắng — ảnh chân dung lớn bên trái + hạng mục · tên · dòng thông tin ·
 * 3 chỉ số · Xem danh thiếp điện tử · Chia sẻ; rồi "Tư vấn viên cùng hạng mục" (Xem danh thiếp → E03) · Lời chúc.
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, use } from "react";
import { R } from "@/lib/routes";
import { fmtNum, thangLabel } from "@/lib/seed";
import type { NguoiDat } from "@/lib/types";
import { Button, Card, Chip, EmptyState, H1, H2, ImageBox, useFlash } from "@/components/ui";
import { XemNhanhButton } from "@/components/danh-thiep/XemNhanh";
import { LoiChucBlock, ShareButtons, TheTVV, anhTVV, fmtTien, useHonor } from "@/components/vinh-danh/honor";


function ChiSo({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-xam rounded-sm px-4 py-3 sm:px-5 sm:py-4">
      <div className="font-serif font-semibold text-[30px] text-blue leading-none">{value}</div>
      <div className="mt-2 text-[13px] text-den font-bold">{label}</div>
    </div>
  );
}

function ChiTiet({ ma }: { ma: string }) {
  const sp = useSearchParams();
  const { flash, node } = useFlash();
  const { published, hangMucById, congKhai, hangMucCoNguoi } = useHonor();

  // mọi lần người này được vinh danh (bảng đã công bố), mới → cũ
  const hits = published.flatMap((m) => hangMucCoNguoi(m).flatMap((h) => congKhai(m, h.id).filter((v) => v.ma === ma).map((v) => ({ m, h, v }))));
  const hit = hits.find((x) => x.m.id === sp.get("thang") && x.h.id === sp.get("hm")) ?? hits.find((x) => x.m.id === sp.get("thang")) ?? hits[0];

  if (!hit) {
    return (
      <div className="wrap py-10 sm:py-16">
        <EmptyState title="Không tìm thấy thành tích được công khai" desc="Tư vấn viên này chưa có danh hiệu được công khai trên trang Vinh danh." action={<Button kind="secondary" href={R.C01}>Về Toàn Tâm Dẫn Đầu</Button>} />
      </div>
    );
  }
  const { m, h, v } = hit;
  const hm = hangMucById(h.id)!;
  const nd: NguoiDat = v.nd;
  const soNguoi = congKhai(m, h.id).length;
  const cungHangMuc = congKhai(m, h.id).filter((x) => x.ma !== ma).slice(0, 3);
  const dongThongTin = [v.chucDanh, v.vanPhong.replace(/ — .*$/, ""), `Hạng ${nd.thuHang}/${soNguoi} trong hạng mục ${hm.ten}`, thangLabel(m)].filter(Boolean).join(" · ");

  return (
    <>
      <section className="bg-xam">
        <div className="wrap pt-6 pb-10">
          <Link href={R.C01} className="text-[13px] font-bold text-blue hover:underline">‹ Toàn Tâm Dẫn Đầu</Link>
          {/* Masthead một thẻ: ảnh chân dung lớn + thông tin + 3 chỉ số (Figma C02) */}
          <Card className="mt-6 overflow-hidden flex flex-col lg:flex-row">
            <div className="lg:w-[360px] shrink-0 bg-vien2">
              <ImageBox src={anhTVV(v.ma)} alt={`Ảnh chân dung ${v.hoTen}`} ratio="4/5" className="h-full border-0 rounded-none" />
            </div>
            <div className="flex-1 p-5 sm:p-8">
              <Chip tone="blue">{hm.ten} {m.nam}</Chip>
              <H1 className="mt-3 text-[36px]">{v.hoTen}</H1>
              <p className="mt-3 text-[15px] text-ink2">{dongThongTin}</p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ChiSo label="Doanh số · phí năm đầu" value={fmtTien(nd.doanhSo)} />
                <ChiSo label="Hợp đồng mới" value={nd.hopDong === undefined ? "—" : fmtNum(nd.hopDong)} />
                <ChiSo label="Khách hàng mới" value={nd.khachHang === undefined ? "—" : fmtNum(nd.khachHang)} />
              </div>
              {v.coTaiKhoan && <div className="mt-5 -ml-3"><XemNhanhButton ma={v.ma} label="Xem danh thiếp điện tử" kind="ghost" size="md" /></div>}
              {/* Hàng chia sẻ nội tuyến (09/09: thay nút + popup; bỏ "Tạo thiệp chúc mừng") */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="font-bold text-[13px] text-den mr-2">Chia sẻ thành tựu:</span>
                <ShareButtons onDone={flash} />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <div className="wrap py-12">
        <H2 className="text-[22px]">Tư vấn viên cùng hạng mục</H2>
        {cungHangMuc.length === 0 ? <div className="mt-6"><EmptyState title="Chưa có Tư vấn viên khác trong hạng mục này" /></div> : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {cungHangMuc.map((x) => <TheTVV key={x.ma} v={x} sub={`${hm.ten} ${m.nam} · ${x.vanPhong}`} thangId={m.id} hangMucId={h.id} danhThiep />)}
          </div>
        )}
        <LoiChucBlock nguoiNhan={{ ma: v.ma, hoTen: v.hoTen }} thangId={m.id} hangMucId={h.id} onDone={flash} />
      </div>
      {node}
    </>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={null}><ChiTiet ma={id} /></Suspense>;
}
