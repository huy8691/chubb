"use client";
/** G04a · Xem chi tiết tài liệu (PDF · ảnh · DOC) — mở từ nút Xem trên G04 (công khai) và G10 (TVV).
 *  Khung xem: PDF/DOC hiển thị trang; JPG/PNG hiển thị ảnh. Tệp Phần "Dành cho Tư vấn viên" cần đăng nhập. */
import { use } from "react";
import Link from "next/link";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import { Breadcrumb, Button, Card, Chip, EmptyState, H1, H3, Muted, useFlash } from "@/components/ui";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, session, ready } = useStore();
  const { flash, node } = useFlash();
  const tenLoai = (lid: string) => data.docTypes.find((t) => t.id === lid)?.ten ?? "";
  const d = data.documents.find((x) => x.id === id);

  if (!ready) return null;
  if (!d) return (
    <section className="wrap py-16">
      <Breadcrumb items={[{ label: "Toàn Tâm Phát Triển", href: R.D01 }, { label: "Tài liệu", href: R.G04 }, { label: "Không tìm thấy" }]} />
      <div className="mt-6"><EmptyState title="Không tìm thấy tài liệu" desc="Tệp không tồn tại hoặc đã được gỡ." action={<Button kind="secondary" href={R.G04}>Về danh sách Tài liệu</Button>} /></div>
    </section>
  );

  const canhTVV = d.phan === "tvv";
  const veDs = canhTVV ? R.G10 : R.G04;
  const laAnh = d.dinhDang === "JPG" || d.dinhDang === "PNG";
  const chanTruy = canhTVV && session.role !== "tvv";
  const cungLoai = data.documents.filter((x) => x.id !== d.id && x.loaiId === d.loaiId && x.trangThai === "da-xuat-ban" && (canhTVV || x.phan === "cong-khai")).slice(0, 3);
  const meta: [string, string][] = [["Loại", tenLoai(d.loaiId)], ["Định dạng", d.dinhDang], ["Kích cỡ", d.kichCo], ["Phiên bản", d.phienBan], ["Cập nhật", fmtDate(d.capNhat)], ["Phần", canhTVV ? "Dành cho Tư vấn viên" : "Công khai"]];

  return (
    <>
      {node}
      <section className="bg-xam">
        <div className="wrap py-8">
          <Breadcrumb items={[{ label: "Toàn Tâm Phát Triển", href: R.D01 }, { label: "Tài liệu", href: veDs }, { label: d.ten }]} />
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <H1>{d.ten}</H1>
              <Muted className="mt-2 text-[14px]">{d.dinhDang} · {d.kichCo} · Phiên bản {d.phienBan} · Cập nhật {fmtDate(d.capNhat)} · Loại: {tenLoai(d.loaiId)}</Muted>
            </div>
            <Chip tone={canhTVV ? "amber" : "green"}>{canhTVV ? "DÀNH CHO TƯ VẤN VIÊN" : "CÔNG KHAI"}</Chip>
          </div>
        </div>
      </section>

      <section className="wrap py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        <div>
          {chanTruy ? (
            <Card className="p-8 sm:p-12 text-center">
              <div className="text-[16px] font-bold text-den">Tài liệu dành cho Tư vấn viên</div>
              <Muted className="mt-2 max-w-[420px] mx-auto">Đăng nhập bằng tài khoản Tư vấn viên để xem và tải tệp này.</Muted>
              <Button className="mt-5" href={`${R.G01}?next=${encodeURIComponent(R.G04a(d.id))}`}>Đăng nhập Tư vấn viên</Button>
            </Card>
          ) : (
            <>
              <div className="border border-vien rounded-sm overflow-hidden bg-white">
                <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-xam border-b border-vien text-[13px]">
                  <span className="font-bold text-den whitespace-nowrap">‹ Trang 1 / 12 ›</span>
                  <span className="text-mut hidden sm:inline">−&nbsp;&nbsp;100%&nbsp;&nbsp;+</span>
                  <button type="button" onClick={() => flash(`Đã tải “${d.ten}” (${d.dinhDang} · ${d.kichCo})`)} className="font-bold text-blue hover:underline whitespace-nowrap">⤓ Tải</button>
                </div>
                <div className="bg-[#ececec] p-6 sm:p-10 flex justify-center">
                  {laAnh ? (
                    <div className="w-full max-w-[560px] aspect-[4/3] bg-white border border-vien rounded-sm flex flex-col items-center justify-center gap-1 text-mut">
                      <span className="text-[28px]">🖼️</span><span className="text-[13px]">Ảnh — {d.ten}</span>
                    </div>
                  ) : (
                    <div className="w-full max-w-[440px] aspect-[1/1.414] bg-white border border-vien rounded-sm shadow-sm p-7 sm:p-9">
                      <div className="h-3.5 w-3/5 bg-[#2a2a2a] rounded-sm" />
                      <div className="mt-4 space-y-2">{[5, 5, 4.5].map((w, i) => <div key={i} className="h-2 rounded" style={{ width: `${w * 12}%`, background: "#dcdcdc" }} />)}</div>
                      <div className="mt-5 h-28 bg-[#f2f2f2] border border-vien rounded-sm flex items-center justify-center text-[11px] text-mut">Ảnh / biểu đồ</div>
                      <div className="mt-5 space-y-2">{[5, 5, 4, 5, 3].map((w, i) => <div key={i} className="h-2 rounded" style={{ width: `${w * 12}%`, background: "#dcdcdc" }} />)}</div>
                    </div>
                  )}
                </div>
              </div>
              <Muted className="mt-3 text-[12.5px]">Tệp PDF hiển thị trực tiếp trong trang; ảnh (JPG/PNG) hiển thị nguyên khung; DOC/DOCX hiển thị bản xem trước hoặc tải về để mở.</Muted>
            </>
          )}
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <H3>Tệp này</H3>
            <dl className="mt-3 text-[13px]">
              {meta.map(([l, v]) => (
                <div key={l} className="flex justify-between gap-4 py-2 border-b border-vien2 last:border-0"><dt className="text-mut">{l}</dt><dd className="font-bold text-den text-right">{v}</dd></div>
              ))}
            </dl>
            <div className="mt-4 flex gap-3">
              <Button className="flex-1" disabled={chanTruy} onClick={() => flash(`Đã tải “${d.ten}” (${d.dinhDang} · ${d.kichCo})`)}>Tải về</Button>
              <Button kind="secondary" className="flex-1" onClick={() => flash("Đã sao chép liên kết tài liệu")}>Chia sẻ</Button>
            </div>
          </Card>

          {cungLoai.length > 0 && (
            <Card className="p-5">
              <H3>Tài liệu cùng loại</H3>
              <ul className="mt-3 space-y-3">
                {cungLoai.map((x) => (
                  <li key={x.id} className="border-b border-vien2 last:border-0 pb-3 last:pb-0">
                    <Link href={R.G04a(x.id)} className="text-[13px] font-bold text-blue hover:underline block">{x.ten}</Link>
                    <Muted className="text-[12px]">{x.dinhDang} · {x.kichCo}</Muted>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Link href={veDs} className="inline-block text-[13px] font-bold text-blue hover:underline">‹ Về danh sách Tài liệu</Link>
        </aside>
      </section>
    </>
  );
}
