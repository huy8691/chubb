"use client";
/* eslint-disable react-hooks/static-components -- component trình bày cục bộ, không giữ state; đủ cho demo */
/**
 * E04 · Trang cá nhân › Danh thiếp của tôi — chỉnh sửa.
 * Bước 1 thông tin cá nhân · Bước 2 dấu ấn · Bước 3 hồ sơ năng lực · cột phải xem trước thẻ (cập nhật ngay khi nhập).
 * Lưu và xuất bản ghi thẳng vào advisors — hồ sơ hiện ngay trên danh thiếp công khai, không có bước duyệt.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import type { Advisor } from "@/lib/types";
import { Button, Card, Checkbox, Chip, Field, Input, Modal, Radio, Select, Textarea, cx, useFlash } from "@/components/ui";

const VAI_TRO = ["Chuyên gia hoạch định tài chính", "Người đồng hành cùng gia đình trẻ", "Chuyên gia bảo vệ thu nhập", "Người bạn của khách hàng lâu năm"];
const LINH_VUC = ["Bảo vệ gia đình", "Kế hoạch cho con", "Hoạch định tài chính", "Chuẩn bị hưu trí", "Doanh nghiệp", "Sức khoẻ"];
const CHUNG_CHI = ["Chứng chỉ đại lý bảo hiểm", "MDRT", "Chubb Star", "CFP"];
const VAN_PHONG = ["TP. Hồ Chí Minh — Q.1", "Hà Nội — Cầu Giấy", "Đà Nẵng — Hải Châu", "Cần Thơ — Ninh Kiều", "Hải Phòng — Lê Chân"];
const MAX_GIOI_THIEU = 280;

type Moc = { nam: string; tieuDe: string; moTa: string };
type CamNhan = { ten: string; khuVuc: string; trichDan: string };

function formTu(a: Advisor) {
  const hs = a.hoSoNangLuc;
  return {
    hoTen: a.hoTen, avatar: a.avatar ?? "", chucDanh: a.chucDanh, soDienThoai: a.soDienThoai, zalo: a.zalo ?? "", email: a.email, vanPhong: a.vanPhong,
    vaiTro: hs?.vaiTro ?? "", gioiThieu: hs?.gioiThieu ?? "",
    theManh: hs?.theManh ?? [], namKinhNghiem: hs?.namKinhNghiem?.toString() ?? "", namMDRT: hs?.namMDRT?.toString() ?? "", chungChi: hs?.chungChi ?? [],
    hanhTrinh: (hs?.hanhTrinh ?? []) as Moc[],
    camNhan: (hs?.chungMinh ?? []).map((c) => { const [ten, ...kv] = c.ten.split(", "); return { ten, khuVuc: kv.join(", "), trichDan: c.trichDan }; }) as CamNhan[],
    hienPhan: hs?.hienPhan ?? { hanhTrinh: true, nhanXet: true, linhVuc: true, google: false },
  };
}
type Form = ReturnType<typeof formTu>;

export default function Page() {
  const router = useRouter();
  const { data, actions } = useStore();
  const tvv = useCurrentAdvisor();
  const { flash, node } = useFlash();
  const [f, setF] = useState<Form | null>(null);
  const [loi, setLoi] = useState<Record<string, string>>({});
  const [xemTruoc, setXemTruoc] = useState(false);
  if (!tvv) return null;
  const form = f ?? formTu(tvv);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF({ ...form, [k]: v });

  const bxh = [...data.ranking].filter((r) => data.advisors.find((a) => a.ma === r.advisorMa)?.hienTrenBXH).sort((a, b) => b.luotDuocTinh - a.luotDuocTinh);
  const hang = bxh.findIndex((r) => r.advisorMa === tvv.ma) + 1;
  const url = `chubblife.vn/${tvv.ma}`;

  const kiemTra = () => {
    const e: Record<string, string> = {};
    if (!form.hoTen.trim()) e.hoTen = "Nhập họ và tên";
    if (!/^0\d{9}$/.test(form.soDienThoai.replace(/\s/g, ""))) e.soDienThoai = "Số điện thoại gồm 10 số, bắt đầu bằng 0";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Email không hợp lệ";
    if (form.gioiThieu.length > MAX_GIOI_THIEU) e.gioiThieu = `Tối đa ${MAX_GIOI_THIEU} ký tự`;
    setLoi(e);
    return Object.keys(e).length === 0;
  };
  const luu = () => {
    if (!kiemTra()) { flash("Còn ô chưa hợp lệ — kiểm tra lại các dòng đỏ"); return; }
    actions.update("advisors", (l) => l.map((a) => a.ma !== tvv.ma ? a : {
      ...a, hoTen: form.hoTen.trim(), avatar: form.avatar || undefined, chucDanh: form.chucDanh, soDienThoai: form.soDienThoai, zalo: form.zalo || undefined, email: form.email, vanPhong: form.vanPhong,
      hoSoNangLuc: {
        ...a.hoSoNangLuc, gioiThieu: form.gioiThieu, theManh: form.theManh, chungChi: form.chungChi, vaiTro: form.vaiTro || undefined,
        namKinhNghiem: form.namKinhNghiem ? Number(form.namKinhNghiem) : undefined, namMDRT: form.namMDRT ? Number(form.namMDRT) : undefined,
        noiBat: [form.namKinhNghiem && `${form.namKinhNghiem} năm kinh nghiệm`, form.namMDRT && `${form.namMDRT} năm liên tiếp MDRT`, form.chungChi[0]].filter(Boolean) as string[],
        hanhTrinh: form.hanhTrinh.filter((m) => m.nam || m.tieuDe), chungMinh: form.camNhan.filter((c) => c.trichDan).map((c) => ({ trichDan: c.trichDan, ten: [c.ten, c.khuVuc].filter(Boolean).join(", ") })),
        hienPhan: form.hienPhan, capNhat: new Date().toISOString(),
      },
    }));
    setF(null);
    flash("Đã lưu — thay đổi hiện ngay trên danh thiếp công khai");
  };
  const chipToggle = (list: string[], v: string, max?: number) => list.includes(v) ? list.filter((x) => x !== v) : max && list.length >= max ? list : [...list, v];
  const noiBat = [form.namKinhNghiem && `${form.namKinhNghiem} năm kinh nghiệm`, form.namMDRT && `${form.namMDRT} năm liên tiếp MDRT`].filter(Boolean) as string[];

  const The = () => (
    <div className="bg-white border border-vien rounded-sm p-6">
      <div className="aspect-[4/3] bg-xam rounded-sm overflow-hidden flex items-center justify-center text-mut text-[12px]">{form.avatar ? <img src={form.avatar} alt="Ảnh chân dung" className="w-full h-full object-cover" /> : "Ảnh chân dung"}</div>
      <div className="mt-5 font-serif font-semibold text-[22px] text-den uppercase leading-tight">{form.hoTen || "Họ và tên"}</div>
      <div className="text-[13px] text-ink2 mt-1">{form.chucDanh}{tvv.danhHieu[0] ? ` · ${tvv.danhHieu[0]!.ten}` : ""}</div>
      <div className="mt-4 space-y-1.5 text-[13px] text-den"><div>{form.soDienThoai}</div><div>{form.email}</div><div>VP Chubb Life · {form.vanPhong}</div></div>
      {noiBat.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{noiBat.map((n) => <Chip key={n} tone="blue">{n}</Chip>)}</div>}
      <div className="mt-5 flex gap-3"><Button size="sm" onClick={() => flash("Đã mở Zalo")}>Kết nối Zalo</Button><Button kind="secondary" size="sm" onClick={() => flash(`Đang gọi ${form.soDienThoai}`)}>Gọi điện</Button></div>
      <div className="mt-5 flex items-center gap-3 text-[12px] text-ink2">
        <div className="size-14 shrink-0 border border-vien rounded-sm flex items-center justify-center text-[10px] font-bold text-mut">QR</div>
        <div>Danh thiếp công khai tại {url}<br /><button type="button" className="text-blue font-bold" onClick={() => { try { navigator.clipboard?.writeText(`https://${url}`); } catch {} flash("Đã sao chép link danh thiếp"); }}>Sao chép link</button></div>
      </div>
    </div>
  );

  const Step = ({ title, children }: { title: string; children: React.ReactNode }) => <section><h2 className="font-serif font-semibold text-[18px] text-den uppercase mb-5">{title}</h2>{children}</section>;

  return (
    <div>
      {node}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3"><h2 className="font-serif font-semibold text-[18px] text-den">Lượt xem danh thiếp tháng này: {tvv.luotXemThangNay ?? 0}</h2>{tvv.theCongKhai ? <Chip tone="green">Đang hiện</Chip> : <Chip tone="grey">Tạm ẩn</Chip>}</div>
          <div className="text-[12.5px] text-ink2 mt-1">Lượt chia sẻ được tính tháng này: {tvv.luotChiaSeThangNay} · Hạng {hang || "—"}/{bxh.length} Tư vấn viên · <Link href={R.S03} className="text-blue font-bold">Cách đếm</Link>{!tvv.theCongKhai && <> · <Link href={R.G06} className="text-blue font-bold">Bật hiện thẻ ở Tài khoản & cài đặt</Link></>}</div>
        </div>
        <Button kind="secondary" onClick={() => window.open(R.E03(tvv.ma), "_blank")}>Xem danh thiếp của tôi</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-10">
        <div className="space-y-12">
          <Step title="Bước 1 — Thông tin cá nhân">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Họ và tên" error={loi.hoTen}><Input value={form.hoTen} onChange={(e) => set("hoTen", e.target.value)} /></Field>
              <Field label="Mã số Tư vấn viên" hint="Do Chubb cấp — không sửa được"><Input value={tvv.ma} disabled /></Field>
              <Field label="Ảnh chân dung" className="md:col-span-2">
                <div className="border border-dashed border-vien rounded-sm p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-sm bg-xam overflow-hidden flex items-center justify-center text-[11px] text-mut">{form.avatar ? <img src={form.avatar} alt="" className="w-full h-full object-cover" /> : "Ảnh"}</div>
                    <span className="text-[12.5px] text-ink2">Kéo thả ảnh vào đây · JPG/PNG · tỉ lệ 4:3</span>
                  </div>
                  <div className="flex gap-2">
                    <Button kind="secondary" size="sm" onClick={() => { set("avatar", `/img/tvv-av-${1 + (Number(tvv.ma) % 6)}.png`); flash("Đã tải ảnh lên"); }}>Tải file lên</Button>
                    {form.avatar && <Button kind="ghost" size="sm" onClick={() => set("avatar", "")}>Bỏ ảnh</Button>}
                  </div>
                </div>
              </Field>
              <Field label="Chức danh"><Input value={form.chucDanh} onChange={(e) => set("chucDanh", e.target.value)} /></Field>
              <Field label="Số điện thoại" error={loi.soDienThoai}><Input value={form.soDienThoai} onChange={(e) => set("soDienThoai", e.target.value)} /></Field>
              <Field label="Zalo" hint="Để trống nếu dùng chung số điện thoại"><Input value={form.zalo} onChange={(e) => set("zalo", e.target.value)} placeholder={form.soDienThoai} /></Field>
              <Field label="Email" error={loi.email}><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
              <Field label="Địa chỉ văn phòng" className="md:col-span-2"><Select value={form.vanPhong} onChange={(e) => set("vanPhong", e.target.value)}>{[form.vanPhong, ...VAN_PHONG].filter((v, i, a) => a.indexOf(v) === i).map((v) => <option key={v}>{v}</option>)}</Select></Field>
            </div>
          </Step>

          <Step title="Bước 2 — Tạo dấu ấn của tôi">
            <div className="font-bold text-[16px] text-den mb-3">Tôi muốn được nhớ đến với vai trò gì?</div>
            <div className="space-y-2.5 mb-6">{VAI_TRO.map((v) => <Radio key={v} name="vaiTro" label={v} checked={form.vaiTro === v} onChange={() => set("vaiTro", v)} />)}</div>
            <Field label="Giới thiệu ngắn về bạn" count={`${form.gioiThieu.length}/${MAX_GIOI_THIEU}`} error={loi.gioiThieu}>
              <Textarea value={form.gioiThieu} onChange={(e) => set("gioiThieu", e.target.value)} placeholder="Viết 2–3 câu về cách bạn đồng hành với khách hàng…" />
            </Field>
          </Step>

          <Step title="Bước 3 — Hồ sơ năng lực">
            <div className="space-y-7">
              <div>
                <div className="text-[12.5px] text-ink2 mb-2">Lĩnh vực chuyên môn · chọn tối đa 4 từ danh mục Chubb</div>
                <div className="flex flex-wrap gap-2">{LINH_VUC.map((v) => <button key={v} type="button" onClick={() => set("theManh", chipToggle(form.theManh, v, 4))} className={cx("h-8 px-3 rounded-sm text-[13px] border", form.theManh.includes(v) ? "bg-blue text-white border-blue font-bold" : "bg-white text-den border-vien hover:border-blue")}>{v}</button>)}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 max-w-[560px]">
                <Field label="Năm kinh nghiệm"><Input type="number" min={0} max={50} value={form.namKinhNghiem} onChange={(e) => set("namKinhNghiem", e.target.value)} /></Field>
                <Field label="Năm liên tiếp MDRT"><Input type="number" min={0} max={40} value={form.namMDRT} onChange={(e) => set("namMDRT", e.target.value)} /></Field>
                <Field label="Chứng chỉ · chọn"><Select value="" onChange={(e) => { if (e.target.value) set("chungChi", chipToggle(form.chungChi, e.target.value)); }}><option value="">Thêm chứng chỉ ▾</option>{CHUNG_CHI.filter((c) => !form.chungChi.includes(c)).map((c) => <option key={c}>{c}</option>)}</Select></Field>
              </div>
              {form.chungChi.length > 0 && <div className="flex flex-wrap gap-2 -mt-3">{form.chungChi.map((c) => <span key={c} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-sm bg-blue-soft text-blue text-[13px] font-bold">{c}<button type="button" aria-label={`Bỏ ${c}`} onClick={() => set("chungChi", chipToggle(form.chungChi, c))}>✕</button></span>)}</div>}

              <div>
                <div className="text-[12.5px] text-ink2 mb-2">Hành trình nghề nghiệp · tối đa 4 mốc (năm · tiêu đề · 1 câu)</div>
                <div className="space-y-2">
                  {form.hanhTrinh.map((m, i) => (
                    <div key={i} className="grid grid-cols-[80px_200px_1fr_auto] gap-2">
                      <Input value={m.nam} placeholder="Năm" onChange={(e) => set("hanhTrinh", form.hanhTrinh.map((x, k) => k === i ? { ...x, nam: e.target.value } : x))} />
                      <Input value={m.tieuDe} placeholder="Tiêu đề" onChange={(e) => set("hanhTrinh", form.hanhTrinh.map((x, k) => k === i ? { ...x, tieuDe: e.target.value } : x))} />
                      <Input value={m.moTa} placeholder="Mô tả 1 câu…" onChange={(e) => set("hanhTrinh", form.hanhTrinh.map((x, k) => k === i ? { ...x, moTa: e.target.value } : x))} />
                      <button type="button" aria-label="Xoá mốc" onClick={() => set("hanhTrinh", form.hanhTrinh.filter((_, k) => k !== i))} className="text-mut hover:text-red-fg px-2">✕</button>
                    </div>
                  ))}
                </div>
                {form.hanhTrinh.length < 4 && <Button kind="secondary" size="sm" className="mt-3" onClick={() => set("hanhTrinh", [...form.hanhTrinh, { nam: "", tieuDe: "", moTa: "" }])}>+ Thêm mốc</Button>}
              </div>

              <div>
                <div className="text-[12.5px] text-ink2 mb-2">Cảm nhận khách hàng · tối đa 3 · tên viết tắt · khu vực · trích dẫn</div>
                <div className="space-y-2">
                  {form.camNhan.map((c, i) => (
                    <div key={i} className="grid grid-cols-[100px_120px_1fr_auto] gap-2">
                      <Input value={c.ten} placeholder="Chị H." onChange={(e) => set("camNhan", form.camNhan.map((x, k) => k === i ? { ...x, ten: e.target.value } : x))} />
                      <Input value={c.khuVuc} placeholder="Quận 7" onChange={(e) => set("camNhan", form.camNhan.map((x, k) => k === i ? { ...x, khuVuc: e.target.value } : x))} />
                      <Input value={c.trichDan} placeholder="Trích dẫn…" onChange={(e) => set("camNhan", form.camNhan.map((x, k) => k === i ? { ...x, trichDan: e.target.value } : x))} />
                      <button type="button" aria-label="Xoá cảm nhận" onClick={() => set("camNhan", form.camNhan.filter((_, k) => k !== i))} className="text-mut hover:text-red-fg px-2">✕</button>
                    </div>
                  ))}
                </div>
                {form.camNhan.length < 3 && <Button kind="secondary" size="sm" className="mt-3" onClick={() => set("camNhan", [...form.camNhan, { ten: "", khuVuc: "", trichDan: "" }])}>+ Thêm cảm nhận</Button>}
              </div>

              <Card className="p-5">
                <div className="font-bold text-[14px] text-den mb-3">Hiện từng phần trên trang công khai</div>
                <div className="space-y-3">
                  <Checkbox label="Hành trình nghề nghiệp" checked={form.hienPhan.hanhTrinh} onChange={(e) => set("hienPhan", { ...form.hienPhan, hanhTrinh: e.target.checked })} />
                  <Checkbox label="Nhận xét khách hàng" checked={form.hienPhan.nhanXet} onChange={(e) => set("hienPhan", { ...form.hienPhan, nhanXet: e.target.checked })} />
                  <Checkbox label="Lĩnh vực chuyên môn" checked={form.hienPhan.linhVuc} onChange={(e) => set("hienPhan", { ...form.hienPhan, linhVuc: e.target.checked })} />
                  <Checkbox label="Cho phép trang xuất hiện trên Google (mặc định tắt)" checked={form.hienPhan.google} onChange={(e) => set("hienPhan", { ...form.hienPhan, google: e.target.checked })} />
                </div>
              </Card>
            </div>
          </Step>

          <div className="flex flex-wrap gap-3 pt-6 border-t border-vien2">
            <Button onClick={luu}>Lưu và xuất bản</Button>
            <Button kind="secondary" onClick={() => setXemTruoc(true)}>Xem trước</Button>
            <Button kind="secondary" onClick={() => flash("Đã tải mã QR (PNG)")}>Tải mã QR (PNG)</Button>
            <Button kind="secondary" onClick={() => flash("Đã tải ảnh thẻ (PNG)")}>Tải ảnh thẻ (PNG)</Button>
            <Button kind="secondary" onClick={() => { setF(null); setLoi({}); router.push(R.G02a); }}>Huỷ</Button>
            <Button kind="secondary" onClick={() => flash("Đã lưu nháp — danh thiếp công khai chưa đổi")}>Lưu nháp</Button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 self-start">
          <div className="text-[14px] font-bold text-den uppercase mb-3">Xem trước</div>
          <The />
          <div className="text-[12.5px] text-ink2 mt-3">Cập nhật ngay khi bạn nhập</div>
        </aside>
      </div>

      <Modal open={xemTruoc} onClose={() => setXemTruoc(false)} title="Xem trước danh thiếp" width={480} footer={<><Button kind="secondary" onClick={() => setXemTruoc(false)}>Đóng</Button><Button onClick={() => window.open(R.E03(tvv.ma), "_blank")}>Xem đầy đủ</Button></>}>
        <The />
      </Modal>
    </div>
  );
}
