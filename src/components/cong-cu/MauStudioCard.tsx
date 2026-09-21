"use client";
/** Thẻ Mẫu Studio dùng chung: D08 (danh sách) và D01 (khối "Mẫu Studio mới"). Chip MẪU · tên · cập nhật · Dùng mẫu này (login-aware).
 * Thumbnail = xem trước mẫu ĐÃ ĐIỀN tên giả lập (StudioPreview) để khách hình dung kết quả — không phải banner trống. Không ghi tỉ lệ/phiên bản. */
import { R } from "@/lib/routes";
import { fmtDate } from "@/lib/seed";
import type { StudioTemplate } from "@/lib/types";
import { useStore } from "@/lib/store";
import { StudioPreview } from "./StudioPreview";
import { Button, Card } from "@/components/ui";

/** `onDung`: khi đang ở D02, chọn mẫu tại chỗ (cuộn lên xem trước) thay vì điều hướng — giữ cùng một kiểu thẻ ở mọi màn. */
export function MauStudioCard({ m, onDung }: { m: StudioTemplate; onDung?: (id: string) => void }) {
  const { session } = useStore();
  const href = session.role === "tvv" ? `${R.D02}?mau=${m.id}` : `${R.G01}?next=${encodeURIComponent(`${R.D02}?mau=${m.id}`)}`;
  return (
    <Card className="p-3 flex flex-col h-full">
      <div className="relative overflow-hidden rounded-sm border border-[#D6D6D6]">
        <StudioPreview template={m} hoTen="Trần Bảo Ngọc" chucDanh="Tư vấn tài chính" soDienThoai="0900 000 000" />
        <span className="absolute top-2 left-2 bg-blue text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-sm">Mẫu</span>
      </div>
      <div className="mt-3 text-[13px] font-bold text-den truncate">{m.ten}</div>
      <div className="text-[12px] text-mut mt-0.5">Cập nhật {fmtDate(m.capNhat)}</div>
      {onDung
        ? <Button size="sm" kind="secondary" className="mt-auto w-full" onClick={() => onDung(m.id)}>Dùng mẫu này</Button>
        : <Button size="sm" kind="secondary" className="mt-auto w-full" href={href}>Dùng mẫu này</Button>}
    </Card>
  );
}
