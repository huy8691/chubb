"use client";
/**
 * Khung xem trước ảnh Studio (D02 bước xem trước · H02a cột phải).
 * Ghép đơn giản bằng CSS overlay: ảnh nền mẫu + khung chân dung + họ tên/chức danh/SĐT + dòng disclaimer + logo.
 * Không phải chất lượng in — ngoài phạm vi demo.
 */
import { useEffect, useRef, useState } from "react";
import type { StudioField, StudioTemplate } from "@/lib/types";
import { cx } from "@/components/ui";

export function tiLeToRatio(tiLe: StudioTemplate["tiLe"]) {
  return tiLe === "1:1" ? "1/1" : tiLe === "4:5" ? "4/5" : tiLe === "9:16" ? "9/16" : tiLe === "16:9" ? "16/9" : "3/4";
}
/** [w,h] số cho canvas */
function tiLeWH(tiLe: StudioTemplate["tiLe"]): [number, number] {
  return tiLe === "1:1" ? [1, 1] : tiLe === "4:5" ? [4, 5] : tiLe === "9:16" ? [9, 16] : tiLe === "16:9" ? [16, 9] : [3, 4];
}

/* ---- Mặc định mô hình PNG + field (khi mẫu chưa có dữ liệu) — trùng "Chubb – Tự Do An Phúc" ---- */
const O_CHAN_DUNG_MD = { xPct: 25.1, yPct: 34.5, dPct: 27.6 };
const FIELDS_MD: StudioField[] = [
  { loai: "hoTen", xPct: 24.7, yPct: 66.5, size: 2.8, mau: "#13235f", canLe: "center", gioiHan: 40, dam: true },
  { loai: "chucDanh", xPct: 24.7, yPct: 72.8, size: 1.8, mau: "#5b6270", canLe: "center", gioiHan: 30, dam: false },
  { loai: "soDienThoai", xPct: 24.7, yPct: 79.2, size: 2.2, mau: "#13235f", canLe: "center", gioiHan: 15, dam: true },
];
/** Chữ mẫu khi Tư vấn viên chưa nhập */
function fieldPlaceholder(loai: StudioField["loai"]) {
  return loai === "hoTen" ? "Họ tên tư vấn viên" : loai === "chucDanh" ? "Chức danh" : loai === "soDienThoai" ? "0903 xxx xxx" : "…";
}
/** Dịch tâm/anchor theo căn lề (xPct là điểm neo) */
function alignTranslateX(canLe: StudioField["canLe"]) {
  return canLe === "center" ? "-50%" : canLe === "right" ? "-100%" : "0%";
}
export function tiLeLabel(tiLe: StudioTemplate["tiLe"]) {
  return tiLe === "1:1" ? "Vuông 1:1" : tiLe === "4:5" ? "Dọc 4:5" : tiLe === "9:16" ? "Dọc 9:16" : tiLe === "16:9" ? "Ngang 16:9" : "Dọc 3:4";
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

/** Tự dò lỗ trong suốt của ảnh nền PNG (quét alpha) → ô ảnh chân dung; null nếu ảnh không có vùng trong suốt đáng kể.
 * Admin chỉ cần upload PNG chừa lỗ trong suốt — không cần nhập toạ độ. Kết quả cache theo src. */
type Hole = { xPct: number; yPct: number; dPct: number };
/** Kết quả tự dò: lỗ trong suốt (null nếu không có) + tỉ lệ thật rộng/cao của ảnh nền */
type Detected = { hole: Hole | null; ratio: number };
const holeCache = new Map<string, Detected>();
function detectHole(src: string): Promise<Detected> {
  const cached = holeCache.get(src);
  if (cached !== undefined) return Promise.resolve(cached);
  return new Promise<Detected>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.height ? img.width / img.height : 1;
      let hole: Hole | null = null;
      try {
        const cw = 160, ch = Math.max(1, Math.round((cw * img.height) / img.width));
        const c = document.createElement("canvas"); c.width = cw; c.height = ch;
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, cw, ch);
          const d = ctx.getImageData(0, 0, cw, ch).data;
          let minx = cw, miny = ch, maxx = -1, maxy = -1, cnt = 0;
          for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
            if (d[(y * cw + x) * 4 + 3] < 20) { cnt++; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; }
          }
          if (cnt >= cw * ch * 0.004 && maxx >= 0) {
            const w = maxx - minx + 1, h = maxy - miny + 1;
            hole = { xPct: (((minx + maxx) / 2) / cw) * 100, yPct: (((miny + maxy) / 2) / ch) * 100, dPct: (Math.max(w, h) / cw) * 100 };
          }
        }
      } catch { hole = null; }
      const res: Detected = { hole, ratio }; holeCache.set(src, res); resolve(res);
    };
    img.onerror = () => { const res: Detected = { hole: null, ratio: 0 }; holeCache.set(src, res); resolve(res); };
    img.src = src;
  });
}

export function StudioPreview({ template, portrait, zoom = 1, offsetX = 0, offsetY = 0, onOffsetChange, hoTen, chucDanh, soDienThoai, gioiThieu, className }: {
  template?: Pick<StudioTemplate, "anh" | "anhNen" | "tiLe" | "tyLe" | "anhSauNen" | "fields" | "anhChanDung" | "mauNen" | "khungAnh" | "tiLeKhung" | "disclaimer" | "hoaTiet" | "nhan" | "mauNhan" | "boCuc">;
  portrait?: string; zoom?: number; offsetX?: number; offsetY?: number; onOffsetChange?: (x: number, y: number) => void;
  hoTen?: string; chucDanh?: string; soDienThoai?: string; gioiThieu?: string; className?: string;
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

  // Tự dò lỗ trong suốt của ảnh nền (thuật toán) — admin chỉ upload PNG có lỗ, không nhập toạ độ
  const [detected, setDetected] = useState<Detected | undefined>(undefined);
  useEffect(() => {
    const s = template?.anhNen; if (!s) { setDetected(undefined); return; }
    let ok = true; detectHole(s).then((d) => { if (ok) setDetected(d); }); return () => { ok = false; };
  }, [template?.anhNen]);

  // Mẫu nền-ảnh-thật (mô hình PNG + field): ảnh nền PNG chứa toàn bộ thiết kế + ảnh chân dung (tự dò lỗ trong suốt) + field chữ.
  if (template?.anhNen) {
    const fields = template.fields ?? FIELDS_MD;
    // Có lỗ trong suốt → ảnh nằm SAU nền, lỗ tự cắt đúng hình. Không có (An Phúc vòng đục) → vẽ đè, dùng toạ độ mẫu.
    const behind = detected?.hole ? true : (detected === undefined ? !!template.anhSauNen : false);
    const hole = detected?.hole ?? template.anhChanDung ?? O_CHAN_DUNG_MD;
    const ratio = detected?.ratio ? String(detected.ratio) : (template.tyLe ? String(template.tyLe) : tiLeToRatio(template.tiLe ?? "16:9"));
    const val = (loai: StudioField["loai"]) => {
      const v = loai === "hoTen" ? hoTen : loai === "chucDanh" ? chucDanh : loai === "soDienThoai" ? soDienThoai : gioiThieu;
      return (v ?? "") || fieldPlaceholder(loai);
    };
    // Lớp ảnh chân dung — chỉ vẽ khi có ảnh; chưa có thì để ô trong suốt của PNG lộ ra (không placeholder giả).
    // behind: không bo tròn (để lỗ PNG cắt đúng hình vuông/lục giác/blob); on-top: bo tròn như cũ.
    const photoLayer = portrait ? (
      <div className={cx("absolute overflow-hidden", !behind && "rounded-full", canDrag && "cursor-move touch-none")} style={{ left: `${hole.xPct}%`, top: `${hole.yPct}%`, width: `${hole.dPct}%`, aspectRatio: "1/1", transform: "translate(-50%,-50%)" }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <img src={portrait} alt="" draggable={false} className="w-full h-full object-cover" style={{ transform: `translate(${ax}%, ${ay}%) scale(${zoom})` }} />
      </div>
    ) : null;
    return (
      <div className={cx("relative w-full overflow-hidden rounded-sm select-none [container-type:inline-size]", className)} style={{ aspectRatio: ratio }} aria-label="Xem trước ảnh Studio">
        {behind && photoLayer}
        <img src={template.anhNen} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover" />
        {!behind && photoLayer}
        {/* Field chữ Tư vấn viên điền — đặt tuyệt đối theo toạ độ mẫu, khớp bản tải (canvas). Font sans (Lato, kế thừa body). */}
        {fields.map((fd, i) => {
          const base: React.CSSProperties = { left: `${fd.xPct}%`, top: `${fd.yPct}%`, transform: `translate(${alignTranslateX(fd.canLe)}, -50%)`, color: fd.mau, fontSize: `${fd.size}cqw`, fontWeight: fd.dam ? 700 : 400, fontFamily: fd.serif ? '"Publico", Georgia, "Times New Roman", serif' : undefined, textTransform: fd.hoa ? "uppercase" : undefined };
          return fd.loai === "soDienThoai" && fd.icon ? (
            <div key={i} data-fld={fd.loai} className="absolute flex items-center whitespace-nowrap leading-none" style={{ ...base, gap: `${fd.size * 0.35}cqw` }}>
              <span className="inline-flex items-center justify-center rounded-full bg-[#7FCD32] text-white shrink-0" style={{ width: `${fd.size * 1.2}cqw`, height: `${fd.size * 1.2}cqw`, fontSize: `${fd.size * 0.7}cqw` }}>☎</span>
              {val("soDienThoai")}
            </div>
          ) : (
            <div key={i} data-fld={fd.loai} className="absolute whitespace-nowrap leading-none" style={{ ...base, textAlign: fd.canLe }}>{val(fd.loai)}</div>
          );
        })}
      </div>
    );
  }

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
  template?: Pick<StudioTemplate, "tiLe" | "tyLe" | "anhSauNen" | "anhNen" | "fields" | "anhChanDung" | "mauNen" | "khungAnh" | "tiLeKhung" | "disclaimer" | "hoaTiet" | "nhan" | "mauNhan" | "boCuc">;
  portrait?: string; zoom?: number; offsetX?: number; offsetY?: number; hoTen?: string; chucDanh?: string; soDienThoai?: string; gioiThieu?: string;
}) {
  const { template, portrait, zoom = 1, offsetX = 0, offsetY = 0, hoTen, chucDanh, soDienThoai, gioiThieu } = opts;

  // Mẫu nền-ảnh-thật (mô hình PNG + field): vẽ ảnh nền + overlay ảnh chân dung + các field theo dữ liệu mẫu
  if (template?.anhNen) {
    const detected = await detectHole(template.anhNen); // tự dò lỗ trong suốt + tỉ lệ thật
    const behind = detected.hole ? true : !!template.anhSauNen;
    const [rw, rh] = tiLeWH(template.tiLe ?? "16:9");
    const W = 1080, H = detected.ratio ? Math.round(W / detected.ratio) : (template.tyLe ? Math.round(W / template.tyLe) : Math.round((W * rh) / rw));
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const hole = detected.hole ?? template.anhChanDung ?? O_CHAN_DUNG_MD;
    const pcx = (hole.xPct / 100) * W, pcy = (hole.yPct / 100) * H, r = ((hole.dPct / 100) * W) / 2;
    // Vẽ ảnh chân dung — behind: vẽ TRƯỚC nền (clip ô vuông; PNG đè lên tự cắt hình); on-top: vẽ SAU nền (clip vòng tròn)
    const veAnh = async (tron: boolean) => {
      if (!portrait) return;
      ctx.save(); ctx.beginPath();
      if (tron) ctx.arc(pcx, pcy, r, 0, Math.PI * 2); else ctx.rect(pcx - r, pcy - r, 2 * r, 2 * r);
      ctx.closePath(); ctx.clip();
      try { const img = await loadImg(portrait); const s = Math.max((2 * r) / img.width, (2 * r) / img.height) * zoom; const dw = img.width * s, dh = img.height * s; ctx.drawImage(img, pcx - dw / 2 + (offsetX / 100) * 2 * r, pcy - dh / 2 + (offsetY / 100) * 2 * r, dw, dh); } catch {}
      ctx.restore();
    };
    if (behind) await veAnh(false);
    try { const bg = await loadImg(template.anhNen); ctx.drawImage(bg, 0, 0, W, H); } catch {}
    if (!behind) await veAnh(true);
    // Cùng font (Lato sans) như bản xem trước — nạp trước khi vẽ để canvas không rơi về fallback
    const SANS = `Lato, Arial, sans-serif`, SERIF = `"Publico", Georgia, "Times New Roman", serif`;
    const fields = template.fields ?? FIELDS_MD;
    try { await Promise.all(fields.flatMap((fd) => { const sz = (W * fd.size) / 100, w = fd.dam ? "bold " : ""; return [document.fonts.load(`${w}${sz}px Lato`), fd.serif ? document.fonts.load(`${w}${sz}px "Publico"`) : Promise.resolve()]; })); } catch {}
    ctx.textBaseline = "middle";
    const valOf = (loai: StudioField["loai"], hoa?: boolean) => {
      const v = loai === "hoTen" ? hoTen : loai === "chucDanh" ? chucDanh : loai === "soDienThoai" ? soDienThoai : gioiThieu;
      const s = (v ?? "") || fieldPlaceholder(loai);
      return hoa ? s.toUpperCase() : s;
    };
    for (const fd of fields) {
      const fs = (W * fd.size) / 100, x = (fd.xPct / 100) * W, y = (fd.yPct / 100) * H;
      const fontDecl = `${fd.dam ? "bold " : ""}${fs}px ${fd.serif ? SERIF : SANS}`;
      if (fd.loai === "soDienThoai" && fd.icon) {
        const ph = valOf("soDienThoai", fd.hoa), icon = fs * 1.2, gap = fs * 0.35; ctx.font = fontDecl;
        const phw = ctx.measureText(ph).width, groupW = icon + gap + phw;
        const left = fd.canLe === "center" ? x - groupW / 2 : fd.canLe === "right" ? x - groupW : x;
        ctx.textAlign = "center"; ctx.fillStyle = "#7FCD32"; ctx.beginPath(); ctx.arc(left + icon / 2, y, icon / 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `${icon * 0.62}px ${SANS}`; ctx.fillText("☎", left + icon / 2, y);
        ctx.textAlign = "left"; ctx.fillStyle = fd.mau; ctx.font = fontDecl; ctx.fillText(ph, left + icon + gap, y);
      } else {
        ctx.textAlign = fd.canLe; ctx.fillStyle = fd.mau; ctx.font = fontDecl; ctx.fillText(valOf(fd.loai, fd.hoa), x, y);
      }
    }
    const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = `anh-studio-${Date.now()}.png`; document.body.appendChild(a); a.click(); a.remove();
    return;
  }

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
