"use client";
/** S03 · Liên hệ & trợ giúp — trang công khai (cũ G09): tìm câu hỏi · chip đối tượng · FAQ trang "lien-he" · thẻ Liên hệ Chubb Life · form Gửi tin nhắn (ghi vào Tin nhắn liên hệ, CMS H16) · thẻ Bạn là Tư vấn viên? */
import { useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import type { ContactMessage, FAQ } from "@/lib/types";
import { Breadcrumb, Button, Card, Checkbox, Field, FilterChips, H1, H2, Input, Muted, Select, Textarea, useFlash } from "@/components/ui";
import { FaqAccordion } from "@/components/chung/FaqAccordion";
import { BAN_LA, CHU_DE, EMAIL_CHUBB, EMAIL_TVV, HOTLINE } from "@/components/chung/const";

const MAX_ND = 1000;
const bo = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

export default function Page() {
  const { data, actions } = useStore();
  const tvv = useCurrentAdvisor();
  const { flash, node } = useFlash();

  // Tìm câu hỏi + chip đối tượng
  const [tuKhoa, setTuKhoa] = useState("");
  const [q, setQ] = useState("");
  const [doiTuong, setDoiTuong] = useState<FAQ["doiTuong"]>(tvv ? "tu-van-vien" : "tat-ca");
  const faqs = useMemo(() => {
    const k = bo(q.trim());
    return data.faqs
      .filter((f) => f.trang === "lien-he" && f.trangThai === "da-xuat-ban")
      .filter((f) => doiTuong === "tat-ca" || f.doiTuong === "tat-ca" || f.doiTuong === doiTuong)
      .filter((f) => !k || bo(f.cauHoi).includes(k) || bo(f.traLoi).includes(k))
      .sort((a, b) => a.thuTu - b.thuTu);
  }, [data.faqs, doiTuong, q]);
  const demDoiTuong = (v: FAQ["doiTuong"]) => data.faqs.filter((f) => f.trang === "lien-he" && f.trangThai === "da-xuat-ban" && (v === "tat-ca" || f.doiTuong === "tat-ca" || f.doiTuong === v)).length;

  // Form gửi tin nhắn
  const [banLa, setBanLa] = useState<ContactMessage["banLa"]>(tvv ? "tu-van-vien" : "khach-hang");
  const [hoTen, setHoTen] = useState(tvv?.hoTen ?? "");
  const [lienHe, setLienHe] = useState(tvv?.email ?? "");
  const [chuDe, setChuDe] = useState(CHU_DE[0]);
  const [noiDung, setNoiDung] = useState("");
  const [dinhKem, setDinhKem] = useState("");
  const [dongY, setDongY] = useState(true);
  const [loi, setLoi] = useState<Record<string, string>>({});
  const [daGui, setDaGui] = useState<string | null>(null);

  const gui = () => {
    const e: Record<string, string> = {};
    if (!hoTen.trim()) e.hoTen = "Nhập họ tên của bạn.";
    const lh = lienHe.trim();
    if (!lh) e.lienHe = "Nhập email hoặc số điện thoại để Chubb Life trả lời.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lh) && !/^0\d{9}$/.test(lh.replace(/\s/g, ""))) e.lienHe = "Email chưa đúng định dạng hoặc số điện thoại chưa đủ 10 số.";
    if (!noiDung.trim()) e.noiDung = "Nhập nội dung cần hỗ trợ.";
    else if (noiDung.length > MAX_ND) e.noiDung = `Nội dung tối đa ${MAX_ND.toLocaleString("vi-VN")} ký tự.`;
    if (!dongY) e.dongY = "Bạn cần đồng ý để Chubb Life liên hệ lại.";
    setLoi(e);
    if (Object.keys(e).length) return;
    const so = data.contactMessages.reduce((m, x) => Math.max(m, parseInt(x.id.replace(/\D/g, ""), 10) || 0), 0) + 1;
    const id = `CL-${String(so).padStart(4, "0")}`;
    const tn: ContactMessage = { id, banLa, hoTen: hoTen.trim(), lienHe: lh, chuDe, noiDung: noiDung.trim(), dinhKem: dinhKem || undefined, dongYLienHe: dongY, gui: new Date().toISOString(), trangThai: "chua-xem" };
    actions.update("contactMessages", (list) => [tn, ...list]);
    setDaGui(id);
    setNoiDung(""); setDinhKem("");
  };

  return (
    <div className="wrap py-10">
      <Breadcrumb items={[{ label: "Trang chủ", href: R.A01 }, { label: "Liên hệ & trợ giúp" }]} />
      <H1 className="mt-3 text-[34px]">Liên hệ & trợ giúp</H1>
      <Muted className="mt-3 text-[16px] max-w-[760px]">Gửi câu hỏi cho Chubb Life hoặc tìm câu trả lời có sẵn bên dưới — dành cho khách hàng, ứng viên và tư vấn viên.</Muted>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
        {/* Cột trái: FAQ */}
        <div>
          <form className="flex gap-3" onSubmit={(e) => { e.preventDefault(); setQ(tuKhoa); }}>
            <Input value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} placeholder="Bạn cần giúp gì? (vd: tìm tư vấn viên, hồ sơ ứng tuyển)" aria-label="Tìm câu hỏi" className="h-11" />
            <Button type="submit" kind="secondary">Tìm</Button>
          </form>
          <div className="mt-4">
            <FilterChips value={doiTuong} onChange={setDoiTuong} options={[
              { value: "tat-ca", label: "Tất cả", count: demDoiTuong("tat-ca") },
              { value: "khach-hang", label: "Khách hàng", count: demDoiTuong("khach-hang") },
              { value: "ung-vien", label: "Ứng viên", count: demDoiTuong("ung-vien") },
              { value: "tu-van-vien", label: "Tư vấn viên", count: demDoiTuong("tu-van-vien") },
            ]} />
          </div>
          <H2 className="mt-8 mb-4 text-[20px]">Câu hỏi thường gặp</H2>
          <FaqAccordion items={faqs} openFirst emptyTitle={q ? `Không có câu hỏi nào khớp “${q}”` : "Chưa có câu hỏi cho đối tượng này"} emptyDesc="Gửi tin nhắn ở cột phải hoặc gọi hotline." />
          <Muted className="mt-6 text-[13.5px]">Vẫn chưa được giải đáp? Gửi tin nhắn ở cột phải hoặc gọi hotline.</Muted>
        </div>

        {/* Cột phải */}
        <div className="space-y-6">
          <Card className="p-4 sm:p-5">
            <div className="font-bold text-[15px] text-den">Liên hệ Chubb Life</div>
            <dl className="mt-4 space-y-4 text-[14px]">
              <div><dt className="text-[12px] text-ink2">Hotline</dt><dd><button type="button" className="font-bold text-den hover:text-blue text-left" onClick={() => flash(`Đang gọi ${HOTLINE}…`)}>{HOTLINE}  (8h–17h30, thứ Hai – thứ Sáu)</button></dd></div>
              <div><dt className="text-[12px] text-ink2">Email</dt><dd><button type="button" className="font-bold text-den hover:text-blue" onClick={() => flash(`Đã mở ứng dụng email tới ${EMAIL_CHUBB}`)}>{EMAIL_CHUBB}</button></dd></div>
              <div><dt className="text-[12px] text-ink2">Zalo OA Chubb Life</dt><dd><button type="button" className="font-bold text-blue" onClick={() => flash("Đã mở Zalo OA Chubb Life")}>Chat với đội hỗ trợ</button></dd></div>
              <div><dd className="text-[13px] text-ink2">Trụ sở: TP. Hồ Chí Minh · <button type="button" className="text-blue font-bold" onClick={() => flash("Đã mở bản đồ trụ sở Chubb Life")}>Xem bản đồ</button></dd></div>
            </dl>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="font-bold text-[15px] text-den">Gửi tin nhắn cho Chubb Life</div>
            <div className="mt-4 space-y-4">
              <Field label="Bạn là"><Select value={banLa} onChange={(e) => setBanLa(e.target.value as ContactMessage["banLa"])}>{BAN_LA.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}</Select></Field>
              <Field label="Họ tên" error={loi.hoTen}><Input value={hoTen} onChange={(e) => setHoTen(e.target.value)} placeholder="Nguyễn Văn A" /></Field>
              <Field label="Email hoặc số điện thoại" error={loi.lienHe}><Input value={lienHe} onChange={(e) => setLienHe(e.target.value)} placeholder="vana@gmail.com" /></Field>
              <Field label="Chủ đề"><Select value={chuDe} onChange={(e) => setChuDe(e.target.value)}>{CHU_DE.map((c) => <option key={c}>{c}</option>)}</Select></Field>
              <Field label={`Nội dung (≤ ${MAX_ND.toLocaleString("vi-VN")} ký tự)`} count={`${noiDung.length.toLocaleString("vi-VN")}/${MAX_ND.toLocaleString("vi-VN")}`} error={loi.noiDung}>
                <Textarea value={noiDung} onChange={(e) => setNoiDung(e.target.value.slice(0, MAX_ND))} placeholder="Tôi muốn được tư vấn về…" className="min-h-[120px]" />
              </Field>
              <label className="flex items-center gap-2 text-[13px] text-ink2 cursor-pointer">
                <span aria-hidden>📎</span>
                <span className="text-blue font-bold">{dinhKem ? dinhKem : "Đính kèm ảnh (tuỳ chọn)"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setDinhKem(e.target.files?.[0]?.name ?? "")} />
                {dinhKem && <button type="button" className="text-mut hover:text-den" onClick={() => setDinhKem("")} aria-label="Bỏ tệp đính kèm">✕</button>}
              </label>
              <div>
                <Checkbox label="Tôi đồng ý để Chubb Life liên hệ lại theo thông tin trên." checked={dongY} onChange={(e) => setDongY(e.target.checked)} />
                {loi.dongY && <div className="text-[12px] text-red-fg mt-1">{loi.dongY}</div>}
              </div>
              <Button className="w-full" onClick={gui}>Gửi tin nhắn</Button>
              {daGui && <div className="bg-green-bg text-green-fg rounded-sm px-3 py-2 text-[12.5px] font-bold">Đã gửi · mã #{daGui} · Chubb Life trả lời qua email trong 1 ngày làm việc</div>}
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="font-bold text-[15px] text-den">Bạn là Tư vấn viên Chubb Life?</div>
            <Muted className="mt-2 text-[13px]">Hotline TVV {HOTLINE} · {EMAIL_TVV}</Muted>
            <div className="mt-4">
              {tvv ? <Button kind="secondary" className="w-full" href={R.G02a}>Vào Trang cá nhân</Button> : <Button kind="secondary" className="w-full" href={R.G01}>Đăng nhập Trang cá nhân</Button>}
            </div>
          </Card>
        </div>
      </div>
      {node}
    </div>
  );
}
