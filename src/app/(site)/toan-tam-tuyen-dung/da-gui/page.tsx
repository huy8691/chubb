"use client";
/** B02 · Ứng tuyển — gửi thành công (?ma=). Hiện mã hồ sơ, hai nút: Đọc câu chuyện nghề (B01) · Về trang chủ (A01). */
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { Button, H1, Muted } from "@/components/ui";

function DaGui() {
  const sp = useSearchParams();
  const { data } = useStore();
  const ma = sp.get("ma") ?? "";
  const hs = data.candidates.find((c) => c.id === ma);
  return (
    <div className="wrap py-10 sm:py-16 max-w-[800px] mx-auto text-center">
      <div className="mx-auto size-16 rounded-full bg-green-bg text-green-fg flex items-center justify-center text-[28px]" aria-hidden>✓</div>
      <H1 className="mt-6 text-[34px]">Đã nhận thông tin của bạn</H1>
      <Muted className="mt-3 text-[17px]">Đội ngũ Tuyển dụng Chubb Life sẽ gọi lại trong 2 ngày làm việc.</Muted>

      <div className="mt-10 inline-block bg-blue-soft rounded-sm px-4 py-3 text-[13.5px] font-bold text-den">
        {hs ? <>Mã hồ sơ #{hs.id}</> : ma ? <>Mã hồ sơ #{ma}</> : <>Hệ thống đã ghi nhận thông tin của bạn</>}
      </div>

      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Button kind="secondary" href={`${R.B01}#cau-chuyen`}>Đọc câu chuyện nghề</Button>
        <Button kind="secondary" href={R.A01}>Về trang chủ</Button>
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><DaGui /></Suspense>;
}
