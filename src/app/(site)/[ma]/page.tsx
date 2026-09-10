/** E03 · Danh thiếp — hồ sơ đầy đủ tại /{mã 7 số}. Mã không đúng dạng → 404 chung (S02); mã đúng dạng mà không xem được → E07. */
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DanhThiepDayDu } from "@/components/danh-thiep/DanhThiepDayDu";

export default async function Page({ params }: { params: Promise<{ ma: string }> }) {
  const { ma } = await params;
  if (!/^\d{7}$/.test(ma)) notFound();
  return (
    <Suspense fallback={<div className="wrap py-14 sm:py-24 text-mut">Đang mở danh thiếp…</div>}>
      <DanhThiepDayDu ma={ma} />
    </Suspense>
  );
}
