"use client";
/** H16 · CMS — Tin nhắn liên hệ (ghi nhận form S03): tìm · chip trạng thái · Chủ đề ▾ · Xuất Excel · Xem → H16a · phân trang. */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/seed";
import type { ContactMessage } from "@/lib/types";
import { Button, EmptyState, FilterChips, Pagination, SearchBox, Select, StatusChip, Table, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { banLaLabel } from "@/components/chung/const";

const PER = 10;
type Loc = "tat-ca" | ContactMessage["trangThai"];
const bo = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

function DanhSach() {
  const sp = useSearchParams();
  const { data } = useStore();
  const { flash, node } = useFlash();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState<Loc>(sp.get("loc") === "chua-xem" ? "chua-xem" : "tat-ca");
  const [chuDe, setChuDe] = useState("");
  const [page, setPage] = useState(1);

  const all = data.contactMessages;
  const chuDes = Array.from(new Set(all.map((m) => m.chuDe))).sort();
  const k = bo(q.trim());
  const ds = all
    .filter((m) => loc === "tat-ca" || m.trangThai === loc)
    .filter((m) => !chuDe || m.chuDe === chuDe)
    .filter((m) => !k || bo(m.hoTen).includes(k) || bo(m.lienHe).includes(k) || bo(m.noiDung).includes(k) || bo(m.id).includes(k))
    .sort((a, b) => b.gui.localeCompare(a.gui));
  const pages = Math.max(1, Math.ceil(ds.length / PER));
  const hien = ds.slice((page - 1) * PER, page * PER);
  const dem = (s: ContactMessage["trangThai"]) => all.filter((m) => m.trangThai === s).length;
  const tvvCua = (m: ContactMessage) => (m.banLa === "tu-van-vien" ? data.advisors.find((a) => a.email === m.lienHe)?.ma : undefined);

  return (
    <>
      <CmsHeader title="Tin nhắn liên hệ" desc={`${all.length} tin nhắn · ${dem("chua-xem")} chưa xem`}
        right={<Button kind="secondary" onClick={() => flash(`Đã xuất ${ds.length} tin nhắn ra Excel`)}>Xuất Excel</Button>} />
      <CmsCard>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Tìm theo tên, email, nội dung…" className="w-[320px]" />
          <FilterChips value={loc} onChange={(v) => { setLoc(v); setPage(1); }} options={[
            { value: "tat-ca", label: "Tất cả", count: all.length },
            { value: "chua-xem", label: "Chưa xem", count: dem("chua-xem") },
            { value: "da-xem", label: "Đã xem", count: dem("da-xem") },
            { value: "da-tra-loi", label: "Đã trả lời", count: dem("da-tra-loi") },
          ]} />
          <Select value={chuDe} onChange={(e) => { setChuDe(e.target.value); setPage(1); }} className="ml-auto w-[220px]" aria-label="Chủ đề">
            <option value="">Chủ đề: Tất cả</option>{chuDes.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
        {hien.length === 0 ? <EmptyState title="Không có tin nhắn nào" desc="Thử bỏ bộ lọc hoặc từ khoá khác." /> : (
          <Table head={["Ngày gửi", "Người gửi", "Bạn là", "Chủ đề", "Trạng thái", ""]}>
            {hien.map((m) => {
              const ma = tvvCua(m);
              return (
                <tr key={m.id}>
                  <td className="text-ink2 whitespace-nowrap">{fmtDateTime(m.gui)}</td>
                  <td><div className="font-bold text-den">{m.hoTen}{ma && <span className="font-normal text-ink2"> · TVV {ma}</span>}</div><div className="text-[11.5px] text-mut">{m.lienHe}</div></td>
                  <td className="text-ink2">{banLaLabel(m.banLa)}</td>
                  <td className="text-ink2">{m.chuDe}</td>
                  <td><StatusChip s={m.trangThai} /></td>
                  <td className="text-right"><Link href={R.H16a(m.id)} className="text-blue font-bold">Xem</Link></td>
                </tr>
              );
            })}
          </Table>
        )}
        <div className="mt-4 text-[12.5px] text-ink2">Hiện {ds.length === 0 ? 0 : (page - 1) * PER + 1}–{Math.min(page * PER, ds.length)} / {ds.length}</div>
        <Pagination page={page} pages={pages} onChange={setPage} />
      </CmsCard>
      {node}
    </>
  );
}

export default function Page() {
  return <Suspense fallback={null}><DanhSach /></Suspense>;
}
