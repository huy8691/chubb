"use client";
/** H12 · CMS — Ứng viên (ghi nhận từ form B01): tìm · chip Chưa xem/Đã xem · Xuất Excel · Xem → H12a · phân trang. Không xử lý tuyển dụng trong hệ thống. */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import { Button, EmptyState, FilterChips, Pagination, SearchBox, StatusChip, Table, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";

const PER = 10;
type Loc = "tat-ca" | "moi" | "da-xem";
const bo = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

function DanhSach() {
  const sp = useSearchParams();
  const { data } = useStore();
  const { flash, node } = useFlash();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState<Loc>(sp.get("loc") === "moi" ? "moi" : "tat-ca");
  const [page, setPage] = useState(1);

  const k = bo(q.trim());
  const ds = data.candidates
    .filter((c) => loc === "tat-ca" || c.trangThai === loc)
    .filter((c) => !k || bo(c.hoTen).includes(k) || c.soDienThoai.includes(k) || bo(c.email).includes(k) || bo(c.id).includes(k))
    .sort((a, b) => b.gui.localeCompare(a.gui));
  const pages = Math.max(1, Math.ceil(ds.length / PER));
  const hien = ds.slice((page - 1) * PER, page * PER);
  const soMoi = data.candidates.filter((c) => c.trangThai === "moi").length;

  return (
    <>
      <CmsHeader title="Ứng viên" desc="Người đăng ký ứng tuyển qua form trên trang Tuyển dụng. Danh sách để ghi nhận và tra cứu; việc tuyển dụng xử lý ngoài hệ thống."
        right={<Button kind="secondary" onClick={() => flash(`Đã xuất ${ds.length} hồ sơ ra Excel`)}>Xuất Excel</Button>} />
      <CmsCard>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Tìm tên, SĐT…" className="w-[320px]" />
          <FilterChips value={loc} onChange={(v) => { setLoc(v); setPage(1); }} options={[
            { value: "tat-ca", label: "Tất cả", count: data.candidates.length },
            { value: "moi", label: "Chưa xem", count: soMoi },
            { value: "da-xem", label: "Đã xem", count: data.candidates.length - soMoi },
          ]} />
        </div>
        {hien.length === 0 ? <EmptyState title="Không có hồ sơ nào" desc={k ? "Thử từ khoá khác." : "Chưa có ứng viên gửi thông tin."} /> : (
          <Table head={["Ngày", "Họ tên", "SĐT", "Email", "Tỉnh", "Đã xem", ""]}>
            {hien.map((c) => (
              <tr key={c.id}>
                <td className="text-ink2 whitespace-nowrap">{fmtDate(c.gui)}</td>
                <td className="font-bold text-den">{c.hoTen}</td>
                <td className="text-ink2">{c.soDienThoai}</td>
                <td className="text-ink2">{c.email}</td>
                <td className="text-ink2">{c.tinhThanh}</td>
                <td><StatusChip s={c.trangThai === "moi" ? "chua-xem" : "da-xem"} /></td>
                <td className="text-right"><Link href={R.H12a(c.id)} className="text-blue font-bold">Xem</Link></td>
              </tr>
            ))}
          </Table>
        )}
        <div className="flex items-center justify-between mt-4 text-[12.5px] text-ink2">
          <span>Hiện {ds.length === 0 ? 0 : (page - 1) * PER + 1}–{Math.min(page * PER, ds.length)} / {ds.length}</span>
        </div>
        <Pagination page={page} pages={pages} onChange={setPage} />
      </CmsCard>
      {node}
    </>
  );
}

export default function Page() {
  return <Suspense fallback={null}><DanhSach /></Suspense>;
}
