"use client";
/** B02 · Ứng tuyển — gửi thành công (?ma=). Hiện mã hồ sơ, 3 bước tiếp theo, hai nút: Đọc câu chuyện nghề (B01) · Về trang chủ (A01). */
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { Button, Card, H1, Muted } from "@/components/ui";

const BUOC = ["Phỏng vấn tìm hiểu", "Khoá đào tạo nhập môn", "Thi chứng chỉ đại lý"];

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

      <Card className="mt-10 p-5 sm:p-8 text-left">
        <div className="font-serif font-semibold text-[18px] text-den text-center">3 bước tiếp theo</div>
        <ol className="mt-6 space-y-4 max-w-[420px] mx-auto">
          {BUOC.map((b, i) => (
            <li key={b} className="flex items-center gap-4">
              <span className="size-9 rounded-full bg-blue text-white font-bold text-[15px] flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="font-bold text-[16px] text-den">{b}</span>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-8 bg-blue-soft rounded-sm px-4 py-3 text-[13.5px] font-bold text-den">
        {hs ? <>Mã hồ sơ #{hs.id} · Email xác nhận đã gửi tới {hs.email}</> : ma ? <>Mã hồ sơ #{ma} · Email xác nhận đã gửi</> : <>Email xác nhận đã gửi tới địa chỉ bạn đăng ký</>}
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
