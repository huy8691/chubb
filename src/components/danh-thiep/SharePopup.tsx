"use client";
/**
 * Popup Chia sẻ danh thiếp (mở từ E03 · E02 · G02a). Mỗi lần bấm một nút = 1 lượt được tính
 * cho danh thiếp đang mở (§10: lượt thuộc về danh thiếp, không thuộc người bấm).
 * Link chia sẻ mang ?ref=zalo|fb|copy|qr để đối soát lượt mở.
 */
import { Button, Modal, useFlash } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Advisor, RankingRow } from "@/lib/types";
import { QrBox } from "./QrBox";
import { linkDanhThiep } from "./lib";

export type NutChiaSe = "Zalo" | "Facebook" | "Sao chép link" | "QR" | "Tải ảnh";

/** Hàng nút chia sẻ — dùng trong popup và trong khối Chia sẻ trên E02 */
export function useChiaSe(a: Advisor) {
  const { actions } = useStore();
  const { flash, node } = useFlash();

  const tinhLuot = (nut: NutChiaSe) =>
    actions.update("ranking", (rows) => {
      const has = rows.some((r) => r.advisorMa === a.ma);
      const nutRank: RankingRow["nutBamNhieuNhat"] = nut === "Tải ảnh" ? "QR" : nut;
      return has
        ? rows.map((r) => (r.advisorMa === a.ma ? { ...r, luotDuocTinh: r.luotDuocTinh + 1 } : r))
        : [...rows, { advisorMa: a.ma, luotDuocTinh: 1, luotKhongHopLe: 0, nutBamNhieuNhat: nutRank, moTuLink: 0 }];
    });

  const chiaSe = async (nut: NutChiaSe) => {
    tinhLuot(nut);
    if (nut === "Zalo") { flash("Đã mở Zalo để gửi danh thiếp"); window.open(`https://zalo.me/share?url=${encodeURIComponent(linkDanhThiep(a.ma, "zalo"))}`, "_blank", "noopener"); return; }
    if (nut === "Facebook") { flash("Đã mở Facebook để chia sẻ"); window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkDanhThiep(a.ma, "fb"))}`, "_blank", "noopener"); return; }
    if (nut === "Sao chép link") {
      try { await navigator.clipboard.writeText(linkDanhThiep(a.ma, "copy")); flash("Đã sao chép liên kết danh thiếp"); } catch { flash(linkDanhThiep(a.ma, "copy")); }
      return;
    }
    if (nut === "Tải ảnh") { taiAnhThe(a); flash("Đã tải ảnh thẻ (PNG)"); return; }
    flash("Đã tải mã QR");
  };
  return { chiaSe, flashNode: node };
}

/** Vẽ ảnh thẻ PNG đơn giản bằng canvas và tải về */
function taiAnhThe(a: Advisor) {
  const c = document.createElement("canvas"); c.width = 1200; c.height = 630;
  const g = c.getContext("2d"); if (!g) return;
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, 1200, 630);
  g.fillStyle = "#000ECC"; g.fillRect(0, 0, 1200, 16);
  g.fillStyle = "#191919"; g.font = "bold 28px Arial"; g.fillText("CHUBB LIFE · Tư vấn Tài chính Toàn Tâm", 80, 110);
  g.font = "bold 64px Georgia"; g.fillText(a.hoTen.toUpperCase(), 80, 230);
  g.font = "32px Arial"; g.fillStyle = "#4d4d4d"; g.fillText(`${a.chucDanh} · Mã ${a.ma}`, 80, 290);
  g.fillText(a.soDienThoai, 80, 350); g.fillText(a.email, 80, 400); g.fillText(a.vanPhong, 80, 450);
  g.fillStyle = "#808080"; g.font = "24px Arial"; g.fillText(linkDanhThiep(a.ma, "qr"), 80, 560);
  const url = c.toDataURL("image/png");
  const el = document.createElement("a"); el.href = url; el.download = `danh-thiep-${a.ma}.png`;
  document.body.appendChild(el); el.click(); el.remove();
}

export function SharePopup({ a, open, onClose }: { a: Advisor; open: boolean; onClose: () => void }) {
  const { chiaSe, flashNode } = useChiaSe(a);
  return (
    <>
      <Modal open={open} onClose={onClose} title="Chia sẻ danh thiếp" width={560}>
        <div className="flex gap-6 items-start">
          <QrBox value={linkDanhThiep(a.ma, "qr")} size={140} caption="Quét để mở danh thiếp này" />
          <div className="flex-1">
            <div className="font-bold text-den">{a.hoTen}</div>
            <div className="text-[13px] text-ink2 mt-0.5">{a.chucDanh} · Mã {a.ma}</div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button kind="secondary" size="sm" onClick={() => chiaSe("Zalo")}>Zalo</Button>
              <Button kind="secondary" size="sm" onClick={() => chiaSe("Facebook")}>Facebook</Button>
              <Button kind="secondary" size="sm" onClick={() => chiaSe("Sao chép link")}>Sao chép liên kết</Button>
              <Button kind="secondary" size="sm" onClick={() => chiaSe("Tải ảnh")}>Tải ảnh thẻ (PNG)</Button>
            </div>
            <div className="mt-3 text-[12.5px] text-mut break-all">{linkDanhThiep(a.ma)}</div>
          </div>
        </div>
      </Modal>
      {flashNode}
    </>
  );
}
