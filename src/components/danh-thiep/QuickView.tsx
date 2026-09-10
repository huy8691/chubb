"use client";
/**
 * E02 · Popup danh thiếp — xem nhanh. Mở từ danh sách E01 · E06 · C01 · C02 · A01.
 * Dùng: const [ma, setMa] = useState<string>(); <QuickView ma={ma} onClose={() => setMa(undefined)} />
 */
import { Avatar, Button, Chip, Modal, useFlash } from "@/components/ui";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import type { Advisor } from "@/lib/types";
import { QrBox } from "./QrBox";
import { useChiaSe } from "./SharePopup";
import { danhHieuCongKhai, fmtPhone, linkDanhThiep, taiVCard } from "./lib";

export function QuickView({ ma, onClose }: { ma?: string; onClose: () => void }) {
  const { data } = useStore();
  const a = ma ? data.advisors.find((x) => x.ma === ma) : undefined;
  if (!a) return null;
  return <QuickViewInner a={a} onClose={onClose} />;
}

function QuickViewInner({ a, onClose }: { a: Advisor; onClose: () => void }) {
  const { chiaSe, flashNode } = useChiaSe(a);
  const { flash, node } = useFlash();
  const dh = danhHieuCongKhai(a);
  const hs = a.hoSoNangLuc;
  return (
    <>
      <Modal open onClose={onClose} title="Danh thiếp Tư vấn viên" width={760}>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
          <div className="shrink-0"><Avatar name={a.hoTen} size={200} src={a.avatar} /></div>
          <div className="flex-1 min-w-0">
            <div className="eyebrow text-[11.5px]">Tư vấn Tài chính Toàn Tâm · Chubb Life</div>
            <h2 className="font-serif font-semibold text-[28px] leading-tight text-den mt-1 uppercase">{a.hoTen}</h2>
            <p className="text-[14px] text-ink2 mt-2">{[a.chucDanh, ...dh, `Mã ${a.ma}`].join(" · ")}</p>
            <p className="text-[14px] text-den mt-3">{fmtPhone(a.soDienThoai)}</p>
            <p className="text-[14px] text-den mt-1">{a.email}</p>
            <p className="text-[14px] text-den mt-1">VP Chubb Life · {a.vanPhong}</p>
            {hs?.noiBat && <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1">{hs.noiBat.slice(0, 2).map((t) => <span key={t} className="font-bold text-[14px] text-den">{t}</span>)}</div>}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 items-start">
          <a href={`https://zalo.me/${a.zalo ?? a.soDienThoai}`} target="_blank" rel="noopener" className="inline-flex items-center justify-center h-11 px-5 rounded-sm font-bold text-[14px] bg-blue text-white border border-blue hover:bg-blue2">Kết nối Zalo</a>
          <a href={`tel:${a.soDienThoai}`} className="inline-flex items-center justify-center h-11 px-5 rounded-sm font-bold text-[14px] bg-white text-blue border border-blue hover:bg-blue-soft" onClick={() => flash("Đang gọi " + fmtPhone(a.soDienThoai))}>Gọi điện</a>
          <Button kind="secondary" onClick={() => { taiVCard(a); flash("Đã tải vCard về máy"); }}>Lưu danh bạ (vCard)</Button>
          <div className="ml-auto"><QrBox value={linkDanhThiep(a.ma, "qr")} size={96} caption="Quét để mở trang danh thiếp đầy đủ" /></div>
        </div>

        {hs && hs.theManh.length > 0 && (
          <div className="mt-6 pt-5 border-t border-vien2">
            <div className="font-bold text-[17px] text-den">Đồng hành cùng bạn</div>
            <div className="mt-3 flex flex-wrap gap-2">{hs.theManh.map((t) => <Chip key={t} tone="blue">{t}</Chip>)}</div>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-vien2">
          <div className="font-bold text-[13px] text-den">Chia sẻ danh thiếp</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button kind="secondary" size="sm" onClick={() => chiaSe("Zalo")}>Zalo</Button>
            <Button kind="secondary" size="sm" onClick={() => chiaSe("Facebook")}>Facebook</Button>
            <Button kind="secondary" size="sm" onClick={() => chiaSe("Sao chép link")}>Sao chép liên kết</Button>
            <Button kind="secondary" size="sm" onClick={() => chiaSe("Tải ảnh")}>Tải ảnh (PNG)</Button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <Button href={R.E03(a.ma)}>Xem đầy đủ</Button>
          <span className="text-[12px] text-mut">Thông tin được bảo mật theo chính sách Chubb Life Việt Nam</span>
        </div>
      </Modal>
      {flashNode}{node}
    </>
  );
}
