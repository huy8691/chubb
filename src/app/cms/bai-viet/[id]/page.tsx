"use client";
/**
 * H06 · CMS — Soạn / sửa bài viết (id "moi" = bài mới).
 * Khối 1 Nội dung (tiêu đề ≤ 90 · chuyên đề · tác giả · sapo ≤ 280 · thân bài markdown với thanh công cụ · ảnh trong bài có alt)
 * Khối 2 SEO — Google & chia sẻ (tiêu đề trang 30–60 · mô tả trang 120–160 · đường dẫn tự sinh · ảnh chia sẻ 1200×630 · ☑ Google lập chỉ mục)
 * Cột phải: trạng thái · lưu gần nhất · lịch sử phiên bản · ảnh đại diện 16:9 + alt · xem trước Google · xem trước Zalo/Facebook
 * Hàng nút: Lưu nháp · Xem trước (F02 ?preview=1, tab mới) · Xuất bản ▾ (ngay / lên lịch) · Gỡ xuất bản · Huỷ → H04.
 */
import { useRouter } from "next/navigation";
import { use, useMemo, useRef, useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentCmsUser, useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/seed";
import type { Article } from "@/lib/types";
import { Button, Checkbox, Chip, Field, Input, Modal, Select, StatusChip, Textarea, cx, useFlash } from "@/components/ui";
import { CmsCard, CmsFormActions, CmsHeader } from "@/components/cms/CmsShell";
import { mauBoDem, slugify } from "@/components/thu-vien/helpers";

const IMGS = ["/img/bai-1.jpg", "/img/bai-2.jpg", "/img/bai-3.jpg", "/img/bai-4.jpg", "/img/bai-lon.jpg", "/img/f01-bai-1.jpg", "/img/f01-bai-3.jpg", "/img/f01-bai-4.jpg", "/img/f01-bai-5.jpg", "/img/f01-bai-6.jpg", "/img/f01-bai-7.jpg", "/img/f01-bai-8.jpg", "/img/f02-anh.jpg", "/img/f02-hero.jpg"];
const TAC_GIA = ["Ban biên tập Toàn Tâm", "Chubb Life Việt Nam", "Trần Thu Hà", "P2P Content"];
const DOMAIN = "ecard.baohiemchubblife.vn";

const trong = (cdId: string): Article => ({
  id: "", slug: "", tieuDe: "", sapo: "", thanBai: "", chuyenDeId: cdId, tacGia: TAC_GIA[0], anh: IMGS[0], altAnh: "",
  trangThai: "nhap", seo: { tieuDe: "", moTa: "", duongDan: "", choGoogle: true }, capNhat: new Date().toISOString(), luotXem: 0,
});

/** Thanh công cụ thân bài — mỗi nút chèn ký hiệu markdown vào vị trí con trỏ */
const TOOLS: { label: string; title: string; wrap?: [string, string]; line?: string; block?: string }[] = [
  { label: "B", title: "Đậm", wrap: ["**", "**"] },
  { label: "I", title: "Nghiêng", wrap: ["*", "*"] },
  { label: "H2", title: "Tiêu đề mục", line: "## " },
  { label: "H3", title: "Tiêu đề phụ", line: "### " },
  { label: "• Danh sách", title: "Danh sách", line: "- " },
  { label: "1. Số", title: "Danh sách số", line: "1. " },
  { label: "“ ” Trích dẫn", title: "Trích dẫn", line: "> " },
  { label: "▣ Ảnh", title: "Ảnh trong bài (có mô tả alt)", block: "IMG" },
  { label: "🔗 Liên kết", title: "Liên kết", wrap: ["[", "](https://)"] },
  { label: "▤ Bảng", title: "Bảng", block: "| Cột 1 | Cột 2 |\n| --- | --- |\n| Ô | Ô |" },
  { label: "❓ Hỏi & đáp", title: "Hỏi & đáp", block: "### Câu hỏi?\n\nTrả lời." },
];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, ready, actions } = useStore();
  const user = useCurrentCmsUser();
  const { flash, node } = useFlash();
  const isNew = id === "moi";
  const cds = useMemo(() => [...data.chuyenDe].sort((a, b) => a.thuTu - b.thuTu), [data.chuyenDe]);

  const [f, setF] = useState<Article | null>(null);
  const [slugTuSua, setSlugTuSua] = useState(false);
  const [seoTuSua, setSeoTuSua] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [luuGanNhat, setLuuGanNhat] = useState<string | undefined>(undefined);
  const [imgPicker, setImgPicker] = useState<"dai-dien" | "chia-se" | "trong-bai" | null>(null);
  const [altTrongBai, setAltTrongBai] = useState("");
  const [pubMenu, setPubMenu] = useState(false);
  const [lenLich, setLenLich] = useState<string | null>(null);
  const [lichSu, setLichSu] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Nạp form một lần khi store sẵn sàng (điều chỉnh state trong lúc render — không dùng effect)
  const [daNap, setDaNap] = useState(false);
  if (ready && !daNap) {
    setDaNap(true);
    if (isNew) setF(trong(cds[0]?.id ?? ""));
    else {
      const a = data.articles.find((x) => x.id === id);
      if (a) { setF({ ...a, seo: { ...a.seo } }); setSlugTuSua(true); setSeoTuSua(true); setLuuGanNhat(a.capNhat); }
    }
  }

  if (!ready || !daNap) return null;
  if (!f) return <CmsCard><div className="text-ink2">Không tìm thấy bài viết. <button type="button" className="text-blue font-bold" onClick={() => router.push(R.H04)}>Về danh sách</button></div></CmsCard>;

  const canPublish = user?.vai === "admin";
  const set = (patch: Partial<Article>) => setF({ ...f, ...patch });
  const setSeo = (patch: Partial<Article["seo"]>) => setF({ ...f, seo: { ...f.seo, ...patch } });
  const onTieuDe = (v: string) => {
    const slug = slugTuSua ? f.slug : slugify(v);
    setF({ ...f, tieuDe: v, slug, seo: { ...f.seo, duongDan: R.F02(slug), tieuDe: seoTuSua ? f.seo.tieuDe : v.slice(0, 60) } });
  };
  const onSapo = (v: string) => setF({ ...f, sapo: v, seo: { ...f.seo, moTa: seoTuSua ? f.seo.moTa : v.slice(0, 160) } });

  const insert = (t: (typeof TOOLS)[number]) => {
    if (t.block === "IMG") { setAltTrongBai(""); setImgPicker("trong-bai"); return; }
    const ta = bodyRef.current; if (!ta) return;
    const s = ta.selectionStart ?? f.thanBai.length, e = ta.selectionEnd ?? s;
    const sel = f.thanBai.slice(s, e);
    let ins = "";
    if (t.wrap) ins = t.wrap[0] + (sel || "chữ") + t.wrap[1];
    else if (t.line) ins = (s > 0 && f.thanBai[s - 1] !== "\n" ? "\n" : "") + t.line + (sel || "");
    else if (t.block) ins = "\n\n" + t.block + "\n\n";
    set({ thanBai: f.thanBai.slice(0, s) + ins + f.thanBai.slice(e) });
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + ins.length, s + ins.length); });
  };
  const chonAnh = (src: string) => {
    if (imgPicker === "dai-dien") set({ anh: src });
    else if (imgPicker === "chia-se") setSeo({ anhChiaSe: src });
    else if (imgPicker === "trong-bai") {
      const ta = bodyRef.current; const s = ta?.selectionStart ?? f.thanBai.length;
      const ins = `\n\n![${altTrongBai.trim() || "Ảnh trong bài"}](${src})\n\n`;
      set({ thanBai: f.thanBai.slice(0, s) + ins + f.thanBai.slice(s) });
    }
    setImgPicker(null);
  };

  const validate = (publishing: boolean) => {
    const e: Record<string, string> = {};
    if (!f.tieuDe.trim()) e.tieuDe = "Nhập tiêu đề bài viết.";
    else if (f.tieuDe.length > 90) e.tieuDe = "Tiêu đề tối đa 90 ký tự.";
    if (f.sapo.length > 280) e.sapo = "Sapo tối đa 280 ký tự.";
    if (!f.chuyenDeId) e.chuyenDe = "Chọn chuyên đề.";
    if (publishing) {
      if (!f.sapo.trim()) e.sapo = "Bài xuất bản cần sapo.";
      if (!f.thanBai.trim()) e.thanBai = "Bài xuất bản cần thân bài.";
      if (!f.altAnh.trim()) e.altAnh = "Nhập mô tả ảnh đại diện.";
      if (f.seo.tieuDe.length > 60) e.seoTieuDe = "Tiêu đề trang tối đa 60 ký tự.";
      if (f.seo.moTa.length > 160) e.seoMoTa = "Mô tả trang tối đa 160 ký tự.";
    }
    const slug = slugify(f.slug || f.tieuDe);
    if (!slug) e.slug = "Đường dẫn không hợp lệ.";
    else if (data.articles.some((x) => x.slug === slug && x.id !== f.id)) e.slug = "Đường dẫn đã có bài khác dùng.";
    setErr(e);
    return Object.keys(e).length === 0 ? slug : null;
  };

  /** Ghi vào store; trả về bài đã lưu (để Xem trước dùng slug/ id) */
  const persist = (patch: Partial<Article>, slug: string): Article => {
    const now = new Date().toISOString();
    const saved: Article = { ...f, ...patch, slug, seo: { ...f.seo, duongDan: R.F02(slug), tieuDe: f.seo.tieuDe || f.tieuDe.slice(0, 60), moTa: f.seo.moTa || f.sapo.slice(0, 160) }, capNhat: now, id: f.id || `bv${Date.now()}` };
    actions.update("articles", (list) => (list.some((x) => x.id === saved.id) ? list.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...list]));
    setF(saved); setLuuGanNhat(now);
    if (isNew) router.replace(R.H06(saved.id));
    return saved;
  };

  const luuNhap = () => { const slug = validate(false); if (!slug) return; persist({ trangThai: f.trangThai === "da-xuat-ban" ? "da-xuat-ban" : "nhap" }, slug); flash("Đã lưu nháp"); };
  const xemTruoc = () => { const slug = validate(false); if (!slug) return; const s = persist({}, slug); window.open(`${R.F02(s.slug)}?preview=1`, "_blank"); };
  const xuatBanNgay = () => { setPubMenu(false); const slug = validate(true); if (!slug) return; persist({ trangThai: "da-xuat-ban", ngayXuatBan: new Date().toISOString().slice(0, 10), ngayLenLich: undefined }, slug); flash("Đã xuất bản — bài hiện trên Thư viện"); };
  const xacNhanLenLich = () => { if (!lenLich) return; const slug = validate(true); if (!slug) { setLenLich(null); return; } persist({ trangThai: "da-len-lich", ngayLenLich: lenLich, ngayXuatBan: undefined }, slug); setLenLich(null); flash(`Đã lên lịch xuất bản ${new Date(lenLich).toLocaleDateString("vi-VN")}`); };
  const goXuatBan = () => { const slug = validate(false); if (!slug) return; persist({ trangThai: "da-go" }, slug); flash("Đã gỡ bài khỏi Thư viện"); };
  const khoiPhuc = (n: number) => { setLichSu(false); flash(`Đã khôi phục bản ${n} — nội dung đang hiện là bản đó, bấm Lưu nháp để giữ`); };

  const daXB = f.trangThai === "da-xuat-ban" || f.trangThai === "da-len-lich";
  const seoTieuDe = f.seo.tieuDe || f.tieuDe;
  const seoMoTa = f.seo.moTa || f.sapo;
  const anhChiaSe = f.seo.anhChiaSe || f.anh;
  const slugHienTai = slugify(f.slug || f.tieuDe);
  const phienBan = [3, 2, 1].map((n) => ({ n, luc: new Date(new Date(luuGanNhat ?? f.capNhat).getTime() - n * 3600e3 * 7).toISOString(), boi: n === 1 ? (user?.hoTen ?? "Quản trị") : "Trần Thu Hà" }));

  return (
    <>
      <CmsHeader crumbs={[{ label: "Bài viết", href: R.H04 }, { label: isNew ? "Viết bài mới" : "Soạn bài viết" }]} title={isNew ? "Viết bài mới" : "Soạn bài viết"} />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6">
          <CmsCard title="1 · Nội dung">
            <div className="space-y-5">
              <Field label="Tiêu đề (≤ 90 ký tự)" count={`${f.tieuDe.length}/90`} error={err.tieuDe}>
                <Input value={f.tieuDe} onChange={(e) => onTieuDe(e.target.value)} placeholder="Nghệ thuật đặt câu hỏi — kỹ năng số một của người tư vấn" />
              </Field>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Chuyên đề" error={err.chuyenDe}>
                  <Select value={f.chuyenDeId} onChange={(e) => set({ chuyenDeId: e.target.value })}>
                    <option value="">— Chọn chuyên đề —</option>
                    {cds.map((c) => <option key={c.id} value={c.id}>{c.ten}{!c.hien ? " (đang ẩn)" : ""}</option>)}
                  </Select>
                </Field>
                <Field label="Tác giả">
                  <Select value={TAC_GIA.includes(f.tacGia) ? f.tacGia : "__khac"} onChange={(e) => set({ tacGia: e.target.value === "__khac" ? f.tacGia : e.target.value })}>
                    {TAC_GIA.map((t) => <option key={t} value={t}>{t}</option>)}
                    {!TAC_GIA.includes(f.tacGia) && <option value="__khac">{f.tacGia}</option>}
                  </Select>
                </Field>
              </div>
              <Field label="Sapo (2–3 câu, ≤ 280 ký tự)" count={`${f.sapo.length}/280`} error={err.sapo}>
                <Textarea value={f.sapo} onChange={(e) => onSapo(e.target.value)} className="min-h-[80px]" placeholder="Khách hàng không mua vì hiểu sản phẩm, họ mua vì thấy mình được hiểu…" />
              </Field>
              <Field label="Thân bài" error={err.thanBai}>
                <div className="border border-vien rounded-sm">
                  <div className="flex flex-wrap gap-1 p-2 border-b border-vien2 bg-xam text-[12.5px]">
                    {TOOLS.map((t) => <button key={t.label} type="button" title={t.title} onClick={() => insert(t)} className={cx("h-7 px-2 rounded-sm border border-transparent hover:border-blue hover:text-blue text-ink2", (t.label === "B") && "font-bold", t.label === "I" && "italic")}>{t.label}</button>)}
                  </div>
                  <textarea ref={bodyRef} value={f.thanBai} onChange={(e) => set({ thanBai: e.target.value })} className="w-full min-h-[360px] p-3 text-[14px] leading-relaxed text-den focus:outline-none font-mono" placeholder={"## Vì sao câu hỏi quan trọng hơn câu trả lời?\n\nMột câu hỏi đúng lúc mở ra điều khách chưa nói…"} />
                </div>
              </Field>
            </div>
          </CmsCard>

          <CmsCard title="2 · SEO — Google & chia sẻ">
            <div className="space-y-5">
              <Field label="Tiêu đề trang (30–60 ký tự)" count={`${seoTieuDe.length}/60`} error={err.seoTieuDe} hint={seoTieuDe.length > 0 && seoTieuDe.length < 30 ? "Nên dài 30–60 ký tự để hiện đủ trên Google." : undefined}>
                <div className="relative">
                  <Input value={f.seo.tieuDe} onChange={(e) => { setSeoTuSua(true); setSeo({ tieuDe: e.target.value }); }} placeholder={f.tieuDe.slice(0, 60) || "Tiêu đề hiện trên Google"} />
                  <span className={cx("absolute right-3 top-2.5 text-[12px] font-bold", mauBoDem(seoTieuDe.length, 30, 60))}>{seoTieuDe.length}/60</span>
                </div>
              </Field>
              <Field label="Mô tả trang (120–160 ký tự)" count={`${seoMoTa.length}/160`} error={err.seoMoTa}>
                <div className="relative">
                  <Textarea value={f.seo.moTa} onChange={(e) => { setSeoTuSua(true); setSeo({ moTa: e.target.value }); }} className="min-h-[72px] pr-20" placeholder={f.sapo.slice(0, 160) || "Mô tả ngắn hiện dưới tiêu đề trên Google"} />
                  <span className={cx("absolute right-3 top-2.5 text-[12px] font-bold", mauBoDem(seoMoTa.length, 120, 160))}>{seoMoTa.length}/160</span>
                </div>
              </Field>
              <Field label="Đường dẫn (tự sinh từ tiêu đề, sửa được)" error={err.slug}>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-mut whitespace-nowrap">/toan-tam-chia-se/</span>
                  <Input value={f.slug} onChange={(e) => { setSlugTuSua(true); set({ slug: e.target.value }); }} placeholder="nghe-thuat-dat-cau-hoi" />
                </div>
              </Field>
              <Field label="Ảnh xem trước khi chia sẻ (Zalo · Facebook)">
                <div className="flex items-center gap-4">
                  <div className="w-[200px] aspect-[1200/630] bg-xam rounded-sm overflow-hidden"><span className="flex items-center justify-center w-full h-full bg-vien2 border border-[#D6D6D6] text-mut text-[13px]">Ảnh</span></div>
                  <div className="text-[13px] text-ink2">
                    <div>{f.seo.anhChiaSe ? "Ảnh riêng cho chia sẻ" : "Dùng ảnh đại diện"} · 1200×630, tự cắt từ ảnh</div>
                    <div className="mt-2 flex gap-3">
                      <button type="button" className="text-blue font-bold" onClick={() => setImgPicker("chia-se")}>Chọn ảnh khác</button>
                      {f.seo.anhChiaSe && <button type="button" className="text-ink2 hover:text-blue" onClick={() => setSeo({ anhChiaSe: undefined })}>Dùng ảnh đại diện</button>}
                    </div>
                  </div>
                </div>
              </Field>
              <Checkbox label="Cho Google lập chỉ mục bài này" checked={f.seo.choGoogle} onChange={(e) => setSeo({ choGoogle: e.target.checked })} />
            </div>
          </CmsCard>

          <CmsCard>
            <CmsFormActions>
              <Button onClick={luuNhap}>Lưu nháp</Button>
              <Button kind="secondary" onClick={xemTruoc}>Xem trước</Button>
              <div className="relative">
                <Button kind="secondary" onClick={() => setPubMenu(!pubMenu)} disabled={!canPublish}>Xuất bản ▾</Button>
                {pubMenu && (
                  <div className="absolute left-0 top-12 z-10 w-[220px] bg-white border border-vien rounded-sm shadow-lg text-[14px]" role="menu">
                    <button type="button" className="block w-full text-left px-4 py-2.5 hover:bg-xam" onClick={xuatBanNgay}>Xuất bản ngay</button>
                    <button type="button" className="block w-full text-left px-4 py-2.5 hover:bg-xam border-t border-vien2" onClick={() => { setPubMenu(false); setLenLich(f.ngayLenLich ?? new Date(Date.now() + 86400e3 * 7).toISOString().slice(0, 10)); }}>Lên lịch…</button>
                  </div>
                )}
              </div>
              <Button kind="danger" onClick={goXuatBan} disabled={!canPublish || !daXB}>Gỡ xuất bản</Button>
              {!canPublish && <span className="text-[12.5px] text-mut">Vai Biên tập chỉ lưu nháp và xem trước; Quản trị xuất bản.</span>}
              <Button kind="ghost" className="ml-auto" onClick={() => router.push(R.H04)}>Huỷ</Button>
            </CmsFormActions>
          </CmsCard>
        </div>

        <aside className="space-y-6">
          <CmsCard title="Trạng thái">
            <div className="flex flex-wrap gap-2">
              {(["nhap", "da-len-lich", "da-xuat-ban", "da-go"] as const).map((s) => <span key={s} className={cx(f.trangThai !== s && "opacity-30")}><StatusChip s={s} /></span>)}
            </div>
            {f.trangThai === "da-len-lich" && f.ngayLenLich && <div className="mt-3 text-[13px] text-ink2">Sẽ xuất bản ngày {new Date(f.ngayLenLich).toLocaleDateString("vi-VN")}</div>}
            <div className="mt-3 text-[13px] text-ink2">Lưu gần nhất {luuGanNhat ? fmtDateTime(luuGanNhat) : "— chưa lưu"}</div>
            <button type="button" className="mt-2 text-[13px] text-blue font-bold" onClick={() => setLichSu(true)}>Lịch sử phiên bản ({isNew ? 0 : 3}) · Khôi phục bản trước</button>
          </CmsCard>

          <CmsCard title="Ảnh đại diện (16:9)">
            <div className="aspect-video bg-xam rounded-sm overflow-hidden"><span className="flex items-center justify-center w-full h-full bg-vien2 border border-[#D6D6D6] text-mut text-[13px]">Ảnh</span></div>
            <div className="mt-2 flex items-center justify-between text-[12.5px] text-mut"><span>JPG/PNG ≤ 5 MB</span><button type="button" className="text-blue font-bold" onClick={() => setImgPicker("dai-dien")}>Thay ảnh</button></div>
            <Field label="Mô tả ảnh (alt)" className="mt-4" error={err.altAnh}><Input value={f.altAnh} onChange={(e) => set({ altAnh: e.target.value })} placeholder="Tư vấn viên trò chuyện cùng khách hàng" /></Field>
          </CmsCard>

          <CmsCard title="Xem trước trên Google">
            <div className="text-[12px] text-ink2">{DOMAIN} › toan-tam-chia-se › {slugHienTai || "…"}</div>
            <div className="mt-1 text-[17px] text-[#1a0dab] leading-snug line-clamp-2">{seoTieuDe || "Tiêu đề trang"}</div>
            <div className="mt-1 text-[13px] text-ink2 line-clamp-3">{seoMoTa || "Mô tả trang sẽ hiện ở đây."}</div>
            {!f.seo.choGoogle && <Chip tone="amber" className="mt-3">Không lập chỉ mục</Chip>}
          </CmsCard>

          <CmsCard title="Xem trước khi chia sẻ (Zalo · Facebook)">
            <div className="border border-vien rounded-sm overflow-hidden">
              <div className="aspect-[1200/630] bg-xam"><span className="flex items-center justify-center w-full h-full bg-vien2 border border-[#D6D6D6] text-mut text-[13px]">Ảnh</span></div>
              <div className="p-3 bg-xam/60">
                <div className="text-[10.5px] uppercase text-mut">{DOMAIN}</div>
                <div className="font-bold text-[14px] text-den line-clamp-2">{seoTieuDe || "Tiêu đề trang"}</div>
              </div>
            </div>
          </CmsCard>
        </aside>
      </div>

      <Modal open={!!imgPicker} onClose={() => setImgPicker(null)} title={imgPicker === "dai-dien" ? "Thay ảnh đại diện" : imgPicker === "chia-se" ? "Chọn ảnh xem trước khi chia sẻ" : "Chèn ảnh trong bài"} width={760}>
        {imgPicker === "trong-bai" && <Field label="Mô tả ảnh (alt) — người đọc không thấy ảnh sẽ đọc dòng này" className="mb-4"><Input value={altTrongBai} onChange={(e) => setAltTrongBai(e.target.value)} placeholder="Buổi tư vấn tại nhà khách hàng" /></Field>}
        <div className="grid grid-cols-4 gap-3">
          {IMGS.map((src) => <button key={src} type="button" onClick={() => chonAnh(src)} className="aspect-video rounded-sm overflow-hidden border-2 border-transparent hover:border-blue"><span className="flex items-center justify-center w-full h-full bg-vien2 border border-[#D6D6D6] text-mut text-[13px]">Ảnh</span></button>)}
        </div>
      </Modal>

      <Modal open={lenLich !== null} onClose={() => setLenLich(null)} title="Lên lịch xuất bản" width={480}
        footer={<><Button onClick={xacNhanLenLich}>Xác nhận lịch</Button><Button kind="secondary" onClick={() => setLenLich(null)}>Huỷ</Button></>}>
        <Field label="Ngày xuất bản" hint="Bài tự lên Thư viện vào 8:00 ngày đã chọn."><Input type="date" value={lenLich ?? ""} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setLenLich(e.target.value)} /></Field>
      </Modal>

      <Modal open={lichSu} onClose={() => setLichSu(false)} title="Lịch sử phiên bản" width={560}>
        {isNew ? <div className="text-ink2 text-[14px]">Bài chưa lưu — chưa có phiên bản nào.</div> : (
          <ul className="divide-y divide-vien2 text-[14px]">
            <li className="py-3 flex items-center justify-between"><span><b>Bản hiện tại</b> · {luuGanNhat ? fmtDateTime(luuGanNhat) : "—"}</span><Chip tone="blue">Đang mở</Chip></li>
            {phienBan.map((p) => <li key={p.n} className="py-3 flex items-center justify-between"><span>Bản {p.n} · {fmtDateTime(p.luc)} · {p.boi}</span><Button size="sm" kind="secondary" onClick={() => khoiPhuc(p.n)}>Khôi phục</Button></li>)}
          </ul>
        )}
      </Modal>
      {node}
    </>
  );
}
