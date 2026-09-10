"use client";
/**
 * Khung xem trước ảnh Studio (D02 bước xem trước · H02a cột phải).
 * Ghép đơn giản bằng CSS overlay: ảnh nền mẫu + khung chân dung + họ tên/chức danh/SĐT + dòng disclaimer + logo.
 * Không phải chất lượng in — ngoài phạm vi demo.
 */
import { useRef } from "react";
import type { StudioTemplate } from "@/lib/types";
import { cx } from "@/components/ui";

export function tiLeToRatio(tiLe: StudioTemplate["tiLe"]) {
  return tiLe === "1:1" ? "1/1" : tiLe === "4:5" ? "4/5" : tiLe === "9:16" ? "9/16" : "3/4";
}
export function tiLeLabel(tiLe: StudioTemplate["tiLe"]) {
  return tiLe === "1:1" ? "Vuông 1:1" : tiLe === "4:5" ? "Dọc 4:5" : tiLe === "9:16" ? "Dọc 9:16" : "Dọc 3:4";
}

/** Hoạ tiết thương hiệu phủ lên nền màu (CSS thuần, không cần ảnh) — cho khách hình dung mẫu có thiết kế thật */
function hoaTietCss(h: number): string {
  switch (h) {
    case 1: // Chấm tròn lễ hội (confetti)
      return "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18) 0 2px, transparent 3px) 0 0/26px 26px, radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0 2px, transparent 3px) 13px 13px/26px 26px";
    case 2: // Sọc chéo mảnh
      return "repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0 2px, transparent 2px 16px)";
    case 3: // Gợn sóng vòng cung ở đáy
      return "radial-gradient(130% 55% at 50% 118%, rgba(255,255,255,0.22), rgba(255,255,255,0.05) 45%, transparent 62%)";
    default: // 4: Lưới ô + vệt sáng góc
      return "linear-gradient(135deg, rgba(255,255,255,0.14), transparent 42%), linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px) 0 0/28px 28px, linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px) 0 0/28px 28px";
  }
}

export function StudioPreview({ template, portrait, zoom = 1, offsetX = 0, offsetY = 0, onOffsetChange, hoTen, chucDanh, soDienThoai, className }: {
  template?: Pick<StudioTemplate, "anh" | "tiLe" | "mauNen" | "khungAnh" | "tiLeKhung" | "disclaimer" | "hoaTiet" | "nhan" | "mauNhan" | "boCuc">;
  portrait?: string; zoom?: number; offsetX?: number; offsetY?: number; onOffsetChange?: (x: number, y: number) => void;
  hoTen?: string; chucDanh?: string; soDienThoai?: string; className?: string;
}) {
  const ratio = tiLeToRatio(template?.tiLe ?? "3:4");
  const khung = template?.tiLeKhung ?? 40;
  const accent = template?.mauNhan ?? "#FFA300";
  const nhan = template?.nhan;
  const band = template?.boCuc === "dai-duoi";
  const vien = template?.boCuc === "vien";
  // Chỉ kéo được khi đã phóng to (có phần dư để dời); giới hạn để ảnh không tách khỏi khung
  const lim = Math.max(0, (zoom - 1) * 50);
  const clamp = (v: number) => Math.max(-lim, Math.min(lim, v));
  const ax = clamp(offsetX), ay = clamp(offsetY);
  const canDrag = !!onOffsetChange && !!portrait && lim > 0;
  const drag = useRef<{ x: number; y: number; ox: number; oy: number; w: number; h: number } | null>(null);
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canDrag) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    drag.current = { x: e.clientX, y: e.clientY, ox: ax, oy: ay, w: e.currentTarget.clientWidth, h: e.currentTarget.clientHeight };
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current; if (!d || !onOffsetChange) return;
    onOffsetChange(clamp(d.ox + ((e.clientX - d.x) / d.w) * 100), clamp(d.oy + ((e.clientY - d.y) / d.h) * 100));
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => { if (drag.current) { try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {} drag.current = null; } };
  return (
    <div className={cx("relative w-full overflow-hidden rounded-sm text-white select-none", className)} style={{ aspectRatio: ratio, background: template?.mauNen ?? "#000ECC" }} aria-label="Xem trước ảnh Studio">

      {template?.hoaTiet ? (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{ background: hoaTietCss(template.hoaTiet) }} />
          <div className="absolute inset-x-0 bottom-0 h-[46%] pointer-events-none" style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.32))" }} />
        </>
      ) : null}
      {/* Viền trang trí + góc (boCuc="vien") */}
      {vien && (
        <div className="absolute pointer-events-none" style={{ inset: "4.5%", border: `2px solid ${accent}` , borderRadius: 6, opacity: 0.9 }}>
          {["-top-[3px] -left-[3px] border-t-[3px] border-l-[3px]", "-top-[3px] -right-[3px] border-t-[3px] border-r-[3px]", "-bottom-[3px] -left-[3px] border-b-[3px] border-l-[3px]", "-bottom-[3px] -right-[3px] border-b-[3px] border-r-[3px]"].map((c, i) => (
            <span key={i} className={cx("absolute size-4", c)} style={{ borderColor: accent }} />
          ))}
        </div>
      )}
      {/* Dải nền dưới (boCuc="dai-duoi") */}
      {band && <div className="absolute inset-x-[6%] bottom-[5%] top-[62%] rounded-lg pointer-events-none" style={{ background: "rgba(0,0,0,0.42)", borderTop: `3px solid ${accent}` }} />}

      <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-bold tracking-[0.2em] bg-white/90 text-blue px-2 py-1 rounded-sm z-10">CHUBB <span className="text-[8px]">®</span></div>
      {/* Ruy-băng nhãn (nhan) */}
      {nhan && <div className="absolute top-[6%] left-1/2 -translate-x-1/2 z-10 text-[clamp(9px,3cqw,13px)] font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-sm whitespace-nowrap" style={{ background: accent, color: "#1a1a1a" }}>{nhan}</div>}
      <div className={cx("absolute left-1/2 -translate-x-1/2 overflow-hidden bg-white/20 flex items-center justify-center", nhan ? "top-[17%]" : "top-[14%]", canDrag && "cursor-move touch-none")} style={{ width: `${khung}%`, aspectRatio: "1/1", borderRadius: template?.khungAnh === "vuong" ? 4 : "50%", border: `3px solid ${template?.mauNhan ?? "rgba(255,255,255,0.85)"}` }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        {portrait ? <img src={portrait} alt="" draggable={false} className="w-full h-full object-cover" style={{ transform: `translate(${ax}%, ${ay}%) scale(${zoom})` }} /> : <span className="text-[11px] text-white/80">Ảnh chân dung</span>}
      </div>
      <div className="absolute left-0 right-0 bottom-[12%] text-center px-5 z-10">
        <div className="font-serif font-semibold text-[clamp(14px,5cqw,24px)] uppercase leading-tight break-words">{hoTen || "HỌ TÊN TƯ VẤN VIÊN"}</div>
        <div className="mx-auto my-1.5 h-[2px] w-10 rounded-full" style={{ background: accent }} />
        <div className="text-[13px] opacity-90">{chucDanh || "Chức danh"}</div>
        <div className="text-[13px] font-bold mt-0.5">{soDienThoai || "0903 xxx xxx"}</div>
      </div>
      <div className="absolute left-0 right-0 bottom-2 text-center text-[9px] px-3 opacity-80 leading-tight z-10">{template?.disclaimer ?? "Sản phẩm bảo hiểm do Chubb Life Việt Nam cung cấp. Thông tin mang tính tham khảo."}</div>
    </div>
  );
}

/* ---------- Tải ảnh Studio thật (ghép preview ra canvas → PNG) ---------- */
const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
function rRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function wrapText(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, maxW: number, lh: number) {
  const words = text.split(" "); let line = ""; let yy = y;
  for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, cx, yy); line = w; yy += lh; } else line = t; }
  if (line) ctx.fillText(line, cx, yy);
}

export async function taiAnhStudio(opts: {
  template?: Pick<StudioTemplate, "tiLe" | "mauNen" | "khungAnh" | "tiLeKhung" | "disclaimer" | "hoaTiet" | "nhan" | "mauNhan" | "boCuc">;
  portrait?: string; zoom?: number; offsetX?: number; offsetY?: number; hoTen?: string; chucDanh?: string; soDienThoai?: string;
}) {
  const { template, portrait, zoom = 1, offsetX = 0, offsetY = 0, hoTen, chucDanh, soDienThoai } = opts;
  const accent = template?.mauNhan ?? "#FFA300", nhan = template?.nhan, band = template?.boCuc === "dai-duoi", vien = template?.boCuc === "vien";
  const tiLe = template?.tiLe ?? "3:4";
  const [rw, rh] = tiLe === "1:1" ? [1, 1] : tiLe === "4:5" ? [4, 5] : tiLe === "9:16" ? [9, 16] : [3, 4];
  const W = 1080, H = Math.round((W * rh) / rw);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d"); if (!ctx) return;
  ctx.fillStyle = template?.mauNen ?? "#000ECC"; ctx.fillRect(0, 0, W, H);
  const h = template?.hoaTiet;
  if (h === 1) { const g = W * 0.058; ctx.fillStyle = "rgba(255,255,255,0.16)"; for (let y = g / 2; y < H; y += g) for (let x = g / 2; x < W; x += g) { ctx.beginPath(); ctx.arc(x, y, W * 0.006, 0, 7); ctx.fill(); } }
  else if (h === 2) { ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = W * 0.012; for (let i = -H; i < W + H; i += W * 0.05) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke(); } }
  else if (h === 3) { const rg = ctx.createRadialGradient(W / 2, H * 1.05, 0, W / 2, H * 1.05, H * 0.7); rg.addColorStop(0, "rgba(255,255,255,0.22)"); rg.addColorStop(0.5, "rgba(255,255,255,0.05)"); rg.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); }
  else if (h === 4) { ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1; const g = W * 0.06; for (let x = 0; x < W; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } const cg = ctx.createLinearGradient(0, 0, W * 0.5, H * 0.4); cg.addColorStop(0, "rgba(255,255,255,0.14)"); cg.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H); }
  const sc = ctx.createLinearGradient(0, H * 0.54, 0, H); sc.addColorStop(0, "rgba(0,0,0,0)"); sc.addColorStop(1, "rgba(0,0,0,0.32)"); ctx.fillStyle = sc; ctx.fillRect(0, H * 0.54, W, H * 0.46);
  // dải nền dưới (boCuc="dai-duoi")
  if (band) { ctx.fillStyle = "rgba(0,0,0,0.42)"; rRect(ctx, W * 0.06, H * 0.62, W * 0.88, H * 0.33, 16); ctx.fill(); ctx.fillStyle = accent; ctx.fillRect(W * 0.07, H * 0.62, W * 0.86, W * 0.004); }
  // khung chân dung (đẩy xuống nếu có ruy-băng)
  const frameD = ((template?.tiLeKhung ?? 40) / 100) * W, cx = W / 2, cyc = (nhan ? 0.17 : 0.14) * H + frameD / 2, r = frameD / 2, vuong = template?.khungAnh === "vuong";
  ctx.save(); if (vuong) rRect(ctx, cx - r, cyc - r, frameD, frameD, 10); else { ctx.beginPath(); ctx.arc(cx, cyc, r, 0, Math.PI * 2); }
  ctx.fillStyle = "rgba(255,255,255,0.20)"; ctx.fill(); ctx.clip();
  if (portrait) { try { const img = await loadImg(portrait); const s = Math.max(frameD / img.width, frameD / img.height) * zoom; const dw = img.width * s, dh = img.height * s; ctx.drawImage(img, cx - dw / 2 + (offsetX / 100) * frameD, cyc - dh / 2 + (offsetY / 100) * frameD, dw, dh); } catch {} }
  ctx.restore();
  ctx.strokeStyle = template?.mauNhan ?? "rgba(255,255,255,0.85)"; ctx.lineWidth = W * 0.008; if (vuong) rRect(ctx, cx - r, cyc - r, frameD, frameD, 10); else { ctx.beginPath(); ctx.arc(cx, cyc, r, 0, Math.PI * 2); } ctx.stroke();
  // viền + góc trang trí (boCuc="vien")
  if (vien) { const m = W * 0.045; ctx.strokeStyle = accent; ctx.lineWidth = W * 0.004; rRect(ctx, m, m, W - 2 * m, H - 2 * m, 8); ctx.stroke(); const s = W * 0.03; ctx.lineWidth = W * 0.009; ([[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]] as const).forEach(([x, y, dx, dy]) => { ctx.beginPath(); ctx.moveTo(x, y + dy * s); ctx.lineTo(x, y); ctx.lineTo(x + dx * s, y); ctx.stroke(); }); }
  // logo
  ctx.fillStyle = "rgba(255,255,255,0.92)"; rRect(ctx, W * 0.033, H * 0.028, W * 0.22, H * 0.042, 6); ctx.fill();
  ctx.fillStyle = "#000ECC"; ctx.font = `bold ${W * 0.022}px Arial`; ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.fillText("CHUBB ®", W * 0.055, H * 0.028 + H * 0.021);
  // ruy-băng nhãn (nhan)
  if (nhan) { const t = nhan.toUpperCase(); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `bold ${W * 0.026}px Arial`; const pw = ctx.measureText(t).width + W * 0.06, ph = H * 0.05, px = W / 2 - pw / 2, py = H * 0.045; ctx.fillStyle = accent; rRect(ctx, px, py, pw, ph, ph / 2); ctx.fill(); ctx.fillStyle = "#1a1a1a"; ctx.fillText(t, W / 2, py + ph / 2); }
  // chữ
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff"; ctx.font = `600 ${W * 0.058}px Georgia, "Times New Roman", serif`; ctx.fillText((hoTen || "HỌ TÊN TƯ VẤN VIÊN").toUpperCase(), cx, H * 0.82);
  ctx.fillStyle = accent; ctx.fillRect(cx - W * 0.05, H * 0.842, W * 0.10, W * 0.005);
  ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = `${W * 0.032}px Arial`; ctx.fillText(chucDanh || "Chức danh", cx, H * 0.872);
  ctx.fillStyle = "#fff"; ctx.font = `bold ${W * 0.034}px Arial`; ctx.fillText(soDienThoai || "0903 xxx xxx", cx, H * 0.90);
  ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.font = `${W * 0.018}px Arial`; wrapText(ctx, template?.disclaimer ?? "Sản phẩm bảo hiểm do Chubb Life Việt Nam cung cấp. Thông tin mang tính tham khảo.", cx, H * 0.955, W * 0.88, W * 0.024);
  const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = `anh-studio-${Date.now()}.png`; document.body.appendChild(a); a.click(); a.remove();
}
