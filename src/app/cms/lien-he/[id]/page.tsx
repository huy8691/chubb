"use client";
/** H16a · CMS — Tin nhắn liên hệ — chi tiết chỉ đọc. Mở là chuyển Chưa xem → Đã xem. Nút: Đánh dấu đã trả lời · Trả lời qua email · Mở đính kèm · ‹ Về danh sách. */
import { use, useEffect } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/seed";
import { Button, Chip, EmptyState, StatusChip, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { banLaLabel } from "@/components/chung/const";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, actions, ready } = useStore();
  const { flash, node } = useFlash();
  const tn = data.contactMessages.find((m) => m.id === id);

  useEffect(() => {
    if (ready && tn && tn.trangThai === "chua-xem") actions.update("contactMessages", (list) => list.map((m) => (m.id === id ? { ...m, trangThai: "da-xem" } : m)));
  }, [ready, tn, id, actions]);

  if (!ready) return null;
  if (!tn) return (
    <>
      <CmsHeader crumbs={[{ label: "Tin nhắn liên hệ", href: R.H16 }, { label: `#${id}` }]} title="Không tìm thấy tin nhắn" />
      <EmptyState title="Tin nhắn không tồn tại" action={<Button kind="secondary" href={R.H16}>‹ Về danh sách</Button>} />
    </>
  );

  const rows: [string, React.ReactNode][] = [
    ["Mã tin nhắn", `#${tn.id}`],
    ["Ngày gửi", fmtDateTime(tn.gui)],
    ["Bạn là", banLaLabel(tn.banLa)],
    ["Họ tên", tn.hoTen],
    ["Email hoặc số điện thoại", tn.lienHe],
    ["Chủ đề", tn.chuDe],
    ["Nội dung", <p key="nd" className="whitespace-pre-line leading-relaxed">{tn.noiDung}</p>],
    ["Đính kèm", tn.dinhKem ? <>{tn.dinhKem} · <button type="button" className="text-blue font-bold" onClick={() => flash(`Đã mở ${tn.dinhKem}`)}>Mở</button></> : <span className="text-mut">Không có</span>],
    ["Đồng ý được liên hệ lại", tn.dongYLienHe ? "Có — tick khi gửi form" : "Không"],
  ];

  return (
    <>
      <CmsHeader crumbs={[{ label: "Tin nhắn liên hệ", href: R.H16 }, { label: `#${tn.id}` }]}
        title={`${tn.hoTen} — ${tn.chuDe}`}
        desc={undefined} />
      <div className="flex flex-wrap gap-2 -mt-3 mb-5">
        <StatusChip s={tn.trangThai} />
        <Chip tone="blue">{banLaLabel(tn.banLa).toUpperCase()}</Chip>
        <Chip>GỬI {fmtDateTime(tn.gui)}</Chip>
      </div>
      <CmsCard>
        <dl className="divide-y divide-vien2">
          {rows.map(([l, v]) => (
            <div key={l} className="grid grid-cols-[300px_1fr] gap-6 py-3.5 text-[14px]"><dt className="text-ink2 text-[13px]">{l}</dt><dd className="text-den">{v}</dd></div>
          ))}
        </dl>
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-vien2">
          <Button disabled={tn.trangThai === "da-tra-loi"} onClick={() => { actions.update("contactMessages", (list) => list.map((m) => (m.id === id ? { ...m, trangThai: "da-tra-loi" } : m))); flash("Đã đánh dấu đã trả lời"); }}>Đánh dấu đã trả lời</Button>
          <Button kind="secondary" onClick={() => flash(`Đã mở ứng dụng email tới ${tn.lienHe}`)}>Trả lời qua email</Button>
          <Button kind="secondary" className="ml-auto" href={R.H16}>‹ Về danh sách</Button>
        </div>
      </CmsCard>
      {node}
    </>
  );
}
