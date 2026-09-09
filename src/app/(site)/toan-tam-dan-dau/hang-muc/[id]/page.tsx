"use client";
/**
 * C02 · Thành tích tháng của một Tư vấn viên (chủ dự án 08/09: "thành tích thì nên là tháng đó doanh số bao nhiêu,
 * bao nhiêu khách hàng, bao nhiêu hợp đồng" — không lặp hồ sơ năng lực của danh thiếp).
 * [id] = mã TVV; ?thang=2026-08&hm=mdrt (thiếu thì lấy tháng đã công bố gần nhất có người này).
 * Khối: đầu trang (tên · hạng mục · bảng · thứ hạng) · 3 chỉ số (không so sánh với bảng trước — bảng có thể đột xuất, 09/09) · TVV cùng hạng mục. (Bảng "Các tháng được vinh danh" bỏ 08/09 — chủ dự án: "không thể hiện được nhiều thông tin".)
 */
import { XemNhanhButton } from "@/components/danh-thiep/XemNhanh";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, use } from "react";
import { R } from "@/lib/routes";
import { fmtNum, thangLabel } from "@/lib/seed";
import type { NguoiDat } from "@/lib/types";
import { Avatar, Button, Card, Chip, EmptyState, H1, H2, Muted, useFlash } from "@/components/ui";
import { LoiChucBlock, ShareButtons, TheTVV, fmtTien, useHonor } from "@/components/vinh-danh/honor";


function ChiSo({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-xam rounded-sm px-5 py-4 min-w-[220px]">
      <div className="font-serif font-semibold text-[30px] text-blue leading-none">{value}</div>
      <div className="mt-2 text-[13px] text-den font-bold">{label}</div>
    </div>
  );
}

function ChiTiet({ ma }: { ma: string }) {
  const sp = useSearchParams();
  const { flash, node } = useFlash();
  const { published, hangMucById, congKhai, hangMucCoNguoi } = useHonor();

  // mọi lần người này được vinh danh (tháng đã công bố, đã đồng ý công khai), mới → cũ
  const hits = published.flatMap((m) => hangMucCoNguoi(m).flatMap((h) => congKhai(m, h.id).filter((v) => v.ma === ma).map((v) => ({ m, h, v }))));
  const hit = hits.find((x) => x.m.id === sp.get("thang") && x.h.id === sp.get("hm")) ?? hits.find((x) => x.m.id === sp.get("thang")) ?? hits[0];

  if (!hit) {
    return (
      <div className="wrap py-16">
        <EmptyState title="Không tìm thấy thành tích được công khai" desc="Tư vấn viên này chưa có danh hiệu được công khai trên trang Vinh danh." action={<Button kind="secondary" href={R.C01}>Về Toàn Tâm Dẫn Đầu</Button>} />
      </div>
    );
  }
  const { m, h, v } = hit;
  const hm = hangMucById(h.id)!;
  const nd: NguoiDat = v.nd;
  const soNguoi = congKhai(m, h.id).length;
  const cungHangMuc = congKhai(m, h.id).filter((x) => x.ma !== ma).slice(0, 3);

  return (
    <>
      <section className="bg-xam">
        <div className="wrap pt-6 pb-12">
          <Link href={R.C01} className="text-[13px] font-bold text-blue hover:underline">‹ Toàn Tâm Dẫn Đầu</Link>
          <div className="mt-6 flex flex-wrap items-start gap-6">
            <Avatar name={v.hoTen} size={96} />
            <div className="flex-1 min-w-[280px]">
              <div className="flex flex-wrap items-center gap-2 mb-3"><Chip tone="blue">{hm.ten} · {thangLabel(m)}</Chip><Chip tone={nd.thuHang === 1 ? "pink" : "grey"}>Hạng {nd.thuHang}/{soNguoi}</Chip></div>
              <H1>{v.hoTen}</H1>
              <Muted className="mt-2 text-[15px]">{[v.chucDanh, v.vanPhong.replace(/ — .*$/, "")].filter(Boolean).join(" · ")}</Muted>
              {v.coTaiKhoan && <div className="mt-5 flex flex-wrap gap-3"><XemNhanhButton ma={v.ma} size="md" /></div>}
              {/* Hàng chia sẻ nội tuyến (09/09: thay nút + popup; bỏ "Tạo thiệp chúc mừng") */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="font-bold text-[13px] text-den mr-2">Chia sẻ thành tựu:</span>
                <ShareButtons onDone={flash} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap py-12">
        <H2 className="text-[22px]">Thành tích {thangLabel(m)}</H2>
        <Muted className="mt-1">Số liệu do Chubb Life nạp khi lập bảng vinh danh.</Muted>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <ChiSo label="Doanh số · phí năm đầu" value={fmtTien(nd.doanhSo)} />
          <ChiSo label="Hợp đồng mới" value={nd.hopDong === undefined ? "—" : fmtNum(nd.hopDong)} />
          <ChiSo label="Khách hàng mới" value={nd.khachHang === undefined ? "—" : fmtNum(nd.khachHang)} />
        </div>

        <H2 className="text-[22px] mt-14">Tư vấn viên cùng hạng mục</H2>
        {cungHangMuc.length === 0 ? <div className="mt-6"><EmptyState title="Chưa có Tư vấn viên khác trong hạng mục này" /></div> : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {cungHangMuc.map((x) => <TheTVV key={x.ma} v={x} sub={`${hm.ten} ${m.nam} · ${x.vanPhong}`} thangId={m.id} hangMucId={h.id} />)}
          </div>
        )}
        <LoiChucBlock nguoiNhan={{ ma: v.ma, hoTen: v.hoTen }} thangId={m.id} hangMucId={h.id} onDone={flash} />

        <Card className="mt-10 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="text-[14px] text-ink2">Bảng vinh danh {thangLabel(m)} — {hm.ten}</div>
          <Button kind="secondary" href={R.C04(m.id)}>Xem cả bảng</Button>{/* → C01 với tháng này (C04 gộp vào C01, 09/09) */}
        </Card>
      </div>
      {node}
    </>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={null}><ChiTiet ma={id} /></Suspense>;
}
