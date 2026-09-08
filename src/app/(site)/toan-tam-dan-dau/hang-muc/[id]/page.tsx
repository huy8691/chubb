"use client";
/**
 * C02 · Thành tích tháng của một Tư vấn viên (chủ dự án 08/09: "thành tích thì nên là tháng đó doanh số bao nhiêu,
 * bao nhiêu khách hàng, bao nhiêu hợp đồng" — không lặp hồ sơ năng lực của danh thiếp).
 * [id] = mã TVV; ?thang=2026-08&hm=mdrt (thiếu thì lấy tháng đã công bố gần nhất có người này).
 * Khối: đầu trang (tên · hạng mục · tháng · thứ hạng) · 3 chỉ số tháng kèm so với tháng trước · TVV cùng hạng mục. (Bảng "Các tháng được vinh danh" bỏ 08/09 — chủ dự án: "không thể hiện được nhiều thông tin".)
 */
import { XemNhanhButton } from "@/components/danh-thiep/XemNhanh";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, use, useState } from "react";
import { R } from "@/lib/routes";
import { fmtNum, thangLabel } from "@/lib/seed";
import type { NguoiDat } from "@/lib/types";
import { Avatar, Button, Card, Chip, EmptyState, H1, H2, Muted, useFlash } from "@/components/ui";
import { ShareModal, TheTVV, useHonor } from "@/components/vinh-danh/honor";

/** 2.450.000.000 → "2,45 tỷ ₫"; 850.000.000 → "850 triệu ₫" */
export const fmtTien = (n?: number) => n === undefined ? "—" : n >= 1e9 ? `${(n / 1e9).toFixed(2).replace(".", ",").replace(/,?0+$/, "")} tỷ ₫` : `${Math.round(n / 1e6)} triệu ₫`;
const delta = (cur?: number, prev?: number) => cur === undefined || prev === undefined || prev === 0 ? null : Math.round(((cur - prev) / prev) * 100);

function ChiSo({ label, value, d, prevLabel }: { label: string; value: string; d: number | null; prevLabel: string }) {
  return (
    <div className="bg-xam rounded-sm px-5 py-4 min-w-[220px]">
      <div className="font-serif font-semibold text-[30px] text-blue leading-none">{value}</div>
      <div className="mt-2 text-[13px] text-den font-bold">{label}</div>
      <div className="mt-1 text-[12.5px] text-ink2">{d === null ? "Tháng trước không được vinh danh" : <><span className={d >= 0 ? "text-green-fg font-bold" : "text-red-fg font-bold"}>{d >= 0 ? "+" : ""}{d}%</span> so với {prevLabel}</>}</div>
    </div>
  );
}

function ChiTiet({ ma }: { ma: string }) {
  const sp = useSearchParams();
  const { flash, node } = useFlash();
  const { published, hangMucById, congKhai, hangMucCoNguoi } = useHonor();
  const [share, setShare] = useState(false);

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
  // tháng liền trước (đã công bố) người này có được vinh danh không → so sánh
  const idx = published.findIndex((x) => x.id === m.id);
  const prevM = published[idx + 1];
  const prevNd = prevM ? prevM.hangMuc.flatMap((x) => x.nguoiDat).find((n) => n.advisorMa === ma) : undefined;
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
              {nd.trichDan && <p className="mt-3 text-[15px] text-ink2">{nd.trichDan}</p>}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={() => setShare(true)}>Chia sẻ thành tựu</Button>
                {v.coTaiKhoan && <XemNhanhButton ma={v.ma} size="md" />}
                <Button kind="secondary" href={R.D02}>Tạo thiệp chúc mừng</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap py-12">
        <H2 className="text-[22px]">Thành tích {thangLabel(m)}</H2>
        <Muted className="mt-1">Số liệu do Chubb Life nạp khi lập bảng vinh danh tháng.</Muted>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <ChiSo label="Doanh số · phí năm đầu" value={fmtTien(nd.doanhSo)} d={delta(nd.doanhSo, prevNd?.doanhSo)} prevLabel={prevM ? thangLabel(prevM) : ""} />
          <ChiSo label="Hợp đồng mới" value={nd.hopDong === undefined ? "—" : fmtNum(nd.hopDong)} d={delta(nd.hopDong, prevNd?.hopDong)} prevLabel={prevM ? thangLabel(prevM) : ""} />
          <ChiSo label="Khách hàng mới" value={nd.khachHang === undefined ? "—" : fmtNum(nd.khachHang)} d={delta(nd.khachHang, prevNd?.khachHang)} prevLabel={prevM ? thangLabel(prevM) : ""} />
        </div>

        <H2 className="text-[22px] mt-14">Tư vấn viên cùng hạng mục</H2>
        {cungHangMuc.length === 0 ? <div className="mt-6"><EmptyState title="Chưa có Tư vấn viên khác trong hạng mục này" /></div> : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {cungHangMuc.map((x) => <TheTVV key={x.ma} v={x} sub={`${hm.ten} ${m.nam} · ${x.vanPhong}`} thangId={m.id} hangMucId={h.id} />)}
          </div>
        )}
        <Card className="mt-10 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="text-[14px] text-ink2">Bảng vinh danh {thangLabel(m)} — {hm.ten}</div>
          <Button kind="secondary" href={R.C04(m.id)}>Xem cả tháng</Button>
        </Card>
      </div>
      <ShareModal open={share} onClose={() => setShare(false)} title={`Chia sẻ thành tựu của ${v.hoTen}`} onDone={flash} />
      {node}
    </>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={null}><ChiTiet ma={id} /></Suspense>;
}
