"use client";
/**
 * G13 · Trang cá nhân › Vinh danh thành viên — CHỈ LEADER (ĐỀ XUẤT, chưa chốt).
 * Leader nhập tay thành tích thành viên nhóm và gửi Chubb đối chiếu khi lập Bảng vinh danh.
 * Không nằm trong dải 5 tab khu tài khoản (AccountShell render gọn cho route này).
 * Admin chỉ đối chiếu (H03f/H03g), không sửa; Bảng vinh danh công khai do Chubb quyết định.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { fmtDateTime } from "@/lib/seed";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import type { LeaderMember } from "@/lib/types";
import { Button, H2, Input, useFlash } from "@/components/ui";

const BANGS = ["Tháng 9/2026", "Tháng 8/2026", "Quý 3/2026"];
const trong = (): LeaderMember => ({ hoTen: "", doanhSo: 0, hopDong: 0, khachHang: 0 });

export default function Page() {
  const { data, actions } = useStore();
  const tvv = useCurrentAdvisor();
  const { flash, node } = useFlash();
  const goc = useMemo(() => data.leaderSubmissions.find((s) => s.leaderMa === tvv?.ma), [data.leaderSubmissions, tvv?.ma]);
  const [bang, setBang] = useState(goc?.bangLabel ?? BANGS[0]);
  const [rows, setRows] = useState<LeaderMember[]>(() => goc ? goc.members.map((m) => ({ ...m })) : [trong()]);

  if (!tvv) return null;
  if (!tvv.isLeader) {
    return (
      <div className="max-w-[720px]">
        <H2 className="mb-2">Vinh danh thành viên</H2>
        <p className="text-[14px] text-ink2">Mục này chỉ dành cho Tư vấn viên được gắn cờ <b>Leader</b> (Trưởng nhóm). Nếu bạn phụ trách một nhóm và cần nhập thành tích, liên hệ Chubb để được bật quyền.</p>
        <Link href={R.G02a} className="inline-block mt-4 text-blue font-bold text-[14px]">‹ Về Trang cá nhân</Link>
      </div>
    );
  }

  const setCell = (i: number, k: keyof LeaderMember, v: string) => setRows((rs) => rs.map((r, j) => j === i ? { ...r, [k]: k === "hoTen" ? v : Number(v.replace(/\D/g, "")) || 0 } : r));
  const themHang = () => setRows((rs) => [...rs, trong()]);
  const xoaHang = (i: number) => setRows((rs) => rs.filter((_, j) => j !== i));

  const luu = (gui: boolean) => {
    const members = rows.filter((r) => r.hoTen.trim());
    const rec = { id: goc?.id ?? `ls-${tvv.ma}`, leaderMa: tvv.ma, leaderTen: tvv.hoTen, bangLabel: bang, guiLuc: new Date().toISOString(), members };
    actions.update("leaderSubmissions", (list) => {
      const others = list.filter((s) => s.leaderMa !== tvv.ma);
      return gui ? [rec, ...others] : list.some((s) => s.leaderMa === tvv.ma) ? list.map((s) => s.leaderMa === tvv.ma ? rec : s) : [rec, ...others];
    });
    flash(gui ? `Đã gửi thành tích ${members.length} thành viên cho Chubb đối chiếu` : "Đã lưu nháp");
  };

  return (
    <div className="max-w-[1200px]">
      {node}
      <div className="text-[13px] text-mut mb-2"><Link href={R.G02a} className="hover:text-blue">Trang cá nhân</Link> › Vinh danh thành viên</div>
      <H2 className="mb-1">Vinh danh thành viên</H2>
      <p className="text-[13px] text-ink2 mb-6">Nhập tay thành tích của các thành viên trong nhóm, gửi Chubb đối chiếu khi lập Bảng vinh danh.</p>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <label className="text-[15px] font-bold text-den">Gửi cho bảng vinh danh:</label>
        <select value={bang} onChange={(e) => setBang(e.target.value)} className="h-11 px-3 border border-vien rounded-sm text-[15px] bg-white">
          {BANGS.map((b) => <option key={b}>{b}</option>)}
        </select>
        {goc && <span className="text-[14px] text-ink2">Đã gửi {fmtDateTime(goc.guiLuc)} · có thể sửa và gửi lại</span>}
      </div>

      <div className="border border-vien rounded-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_220px_130px_130px_56px] gap-0 bg-xam text-[14px] font-bold text-ink2 px-4 py-2.5">
          <span>Tư vấn viên</span><span>Doanh số (phí năm đầu)</span><span>Hợp đồng mới</span><span>Khách hàng mới</span><span></span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_220px_130px_130px_56px] gap-3 items-center px-4 py-2.5 border-t border-vien2">
            <Input value={r.hoTen} onChange={(e) => setCell(i, "hoTen", e.target.value)} placeholder="Nhập tên Tư vấn viên" />
            <Input value={r.doanhSo ? r.doanhSo.toLocaleString("vi-VN") : ""} onChange={(e) => setCell(i, "doanhSo", e.target.value)} inputMode="numeric" placeholder="0" />
            <Input value={r.hopDong || ""} onChange={(e) => setCell(i, "hopDong", e.target.value)} inputMode="numeric" placeholder="0" />
            <Input value={r.khachHang || ""} onChange={(e) => setCell(i, "khachHang", e.target.value)} inputMode="numeric" placeholder="0" />
            <button type="button" onClick={() => xoaHang(i)} className="text-[14px] text-ink2 hover:text-red text-right">Xoá</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={themHang} className="mt-3 text-[15px] font-bold text-blue">+ Thêm hàng</button>

      <div className="flex items-center gap-3 mt-8">
        <Button onClick={() => luu(true)}>Gửi cho admin</Button>
        <Button kind="secondary" onClick={() => luu(false)}>Lưu nháp</Button>
      </div>
      <p className="text-[14px] text-ink2 mt-5">Số bạn nhập chỉ để Chubb đối chiếu. Bảng vinh danh công khai do Chubb quyết định và công bố.</p>
    </div>
  );
}
