"use client";
/**
 * H08 · CMS — Bảng xếp hạng chia sẻ danh thiếp (hiện Top 5 trên E01 sau khi chốt).
 * Kèm H08a · Popup xử lý hàng gắn cờ (mở từ "Xem & xử lý").
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { Button, Checkbox, Chip, Modal, Pagination, Radio, SearchBox, Select, Stat, Table, Textarea, useFlash } from "@/components/ui";
import { R } from "@/lib/routes";
import { fmtDate, fmtNum } from "@/lib/seed";
import { useCurrentCmsUser, useStore } from "@/lib/store";
import type { FlaggedRow } from "@/lib/types";
import { THANG_BXH, isThangChot, khongDau, tinhThanh, xepHang } from "@/components/danh-thiep/lib";

const PAGE = 10;
const NUT_LABEL: Record<string, string> = { "Sao chép link": "Sao chép liên kết" };

export default function Page() {
  const { data, actions } = useStore();
  const user = useCurrentCmsUser();
  const { flash, node } = useFlash();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [xuLy, setXuLy] = useState<FlaggedRow>();

  const bxh = useMemo(() => xepHang(data, false), [data]);
  const rows = useMemo(() => { const s = khongDau(q); return s ? bxh.filter(({ a }) => a.ma.includes(s) || khongDau(a.hoTen).includes(s)) : bxh; }, [bxh, q]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const p = Math.min(page, pages);
  const view = rows.slice((p - 1) * PAGE, p * PAGE);

  const tongTinh = data.ranking.reduce((s, r) => s + r.luotDuocTinh, 0);
  const tongKhongHopLe = data.ranking.reduce((s, r) => s + r.luotKhongHopLe, 0);
  const tongMo = data.ranking.reduce((s, r) => s + r.moTuLink, 0);
  const soChiaSe = data.ranking.filter((r) => r.luotDuocTinh > 0).length;
  const coChuaXuLy = data.flaggedRows.filter((f) => !f.daXuLy);
  const coDaXuLy = data.flaggedRows.filter((f) => f.daXuLy);
  const daChot = isThangChot(data);
  const byMa = new Map(data.advisors.map((a) => [a.ma, a]));
  const coTheoMa = new Set(coChuaXuLy.map((f) => f.advisorMa));

  const chotThang = () => {
    if (coChuaXuLy.length > 0 || daChot) return;
    bxh.slice(0, 3).forEach(({ a, hang }) => actions.notify(a.ma, `Bảng xếp hạng tháng ${THANG_BXH} đã chốt: bạn xếp hạng ${hang}.`, R.E01));
    flash("Đã chốt tháng và công bố Top 5 lên trang Danh thiếp");
  };

  const xacNhan = (f: FlaggedRow, quyetDinh: "loai" | "hop-le", ghiChu: string, guiTB: boolean) => {
    const boi = user?.hoTen ?? user?.email ?? "Quản trị";
    const ngay = new Date().toISOString();
    actions.update("flaggedRows", (list) => list.map((x) => x.id === f.id ? { ...x, daXuLy: { quyetDinh, soLuotLoai: quyetDinh === "loai" ? f.soLuot : 0, boi, ngay, ghiChu: ghiChu || undefined } } : x));
    if (quyetDinh === "loai") {
      actions.update("ranking", (rs) => rs.map((r) => r.advisorMa === f.advisorMa ? { ...r, luotDuocTinh: Math.max(0, r.luotDuocTinh - f.soLuot), luotKhongHopLe: r.luotKhongHopLe + f.soLuot } : r));
      if (guiTB) actions.notify(f.advisorMa, `${fmtNum(f.soLuot)} lượt chia sẻ ${f.thoiGian.slice(0, 10) === f.thoiGian ? "ngày " + fmtDate(f.thoiGian) : f.thoiGian} không được tính · ${f.lyDo}`, R.G02a);
      flash(`Đã loại ${fmtNum(f.soLuot)} lượt, tổng và hạng đã tính lại`);
    } else flash("Đã bỏ cờ, lượt được giữ nguyên");
    setXuLy(undefined);
  };

  return (
    <>
      <CmsHeader
        title={`Bảng xếp hạng chia sẻ danh thiếp — Tháng ${THANG_BXH}`}
        desc="1 lượt = 1 lần bấm một nút trong popup Chia sẻ trên danh thiếp (Zalo · Facebook · Sao chép liên kết · Tải ảnh · QR), dù người bấm là Tư vấn viên hay khách."
        right={
          <>
            <div className="flex gap-2">
              <Button kind="secondary" onClick={() => flash("Đã xuất Excel bảng xếp hạng tháng " + THANG_BXH)}>Xuất Excel</Button>
              {daChot ? <Chip tone="green" className="h-11">Đã chốt · Top 5 đang hiện trên trang Danh thiếp</Chip>
                : <Button disabled={coChuaXuLy.length > 0} onClick={chotThang}>Chốt tháng & công bố</Button>}
            </div>
            {!daChot && coChuaXuLy.length > 0 && <span className="text-[12.5px] text-red-fg font-bold">Còn {coChuaXuLy.length} hàng gắn cờ chưa xử lý</span>}
          </>
        }
      />

      <div className="flex items-center gap-4 mb-5">
        <Select value={THANG_BXH} onChange={() => flash("Bản demo chỉ có dữ liệu tháng " + THANG_BXH)} className="w-[180px] h-9">
          <option value={THANG_BXH}>Tháng {THANG_BXH}</option><option value="8/2026">Tháng 8/2026</option>
        </Select>
        <Chip tone={daChot ? "green" : "amber"}>{daChot ? "THÁNG ĐÃ CHỐT" : `THÁNG CHƯA CHỐT · ${coChuaXuLy.length} HÀNG GẮN CỜ CHƯA XỬ LÝ`}</Chip>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Stat value={fmtNum(tongTinh)} label="lượt được tính trong tháng" />
        <Stat value={fmtNum(tongKhongHopLe)} label="lượt không hợp lệ" />
        <Stat value={`${soChiaSe} / ${fmtNum(data.advisors.length)}`} label="danh thiếp được chia sẻ" />
        <Stat value={fmtNum(tongMo)} label="lượt mở từ link chia sẻ · để đối soát" />
      </div>

      <CmsCard>
        <div className="mb-4"><SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Tìm theo mã hoặc họ tên Tư vấn viên…" className="w-[360px]" /></div>
        <Table head={["Hạng", "Tư vấn viên", "Lượt được tính", "Lượt không hợp lệ", "Mở từ link", "Nút bấm nhiều nhất", "Danh thiếp"]}>
          {view.map(({ r, a, hang }) => (
            <tr key={a.ma}>
              <td className="font-bold">{hang}</td>
              <td>{a.hoTen} · {tinhThanh(a.vanPhong)} · <span className="font-mono text-[13px]">{a.ma}</span></td>
              <td className="font-bold">{fmtNum(r.luotDuocTinh)}</td>
              <td>{fmtNum(r.luotKhongHopLe)} {coTheoMa.has(a.ma) && <span className="text-red-fg" title="Có hàng gắn cờ chưa xử lý">⚑</span>}</td>
              <td>{fmtNum(r.moTuLink)}</td>
              <td>{NUT_LABEL[r.nutBamNhieuNhat] ?? r.nutBamNhieuNhat}</td>
              <td><Link href={R.E03(a.ma)} target="_blank" className="font-bold text-blue hover:underline">Mở</Link></td>
            </tr>
          ))}
          {view.length === 0 && <tr><td colSpan={7} className="text-center text-mut py-10">Không có Tư vấn viên nào khớp</td></tr>}
        </Table>
        <div className="flex items-center justify-between mt-4 text-[12.5px] text-ink2">
          <span>Hiện {rows.length === 0 ? 0 : (p - 1) * PAGE + 1}–{Math.min(p * PAGE, rows.length)} / {fmtNum(rows.length)}</span>
          <Pagination page={p} pages={pages} onChange={setPage} />
        </div>
      </CmsCard>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6 mt-6">
        <CmsCard title="Cách đếm">
          <ol className="space-y-2.5 text-[13.5px] text-den list-decimal pl-5">
            <li>Cùng một thiết bị bấm cùng một nút nhiều lần trong 30 phút chỉ tính 1 lượt.</li>
            <li>Không tính lượt từ mạng nội bộ Chubb, tài khoản test, hoặc bấm trước ngày 1 của tháng.</li>
            <li>Tháng khoá lúc 23:59 ngày cuối tháng. Quản trị có 3 ngày rà soát rồi bấm &quot;Chốt tháng &amp; công bố&quot; để hiện Top 5 trên trang Danh thiếp.</li>
            <li>Danh thiếp vượt 200 lượt một ngày bị gắn cờ ⚑ và tạm giữ; xử lý ở khối &quot;Hàng gắn cờ&quot; bên dưới.</li>
            <li>Link chia sẻ mang tham số nguồn (?ref=zalo · fb · copy · qr). Người nhận mở link thì hệ thống ghi &quot;lượt mở từ link chia sẻ&quot; — chỉ dùng đối soát, không dùng xếp hạng.</li>
          </ol>
        </CmsCard>

        <CmsCard title={`Hàng gắn cờ — ${coChuaXuLy.length} chưa xử lý · ${coDaXuLy.length} đã xử lý trong tháng`}>
          {data.flaggedRows.length === 0 && <p className="text-mut text-[14px]">Không có hàng gắn cờ trong tháng.</p>}
          <ul className="divide-y divide-vien2">
            {[...coChuaXuLy, ...coDaXuLy].map((f) => {
              const a = byMa.get(f.advisorMa);
              return (
                <li key={f.id} className="py-3 flex items-center gap-4">
                  <div className="w-[220px] shrink-0 font-bold text-[13.5px] text-den">{f.advisorMa} · {a?.hoTen ?? "—"}</div>
                  <div className="flex-1 text-[13px] text-ink2">{fmtNum(f.soLuot)} lượt {f.thoiGian} · {f.lyDo} · nút {NUT_LABEL[f.nut] ?? f.nut}{f.luotMo !== undefined ? ` · ${f.luotMo} lượt mở` : ""}</div>
                  {f.daXuLy ? (
                    <Chip tone={f.daXuLy.quyetDinh === "loai" ? "grey" : "green"}>{f.daXuLy.quyetDinh === "loai" ? `ĐÃ LOẠI ${fmtNum(f.daXuLy.soLuotLoai)} LƯỢT` : "HỢP LỆ, BỎ CỜ"} · {f.daXuLy.boi} · {fmtDate(f.daXuLy.ngay)}</Chip>
                  ) : (
                    <Button size="sm" kind="secondary" onClick={() => setXuLy(f)}>Xem &amp; xử lý</Button>
                  )}
                </li>
              );
            })}
          </ul>
        </CmsCard>
      </div>

      {xuLy && <XuLyCo f={xuLy} ten={byMa.get(xuLy.advisorMa)?.hoTen ?? ""} onClose={() => setXuLy(undefined)} onXacNhan={xacNhan} />}
      {node}
    </>
  );
}

/** H08a · Popup — Xử lý hàng gắn cờ */
function XuLyCo({ f, ten, onClose, onXacNhan }: { f: FlaggedRow; ten: string; onClose: () => void; onXacNhan: (f: FlaggedRow, q: "loai" | "hop-le", ghiChu: string, guiTB: boolean) => void }) {
  const [quyetDinh, setQuyetDinh] = useState<"loai" | "hop-le">("loai");
  const [ghiChu, setGhiChu] = useState("");
  const [guiTB, setGuiTB] = useState(true);
  const theoNut = f.theoNut ?? [{ nut: NUT_LABEL[f.nut] ?? f.nut, so: f.soLuot }];
  const nhanNgay = f.thoiGian.slice(0, 10);
  return (
    <Modal open onClose={onClose} title={`Xử lý hàng gắn cờ — ${f.advisorMa} · ${ten}`} width={720}
      footer={<><Button onClick={() => onXacNhan(f, quyetDinh, ghiChu, guiTB)}>Xác nhận</Button><Button kind="ghost" onClick={onClose}>Huỷ</Button></>}>
      <div className="space-y-6 text-[14px] text-den">
        <section>
          <div className="text-[11px] font-bold text-ink2 tracking-wider mb-2">DẤU HIỆU</div>
          <ul className="space-y-1.5">
            <li>• {f.lyDo} — địa chỉ IP {f.ip}</li>
            <li>• {fmtNum(f.soLuot)} lượt bấm nút {NUT_LABEL[f.nut] ?? f.nut} trong khoảng {f.thoiGian}</li>
            <li>• {f.luotMo ?? 0} lượt mở từ link chia sẻ trong ngày</li>
          </ul>
        </section>
        <section>
          <div className="text-[11px] font-bold text-ink2 tracking-wider mb-2">THEO NÚT</div>
          <p>{theoNut.map((t) => `${t.nut} ${t.so}`).join("  ·  ")}</p>
        </section>
        <section>
          <div className="text-[11px] font-bold text-ink2 tracking-wider mb-2">QUYẾT ĐỊNH</div>
          <div className="space-y-2">
            <Radio name="qd" checked={quyetDinh === "loai"} onChange={() => setQuyetDinh("loai")} label={`Loại ${fmtNum(f.soLuot)} lượt ngày ${fmtDate(nhanNgay)} — không tính vào bảng xếp hạng`} />
            <Radio name="qd" checked={quyetDinh === "hop-le"} onChange={() => setQuyetDinh("hop-le")} label="Hợp lệ — giữ nguyên, bỏ cờ" />
          </div>
        </section>
        <label className="block">
          <span className="block text-[12px] font-bold text-den mb-1.5">Ghi chú nội bộ</span>
          <Textarea value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="Ví dụ: một địa chỉ IP văn phòng bấm lặp để thử…" />
        </label>
        <Checkbox checked={guiTB} onChange={(e) => setGuiTB(e.target.checked)} disabled={quyetDinh === "hop-le"} label="Gửi thông báo cho Tư vấn viên (số lượt bị loại và lý do)" />
      </div>
    </Modal>
  );
}
