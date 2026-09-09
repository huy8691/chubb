"use client";
/**
 * H03d · CMS — Thêm người vinh danh từ Excel: một màn ba bước
 * (chọn tệp + tải mẫu → xem trước lỗi từng dòng → xác nhận nạp → về H03b).
 * Không đọc tệp thật: chọn tệp chỉ đổi tên hiển thị, bảng xem trước sinh từ dữ liệu mẫu.
 */
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { thangLabel } from "@/lib/seed";
import type { NguoiDat } from "@/lib/types";
import { Button, Chip, EmptyState, FilterChips, Table, cx, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { useHonor } from "@/components/vinh-danh/honor";

interface Dong { dong: number; ma: string; hoTen: string; hangMuc: string; hangMucId?: string; thuHang: number; kiem: "hop-le" | "cap-nhat" | "loi"; loi?: string }

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { flash, node } = useFlash();
  const { data, actions, hangMucSorted } = useHonor();
  const month = data.honorMonths.find((m) => m.id === id);
  const [tep, setTep] = useState("");
  const [loc, setLoc] = useState<"loi" | "tat-ca">("tat-ca");

  // Bảng xem trước sinh từ dữ liệu mẫu (24 dòng: 21 hợp lệ, 3 lỗi)
  const rows = useMemo<Dong[]>(() => {
    if (!month || !tep) return [];
    const hms = hangMucSorted.filter((h) => h.hien);
    const trong = new Set(month.hangMuc.flatMap((h) => h.nguoiDat.map((n) => `${h.hangMucId}:${n.advisorMa}`)));
    const out: Dong[] = [];
    let dong = 2;
    for (let i = 0; i < 24; i++) {
      const a = data.advisors[i % data.advisors.length];
      const hm = hms[i % hms.length];
      const thuHang = Math.floor(i / hms.length) + 1;
      if (i === 5) out.push({ dong, ma: "", hoTen: "", hangMuc: hm.ten, thuHang, kiem: "loi", loi: "thiếu mã TVV" });
      else if (i === 10) out.push({ dong, ma: a.ma, hoTen: a.hoTen, hangMuc: "MDRT Gold", thuHang, kiem: "loi", loi: "hạng mục không tồn tại" });
      else if (i === 17) out.push({ dong, ma: "0199999", hoTen: "", hangMuc: hm.ten, thuHang, kiem: "loi", loi: "mã không có trong danh sách Tư vấn viên" });
      else out.push({ dong, ma: a.ma, hoTen: a.hoTen, hangMuc: hm.ten, hangMucId: hm.id, thuHang, kiem: trong.has(`${hm.id}:${a.ma}`) ? "cap-nhat" : "hop-le" });
      dong += 1 + (i % 3 === 0 ? 1 : 0);
    }
    return out;
  }, [month, tep, hangMucSorted, data.advisors]);

  if (!month) return (<><CmsHeader crumbs={[{ label: "Vinh danh", href: R.H03 }]} title="Không tìm thấy tháng" /><EmptyState title="Tháng này không có trong danh sách" action={<Button kind="secondary" href={R.H03}>Về danh sách</Button>} /></>);

  const soLoi = rows.filter((r) => r.kiem === "loi").length;
  const hopLe = rows.filter((r) => r.kiem !== "loi");
  const hien = loc === "loi" ? rows.filter((r) => r.kiem === "loi") : rows;

  const xacNhan = () => {
    const themMoi: { ma: string; hm: string }[] = [];
    actions.update("honorMonths", (ms) => ms.map((m) => {
      if (m.id !== id) return m;
      const hmIds = new Set([...m.hangMuc.map((h) => h.hangMucId), ...hopLe.map((r) => r.hangMucId!)]);
      const hangMuc = Array.from(hmIds).map((hmId) => {
        const cur = [...(m.hangMuc.find((h) => h.hangMucId === hmId)?.nguoiDat ?? [])];
        for (const r of hopLe.filter((x) => x.hangMucId === hmId)) {
          const i = cur.findIndex((x) => x.advisorMa === r.ma);
          if (i >= 0) cur[i] = { ...cur[i], thuHang: r.thuHang };
          else { cur.push({ advisorMa: r.ma, thuHang: r.thuHang, dongYCongKhai: "cho", nguon: "excel" } satisfies NguoiDat); themMoi.push({ ma: r.ma, hm: hmId }); }
        }
        return { hangMucId: hmId, nguoiDat: cur.sort((a, b) => a.thuHang - b.thuHang).map((x, k) => ({ ...x, thuHang: k + 1 })) };
      });
      return { ...m, hangMuc, capNhat: new Date().toISOString() };
    }));
    for (const t of themMoi) {
      const ten = hangMucSorted.find((h) => h.id === t.hm)?.ten ?? "";
      actions.notify(t.ma, `Chubb Life xin bạn đồng ý công khai danh hiệu ${ten} · ${thangLabel(month)}.`, R.G02a);
    }
    router.push(R.H03b(id));
  };

  return (
    <>
      <CmsHeader crumbs={[{ label: "Vinh danh", href: R.H03 }, { label: thangLabel(month), href: R.H03b(id) }, { label: "Thêm từ Excel" }]} title="Thêm người vinh danh từ Excel" />
      <div className="space-y-5">
        <CmsCard title="Bước 1 — Chọn tệp">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setTep(e.dataTransfer.files?.[0]?.name ?? "vinh-danh.xlsx"); }}
              className={cx("flex flex-col items-center justify-center gap-2 h-[140px] border-2 border-dashed rounded-sm cursor-pointer text-[13px]", tep ? "border-blue bg-blue-soft/40 text-den" : "border-vien text-ink2 hover:border-blue")}>
              {tep ? <><span className="font-bold">{tep}</span><span className="text-[12px] text-mut">Bấm để chọn tệp khác</span></> : "Kéo thả hoặc bấm chọn tệp .xlsx (tối đa 2.000 dòng)"}
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => setTep(e.target.files?.[0]?.name ?? "")} />
            </label>
            <div>
              <button type="button" className="font-bold text-[13px] text-blue hover:underline" onClick={() => flash("Đã tải file mẫu vinh-danh-mau.xlsx")}>Tải file mẫu .xlsx</button>
              <p className="mt-3 text-[12.5px] text-ink2">Cột: Mã TVV · Hạng mục · Thứ tự · Doanh số (phí năm đầu) · Hợp đồng mới · Khách hàng mới · Trích dẫn (tuỳ chọn)</p>
            </div>
          </div>
        </CmsCard>

        {tep && (
          <CmsCard title={`Bước 2 — Xem trước & kiểm lỗi (${soLoi} lỗi / ${rows.length} dòng)`}>
            <Table head={["Dòng", "Mã TVV", "Họ tên", "Hạng mục", "Thứ tự", "Kiểm tra"]}>
              {hien.map((r) => (
                <tr key={r.dong} className={cx(r.kiem === "loi" && "bg-red-bg/40")}>
                  <td className="text-ink2">{r.dong}</td>
                  <td>{r.ma || "—"}</td>
                  <td>{r.hoTen || "—"}</td>
                  <td>{r.hangMuc}</td>
                  <td>{r.thuHang}</td>
                  <td>
                    {r.kiem === "loi" && <span className="text-[12.5px] font-bold text-red-fg">✗ {r.loi}</span>}
                    {r.kiem === "hop-le" && <Chip tone="green">✓ hợp lệ</Chip>}
                    {r.kiem === "cap-nhat" && <span className="inline-flex items-center gap-2"><Chip tone="green">✓ hợp lệ</Chip><Chip tone="blue">đã có trong bảng, sẽ cập nhật</Chip></span>}
                  </td>
                </tr>
              ))}
            </Table>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <FilterChips value={loc} onChange={setLoc} options={[{ value: "loi", label: "Chỉ hàng lỗi", count: soLoi }, { value: "tat-ca", label: "Tất cả", count: rows.length }]} />
              <button type="button" className="font-bold text-[13px] text-blue hover:underline" onClick={() => flash("Đã tải tệp lỗi (3 dòng) để sửa")}>Tải tệp lỗi để sửa</button>
            </div>
          </CmsCard>
        )}

        {tep && (
          <CmsCard title="Bước 3 — Xác nhận">
            <p className="text-[13px] text-ink2 mb-4">{soLoi > 0 ? `${soLoi} dòng lỗi sẽ bị bỏ qua; ` : ""}{hopLe.length} người hợp lệ được thêm hoặc cập nhật vào {thangLabel(month)} với trạng thái chờ đồng ý công khai.</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={xacNhan} disabled={hopLe.length === 0}>Thêm {hopLe.length} người hợp lệ vào bảng</Button>
              <Button kind="secondary" href={R.H03b(id)}>Huỷ</Button>
            </div>
          </CmsCard>
        )}
        {!tep && <div className="text-right"><Button kind="ghost" href={R.H03b(id)}>Huỷ</Button></div>}
      </div>
      {node}
    </>
  );
}
