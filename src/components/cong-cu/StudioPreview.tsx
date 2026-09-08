"use client";
/**
 * Khung xem trước ảnh Studio (D02 bước xem trước · H02a cột phải).
 * Ghép đơn giản bằng CSS overlay: ảnh nền mẫu + khung chân dung + họ tên/chức danh/SĐT + dòng disclaimer + logo.
 * Không phải chất lượng in — ngoài phạm vi demo.
 */
import type { StudioTemplate } from "@/lib/types";
import { cx } from "@/components/ui";

export function tiLeToRatio(tiLe: StudioTemplate["tiLe"]) {
  return tiLe === "1:1" ? "1/1" : tiLe === "4:5" ? "4/5" : tiLe === "9:16" ? "9/16" : "3/4";
}
export function tiLeLabel(tiLe: StudioTemplate["tiLe"]) {
  return tiLe === "1:1" ? "Vuông 1:1" : tiLe === "4:5" ? "Dọc 4:5" : tiLe === "9:16" ? "Dọc 9:16" : "Dọc 3:4";
}

export function StudioPreview({ template, portrait, zoom = 1, hoTen, chucDanh, soDienThoai, className }: {
  template?: Pick<StudioTemplate, "anh" | "tiLe" | "mauNen" | "khungAnh" | "tiLeKhung" | "disclaimer">;
  portrait?: string; zoom?: number; hoTen?: string; chucDanh?: string; soDienThoai?: string; className?: string;
}) {
  const ratio = tiLeToRatio(template?.tiLe ?? "3:4");
  const khung = template?.tiLeKhung ?? 40;
  return (
    <div className={cx("relative w-full overflow-hidden rounded-sm text-white select-none", className)} style={{ aspectRatio: ratio, background: template?.mauNen ?? "#000ECC" }} aria-label="Xem trước ảnh Studio">
      
      <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-bold tracking-[0.2em] bg-white/90 text-blue px-2 py-1 rounded-sm">CHUBB <span className="text-[8px]">®</span></div>
      <div className="absolute left-1/2 -translate-x-1/2 top-[14%] overflow-hidden bg-white/20 border-2 border-white/80 flex items-center justify-center" style={{ width: `${khung}%`, aspectRatio: "1/1", borderRadius: template?.khungAnh === "vuong" ? 4 : "50%" }}>
        {portrait ? <img src={portrait} alt="" className="w-full h-full object-cover" style={{ transform: `scale(${zoom})` }} /> : <span className="text-[11px] text-white/80">Ảnh chân dung</span>}
      </div>
      <div className="absolute left-0 right-0 bottom-[12%] text-center px-4">
        <div className="font-serif font-semibold text-[clamp(14px,5cqw,24px)] uppercase leading-tight break-words">{hoTen || "HỌ TÊN TƯ VẤN VIÊN"}</div>
        <div className="text-[13px] mt-1 opacity-90">{chucDanh || "Chức danh"}</div>
        <div className="text-[13px] font-bold mt-0.5">{soDienThoai || "0903 xxx xxx"}</div>
      </div>
      <div className="absolute left-0 right-0 bottom-2 text-center text-[9px] px-3 opacity-80 leading-tight">{template?.disclaimer ?? "Sản phẩm bảo hiểm do Chubb Life Việt Nam cung cấp. Thông tin mang tính tham khảo."}</div>
    </div>
  );
}
