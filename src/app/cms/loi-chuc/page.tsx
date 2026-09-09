"use client";
/**
 * H19 · CMS — Lời chúc (09/09, phương án B): lời chúc Tư vấn viên gửi nhau trên trang Thành tích (C02).
 * Hiện ngay khi gửi; bộ lọc tự gắn cờ (liên kết ngoài); Quản trị xem trong popup H19a → Ẩn · Hợp lệ, bỏ cờ · Hiện lại.
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/seed";
import type { LoiChuc } from "@/lib/types";
import { Button, Chip, EmptyState, FilterChips, Modal, Pagination, SearchBox, Table, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";

const PER = 10;
type Loc = "tat-ca" | LoiChuc["trangThai"];
const TT: Record<LoiChuc["trangThai"], [string, "green" | "amber" | "grey"]> = { hien: ["Hiện", "green"], "gan-co": ["Gắn cờ", "amber"], "da-an": ["Đã ẩn", "grey"] };
const bo = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

function Row({ l, v, href }: { l: string; v: string; href?: string }) {
  return <div className="flex items-start gap-4 py-2 border-b border-vien2 text-[14px]"><span className="w-[130px] shrink-0 text-ink2">{l}</span><span className="flex-1 text-den">{v}</span>{href && <Link href={href} className="text-blue font-bold text-[13px]">Mở hồ sơ</Link>}</div>;
}

function DanhSach() {
  const sp = useSearchParams();
  const { data, actions } = useStore();
  const { flash, node } = useFlash();
  const l0 = sp.get("loc");
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState<Loc>(l0 === "gan-co" || l0 === "da-an" || l0 === "hien" ? l0 : "tat-ca");
  const [page, setPage] = useState(1);
  const [xem, setXem] = useState<LoiChuc | null>(null);

  const tvv = (ma: string) => data.advisors.find((a) => a.ma === ma);
  const ten = (ma: string) => tvv(ma)?.hoTen ?? ma;
  const hm = (id: string) => data.hangMuc.find((h) => h.id === id)?.ten ?? id;
  const thang = (id: string) => { const m = data.honorMonths.find((x) => x.id === id); return m ? `Tháng ${m.thang}/${m.nam}` : id; };
  const all = data.loiChuc;
  const dem = (s: LoiChuc["trangThai"]) => all.filter((l) => l.trangThai === s).length;
  const k = bo(q.trim());
  const ds = all
    .filter((l) => loc === "tat-ca" || l.trangThai === loc)
    .filter((l) => !k || bo(ten(l.nguoiGuiMa)).includes(k) || bo(ten(l.nguoiNhanMa)).includes(k) || bo(l.noiDung).includes(k))
    .sort((a, b) => b.ngay.localeCompare(a.ngay));
  const pages = Math.max(1, Math.ceil(ds.length / PER));
  const hien = ds.slice((page - 1) * PER, page * PER);
  const doi = (id: string, trangThai: LoiChuc["trangThai"], lyDoCo: string | undefined, msg: string) => {
    actions.update("loiChuc", (ls) => ls.map((l) => (l.id === id ? { ...l, trangThai, lyDoCo } : l)));
    setXem(null); flash(msg);
  };

  return (
    <>
      <CmsHeader title="Lời chúc" desc={`${all.length} lời chúc · ${dem("gan-co")} gắn cờ · ${dem("da-an")} đã ẩn. Lời chúc Tư vấn viên gửi nhau trên trang Thành tích, hiện ngay khi gửi; bộ lọc tự gắn cờ nội dung nghi ngờ.`} />
      <CmsCard>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Tìm theo người gửi, người nhận, nội dung…" className="w-[320px]" />
          <FilterChips value={loc} onChange={(v) => { setLoc(v); setPage(1); }} options={[
            { value: "tat-ca", label: "Tất cả", count: all.length },
            { value: "gan-co", label: "Gắn cờ", count: dem("gan-co") },
            { value: "da-an", label: "Đã ẩn", count: dem("da-an") },
            { value: "hien", label: "Hiện", count: dem("hien") },
          ]} />
        </div>
        {hien.length === 0 ? <EmptyState title="Không có lời chúc nào" desc="Thử bỏ bộ lọc hoặc từ khoá khác." /> : (
          <Table head={["Thời gian", "Người gửi → Người nhận", "Danh hiệu", "Nội dung", "Trạng thái", ""]}>
            {hien.map((l) => (
              <tr key={l.id}>
                <td className="text-ink2 whitespace-nowrap">{fmtDateTime(l.ngay)}</td>
                <td className="font-bold text-den">{ten(l.nguoiGuiMa)} <span className="font-normal text-ink2">→</span> {ten(l.nguoiNhanMa)}</td>
                <td className="text-ink2 whitespace-nowrap">{hm(l.hangMucId)} · {thang(l.thangId)}</td>
                <td className="text-ink2 max-w-[360px] truncate">{l.noiDung}</td>
                <td><Chip tone={TT[l.trangThai][1]}>{TT[l.trangThai][0]}</Chip></td>
                <td className="text-right"><button type="button" onClick={() => setXem(l)} className="text-blue font-bold">Xem</button></td>
              </tr>
            ))}
          </Table>
        )}
        <div className="mt-4 text-[12.5px] text-ink2">Hiện {ds.length === 0 ? 0 : (page - 1) * PER + 1}–{Math.min(page * PER, ds.length)} / {ds.length} lời chúc</div>
        <Pagination page={page} pages={pages} onChange={setPage} />
      </CmsCard>

      {/* H19a · popup xem & xử lý */}
      <Modal open={!!xem} onClose={() => setXem(null)} title={xem ? `Lời chúc · ${fmtDateTime(xem.ngay)}` : ""} width={640}
        footer={xem && (
          <>
            {xem.trangThai !== "da-an" && <Button onClick={() => doi(xem.id, "da-an", "Quản trị ẩn", "Đã ẩn lời chúc khỏi trang Thành tích")}>Ẩn lời chúc</Button>}
            {xem.trangThai === "gan-co" && <Button kind="secondary" onClick={() => doi(xem.id, "hien", undefined, "Đã bỏ cờ, lời chúc tiếp tục hiện")}>Hợp lệ, bỏ cờ</Button>}
            {xem.trangThai === "da-an" && <Button kind="secondary" onClick={() => doi(xem.id, "hien", undefined, "Lời chúc hiện lại trên trang Thành tích")}>Hiện lại</Button>}
            <Button kind="ghost" className="ml-auto" onClick={() => setXem(null)}>Đóng</Button>
          </>
        )}>
        {xem && (
          <div>
            {xem.trangThai === "gan-co" && <div className="flex items-center gap-3 mb-4"><Chip tone="amber">GẮN CỜ TỰ ĐỘNG</Chip><span className="text-[14px] text-ink2">Lý do: {xem.lyDoCo}</span></div>}
            {xem.trangThai === "da-an" && <div className="flex items-center gap-3 mb-4"><Chip tone="grey">ĐÃ ẨN</Chip><span className="text-[14px] text-ink2">{xem.lyDoCo}</span></div>}
            <Row l="Người gửi" v={`${ten(xem.nguoiGuiMa)} · ${xem.nguoiGuiMa} · ${tvv(xem.nguoiGuiMa)?.vanPhong.replace(/ — .*$/, "") ?? ""}`} href={tvv(xem.nguoiGuiMa) ? R.H11a(xem.nguoiGuiMa) : undefined} />
            <Row l="Người nhận" v={`${ten(xem.nguoiNhanMa)} · ${xem.nguoiNhanMa} · ${tvv(xem.nguoiNhanMa)?.vanPhong.replace(/ — .*$/, "") ?? ""}`} href={tvv(xem.nguoiNhanMa) ? R.H11a(xem.nguoiNhanMa) : undefined} />
            <Row l="Danh hiệu" v={`${hm(xem.hangMucId)} · ${thang(xem.thangId)}`} />
            <div className="mt-4"><div className="text-[12.5px] text-ink2 mb-1.5">Nội dung</div><div className="bg-xam rounded-sm p-4 text-[14px] text-den">{xem.noiDung}</div></div>
          </div>
        )}
      </Modal>
      {node}
    </>
  );
}

export default function Page() {
  return <Suspense fallback={null}><DanhSach /></Suspense>;
}
