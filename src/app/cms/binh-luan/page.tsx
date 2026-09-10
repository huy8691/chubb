"use client";
/**
 * H20 · CMS — Bình luận danh thiếp (10/09): bình luận khách để lại trên danh thiếp TVV (E03).
 * Khách gửi (tên + SĐT, không OTP) → TVV duyệt (G12) mới hiện. Quản trị giám sát: gắn cờ / ẩn (KHÔNG duyệt thay TVV).
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/seed";
import type { BinhLuan } from "@/lib/types";
import { Button, Chip, EmptyState, FilterChips, Modal, Pagination, SearchBox, Table, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";

const PER = 10;
type Loc = "tat-ca" | "gan-co" | "da-an";
const TT: Record<BinhLuan["trangThai"], [string, "green" | "amber" | "grey"]> = { "cho-duyet": ["Chờ duyệt", "amber"], "dang-hien": ["Đang hiện", "green"], "da-an": ["Đã ẩn", "grey"] };
const bo = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

function Row({ l, v, href, hrefLabel }: { l: string; v: string; href?: string; hrefLabel?: string }) {
  return <div className="flex items-start gap-4 py-2 border-b border-vien2 text-[14px]"><span className="w-[130px] shrink-0 text-ink2">{l}</span><span className="flex-1 text-den">{v}</span>{href && <Link href={href} className="text-blue font-bold text-[13px]">{hrefLabel ?? "Mở hồ sơ"}</Link>}</div>;
}

function DanhSach() {
  const sp = useSearchParams();
  const { data, actions } = useStore();
  const { flash, node } = useFlash();
  const l0 = sp.get("loc");
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState<Loc>(l0 === "gan-co" || l0 === "da-an" ? l0 : "tat-ca");
  const [page, setPage] = useState(1);
  const [xem, setXem] = useState<BinhLuan | null>(null);

  const tvv = (ma: string) => data.advisors.find((a) => a.ma === ma);
  const tenTvv = (ma: string) => tvv(ma)?.hoTen ?? ma;
  const all = data.binhLuan;
  const demCo = all.filter((b) => b.ganCo).length;
  const demAn = all.filter((b) => b.trangThai === "da-an").length;
  const k = bo(q.trim());
  const ds = all
    .filter((b) => loc === "tat-ca" || (loc === "gan-co" ? b.ganCo : b.trangThai === "da-an"))
    .filter((b) => !k || bo(b.tenKhach).includes(k) || bo(tenTvv(b.advisorMa)).includes(k) || bo(b.noiDung).includes(k) || b.sdt.includes(q.trim()))
    .sort((a, b) => b.ngay.localeCompare(a.ngay));
  const pages = Math.max(1, Math.ceil(ds.length / PER));
  const hien = ds.slice((page - 1) * PER, page * PER);

  const capNhat = (id: string, patch: Partial<BinhLuan>, msg: string) => {
    actions.update("binhLuan", (arr) => arr.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    setXem(null); flash(msg);
  };

  return (
    <>
      <CmsHeader title="Bình luận danh thiếp" desc={`${all.length} bình luận · ${demCo} gắn cờ · ${demAn} đã ẩn. Bình luận khách để lại trên danh thiếp TVV — TVV tự duyệt; Quản trị gắn cờ / ẩn.`} />
      <CmsCard>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Tìm theo khách, Tư vấn viên, SĐT, nội dung…" className="w-[340px]" />
          <FilterChips value={loc} onChange={(v) => { setLoc(v); setPage(1); }} options={[
            { value: "tat-ca", label: "Tất cả", count: all.length },
            { value: "gan-co", label: "Gắn cờ", count: demCo },
            { value: "da-an", label: "Đã ẩn", count: demAn },
          ]} />
        </div>
        {hien.length === 0 ? <EmptyState title="Không có bình luận nào" desc="Thử bỏ bộ lọc hoặc từ khoá khác." /> : (
          <Table head={["Thời gian", "Khách → Tư vấn viên", "Nội dung", "Trạng thái", ""]}>
            {hien.map((b) => (
              <tr key={b.id}>
                <td className="text-ink2 whitespace-nowrap">{fmtDateTime(b.ngay)}</td>
                <td className="font-bold text-den">{b.tenKhach} <span className="font-normal text-ink2">→</span> {tenTvv(b.advisorMa)}</td>
                <td className="text-ink2 max-w-[360px] truncate">{b.noiDung}</td>
                <td className="whitespace-nowrap"><Chip tone={TT[b.trangThai][1]}>{TT[b.trangThai][0]}</Chip>{b.ganCo && <Chip tone="amber" className="ml-1.5">Gắn cờ</Chip>}</td>
                <td className="text-right"><button type="button" onClick={() => setXem(b)} className="text-blue font-bold">Xem</button></td>
              </tr>
            ))}
          </Table>
        )}
        <div className="mt-4 text-[12.5px] text-ink2">Hiện {ds.length === 0 ? 0 : (page - 1) * PER + 1}–{Math.min(page * PER, ds.length)} / {ds.length} bình luận</div>
        <Pagination page={page} pages={pages} onChange={setPage} />
      </CmsCard>

      {/* H20a · popup xem & xử lý */}
      <Modal open={!!xem} onClose={() => setXem(null)} title={xem ? `Bình luận · ${fmtDateTime(xem.ngay)}` : ""} width={640}
        footer={xem && (
          <>
            {xem.trangThai !== "da-an" && <Button onClick={() => capNhat(xem.id, { trangThai: "da-an", ganCo: false, lyDoCo: "Quản trị ẩn" }, "Đã ẩn bình luận khỏi danh thiếp")}>Ẩn bình luận</Button>}
            {xem.ganCo && <Button kind="secondary" onClick={() => capNhat(xem.id, { ganCo: false, lyDoCo: undefined }, "Đã bỏ cờ")}>Hợp lệ, bỏ cờ</Button>}
            {xem.trangThai === "da-an" && <Button kind="secondary" onClick={() => capNhat(xem.id, { trangThai: "dang-hien" }, "Bình luận hiện lại trên danh thiếp")}>Hiện lại</Button>}
            <Button kind="ghost" className="ml-auto" onClick={() => setXem(null)}>Đóng</Button>
          </>
        )}>
        {xem && (
          <div>
            {xem.ganCo && <div className="flex items-center gap-3 mb-4"><Chip tone="amber">GẮN CỜ TỰ ĐỘNG</Chip><span className="text-[14px] text-ink2">Lý do: {xem.lyDoCo}</span></div>}
            {xem.trangThai === "da-an" && !xem.ganCo && <div className="flex items-center gap-3 mb-4"><Chip tone="grey">ĐÃ ẨN</Chip><span className="text-[14px] text-ink2">{xem.lyDoCo}</span></div>}
            <Row l="Khách" v={`${xem.tenKhach} · ${xem.sdt} (SĐT — chỉ Quản trị thấy, TVV không thấy)`} href={`tel:${xem.sdt.replace(/\s/g, "")}`} hrefLabel="Gọi" />
            <Row l="Tư vấn viên" v={`${tenTvv(xem.advisorMa)} · Mã ${xem.advisorMa}`} href={tvv(xem.advisorMa) ? R.H11a(xem.advisorMa) : undefined} />
            <Row l="Danh thiếp" v={`chubblife.vn/${xem.advisorMa}`} href={`/${xem.advisorMa}`} hrefLabel="Xem" />
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
