"use client";
/**
 * H03f / H03f2 · CMS — Vinh danh từ Leader (đối chiếu · CHỈ XEM). ĐỀ XUẤT, chưa chốt.
 * Hai kiểu hiển thị cùng một dữ liệu (toggle): "Tất cả TVV" (gộp một bảng, sắp theo doanh số) và "Theo Leader" (nhóm từng lượt gửi).
 * Admin chỉ xem để đối chiếu với số nhập trong Bảng vinh danh (H03b); không sửa. Bấm tên Leader → H03g.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { fmtDate, fmtNum } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { FilterChips, Table } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";

type View = "tat-ca" | "theo-leader";

export default function Page() {
  const { data } = useStore();
  const subs = data.leaderSubmissions;
  const [view, setView] = useState<View>("tat-ca");

  const flat = useMemo(() => subs.flatMap((s) => s.members.map((m) => ({ ...m, sub: s }))).sort((a, b) => b.doanhSo - a.doanhSo), [subs]);
  const soTVV = flat.length;
  const soLeader = subs.length;

  return (
    <>
      <CmsHeader
        crumbs={[{ label: "Vinh danh", href: R.H03 }, { label: "Vinh danh từ Leader" }]}
        title="Vinh danh từ Leader"
        desc="Tất cả Tư vấn viên các Leader gửi, để đối chiếu với số nhập trong Bảng vinh danh trước khi công bố. Chỉ xem — không sửa."
      />
      <CmsCard>
        <FilterChips<View> value={view} onChange={setView} options={[
          { value: "tat-ca", label: "Tất cả TVV" },
          { value: "theo-leader", label: "Theo Leader" },
        ]} />

        {view === "tat-ca" ? (
          <Table className="mt-4" head={["Tư vấn viên", "Leader gửi", "Bảng", "Doanh số", "HĐ mới", "KH mới", "Ngày gửi"]}>
            {flat.map((m, i) => (
              <tr key={i} className="hover:bg-xam/60">
                <td className="text-den">{m.hoTen}</td>
                <td><Link href={R.H03g(m.sub.id)} className="font-bold text-blue hover:underline">{m.sub.leaderTen}</Link></td>
                <td className="text-ink2">{m.sub.bangLabel}</td>
                <td className="font-mono">{fmtNum(m.doanhSo)}</td>
                <td>{m.hopDong}</td>
                <td>{m.khachHang}</td>
                <td className="text-ink2">{fmtDate(m.sub.guiLuc)}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="mt-4 space-y-6">
            {subs.map((s) => {
              const tong = s.members.reduce((t, m) => t + m.doanhSo, 0);
              return (
                <div key={s.id} className="border border-vien2 rounded-sm overflow-hidden">
                  <div className="bg-blue-soft/60 px-4 py-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <Link href={R.H03g(s.id)} className="font-bold text-[15px] text-den hover:text-blue">{s.leaderTen}</Link>
                    <span className="text-[14px] text-ink2">· gửi {fmtDate(s.guiLuc)} · {s.members.length} TVV · tổng doanh số {fmtNum(tong)}</span>
                  </div>
                  <Table head={["Tư vấn viên", "Doanh số", "HĐ mới", "KH mới"]}>
                    {s.members.map((m, i) => (
                      <tr key={i} className="hover:bg-xam/60">
                        <td className="text-den">{m.hoTen}</td>
                        <td className="font-mono">{fmtNum(m.doanhSo)}</td>
                        <td>{m.hopDong}</td>
                        <td>{m.khachHang}</td>
                      </tr>
                    ))}
                  </Table>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4 text-[12.5px] text-ink2">{soLeader} Leader · {soTVV} Tư vấn viên · Tháng 9/2026</div>
      </CmsCard>
    </>
  );
}
