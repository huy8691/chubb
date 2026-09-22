"use client";
/** Ô mã QR THẬT (quét được) — sinh từ chuỗi `value` bằng thư viện qrcode, render ra ảnh PNG.
 * `value` phải là URL tuyệt đối mở được (dùng useSiteOrigin()/effectiveOrigin() để đúng base URL). */
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrBox({ value, size = 120, caption }: { value: string; size?: number; caption?: string }) {
  const [src, setSrc] = useState<string>("");
  useEffect(() => {
    let ok = true;
    QRCode.toDataURL(value, { margin: 1, width: Math.max(120, size * 3), errorCorrectionLevel: "M", color: { dark: "#191919", light: "#ffffff" } })
      .then((url) => { if (ok) setSrc(url); })
      .catch(() => { if (ok) setSrc(""); });
    return () => { ok = false; };
  }, [value, size]);

  return (
    <div className="inline-flex flex-col items-center gap-2">
      {src
        ? <img src={src} width={size} height={size} alt={`Mã QR mở ${value}`} className="bg-white border border-vien rounded-sm" />
        : <div style={{ width: size, height: size }} className="bg-white border border-vien rounded-sm animate-pulse" aria-label="Đang tạo mã QR" />}
      {caption && <span className="text-[12px] text-ink2 text-center max-w-[160px]">{caption}</span>}
    </div>
  );
}
