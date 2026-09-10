"use client";
/**
 * B01 · Toàn Tâm Tuyển Dụng (Tab 1) — trang index của tab: hero KV · video manifesto · ba trụ giá trị · câu chuyện nghề
 * (2 bài chuyên đề Bứt Phá) · lộ trình 5 bậc · môi trường làm việc · thành tích đội ngũ · FAQ trang "tuyen-dung" · form Đăng ký ứng tuyển → B02.
 */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import type { Candidate } from "@/lib/types";
import { Button, Card, Checkbox, Eyebrow, Field, H1, H2, ImageBox, Input, MoreLink, Muted, SectionHead, Select, cx, useFlash } from "@/components/ui";
import { FaqAccordion } from "@/components/chung/FaqAccordion";
import { HOTLINE, NGUON_BIET, TINH_THANH } from "@/components/chung/const";

const TRU = [
  { ten: "Toàn tâm với nghề", mo: "Vững chuyên môn, giữ chuẩn mực và tự hào về nghề mình đã chọn." },
  { ten: "Toàn tâm với khách hàng", mo: "Lắng nghe và thấu hiểu từng nhu cầu để đưa ra giải pháp phù hợp cho mỗi khách hàng. Đồng hành lâu dài thay vì chỉ hướng đến hoàn thành một giao dịch." },
  { ten: "Toàn tâm với chính mình", mo: "Luôn đầu tư cho bản thân để trở thành phiên bản tốt hơn mỗi ngày. Giữ vững bản lĩnh và uy tín để đi xa trên con đường mình đã chọn." },
];
const LO_TRINH = [
  { bac: "1. Tư vấn viên", yeuCau: ["Chứng chỉ đại lý bảo hiểm.", "Hoàn thành khoá đào tạo nhập môn."], quyenLoi: ["Đào tạo nền tảng.", "Hoa hồng theo chính sách Chubb Life."] },
  { bac: "2. Tư vấn viên Cao cấp", yeuCau: ["Duy trì hoạt động liên tục.", "Hoàn thành đào tạo nâng cao."], quyenLoi: ["Thưởng theo chính sách hiện hành.", "Ưu tiên chương trình đào tạo."] },
  { bac: "3. Trưởng nhóm", yeuCau: ["Xây dựng và dẫn dắt một nhóm.", "Đáp ứng tiêu chuẩn quản lý."], quyenLoi: ["Hoa hồng quản lý nhóm.", "Hỗ trợ tuyển dụng, đào tạo nhóm."] },
  { bac: "4. Trưởng phòng", yeuCau: ["Quản lý nhiều nhóm Tư vấn viên.", "Đạt tiêu chuẩn cấp phòng."], quyenLoi: ["Phụ cấp quản lý.", "Ngân sách phát triển đội ngũ."] },
  { bac: "5. Giám đốc Kinh doanh", yeuCau: ["Dẫn dắt hệ thống kinh doanh.", "Phát triển tổ chức bền vững."], quyenLoi: ["Chính sách dành cho cấp lãnh đạo.", "Hội nghị vinh danh cấp cao."] },
];
const VAN_PHONG = ["/img/b01-vp-lon.jpg", "/img/b01-vp-1.jpg", "/img/b01-vp-2.jpg", "/img/b01-vp-3.jpg"];
const THANH_TICH = [["128", "MDRT 2026"], ["21", "năm tại Việt Nam"], ["+120", "Tư vấn viên mới trong tháng"]];

function TuyenDung() {
  const router = useRouter();
  const sp = useSearchParams();
  const { data, actions } = useStore();
  const { flash, node } = useFlash();
  const [dangPhat, setDangPhat] = useState(false);
  const [phuDe, setPhuDe] = useState(false);
  const [transcript, setTranscript] = useState(false);
  const [anh, setAnh] = useState(0);

  const cauChuyen = data.articles.filter((a) => a.chuyenDeId === "but-pha" && a.trangThai === "da-xuat-ban").slice(0, 2);
  const slugButPha = data.chuyenDe.find((c) => c.id === "but-pha")?.slug ?? "toan-tam-but-pha";
  const faqs = data.faqs.filter((f) => f.trang === "tuyen-dung" && f.trangThai === "da-xuat-ban").sort((a, b) => a.thuTu - b.thuTu);
  const nguoiKe = [
    { ten: "Nguyễn Minh Anh", chuc: "Trưởng nhóm Kinh doanh · MDRT 2026", loi: "“10 năm liên tiếp MDRT không chỉ là một thành tích. Đó là 10 năm không ngừng theo đuổi những chuẩn mực cao hơn cho chính mình và cho những gia đình đã trao gửi niềm tin.”", anh: "/img/p-nu-1.jpg" },
    { ten: "Trần Quốc Bảo", chuc: "Tư vấn viên Cao cấp · 8 năm kinh nghiệm", loi: "“Mỗi khách hàng đều có một câu chuyện đáng được lắng nghe. Nghề này dạy tôi kiên nhẫn trước khi dạy tôi bán bất cứ điều gì.”", anh: "/img/p-nam-2.jpg" },
  ];

  // Form ứng tuyển
  const ref = sp.get("ref") ?? "";
  const [hoTen, setHoTen] = useState("");
  const [sdt, setSdt] = useState("");
  const [email, setEmail] = useState("");
  const [tinh, setTinh] = useState("");
  const [nguon, setNguon] = useState(ref ? NGUON_BIET[0] : "");
  const [maGT, setMaGT] = useState(ref);
  const [dongY, setDongY] = useState(false);
  const [loi, setLoi] = useState<Record<string, string>>({});

  const gui = () => {
    const e: Record<string, string> = {};
    if (!hoTen.trim()) e.hoTen = "Nhập họ và tên.";
    if (!/^0\d{9}$/.test(sdt.replace(/\s/g, ""))) e.sdt = "Chưa đúng định dạng (10 số)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Email chưa đúng định dạng.";
    if (nguon === NGUON_BIET[0] && maGT && !/^\d{7}$/.test(maGT)) e.maGT = "Mã Tư vấn viên gồm 7 số.";
    if (!dongY) e.dongY = "Bạn cần đồng ý để Chubb Life liên hệ.";
    setLoi(e);
    if (Object.keys(e).length) { document.getElementById("ung-tuyen")?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    const so = data.candidates.reduce((m, x) => Math.max(m, parseInt(x.id.replace(/\D/g, ""), 10) || 0), 0) + 1;
    const hs: Candidate = {
      id: `TD-${String(so).padStart(4, "0")}`, hoTen: hoTen.trim(), soDienThoai: sdt.replace(/\s/g, ""), email: email.trim(), tinhThanh: tinh || "Chưa chọn",
      nguon: nguon || "Chưa chọn", maGioiThieu: nguon === NGUON_BIET[0] && maGT ? maGT : undefined, dongYLienHe: dongY, gui: new Date().toISOString(), trangThai: "moi",
    };
    actions.update("candidates", (list) => [hs, ...list]);
    router.push(R.B02(hs.id));
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-xam">
        <div className="wrap py-16 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <Eyebrow className="mb-3">Chiến dịch tháng 8/2026</Eyebrow>
            <H1 className="text-[46px]">Chọn Điều Đáng Để Toàn Tâm</H1>
            <Muted className="mt-4 text-[17px] max-w-[600px]">Một nghề để bạn vừa xây dựng sự nghiệp vững vàng, vừa mang giá trị thiết thực đến từng gia đình Việt.</Muted>
            <div className="mt-8"><Button kind="recruit" href="#ung-tuyen">Trở thành Tư vấn viên Chubb Life</Button></div>
          </div>
          <ImageBox src="/img/b01-kv.jpg" alt="Tư vấn viên Chubb Life" ratio="16/10" />
        </div>
      </section>

      {/* Video manifesto */}
      <section className="wrap py-12">
        <div className="relative aspect-video rounded-sm overflow-hidden bg-den">
          <div className={cx("absolute inset-0", dangPhat && "opacity-60")}><ImageBox src="/img/b01-video.jpg" alt="Video manifesto nghề Tư vấn tài chính" ratio="16/9" className="rounded-none h-full" /></div>
          {!dangPhat && (
            <button type="button" aria-label="Phát video" onClick={() => { setDangPhat(true); flash("Đang phát video manifesto"); }} className="absolute inset-0 m-auto size-20 rounded-full bg-white/90 text-blue flex items-center justify-center text-[34px] hover:bg-white">▶</button>
          )}
          {dangPhat && <div className="absolute bottom-0 inset-x-0 h-1 bg-blue/40"><div className="h-full w-1/3 bg-blue" /></div>}
          {phuDe && dangPhat && <div className="absolute bottom-6 inset-x-0 text-center"><span className="bg-den/80 text-white text-[15px] px-3 py-1 rounded-sm">Chọn điều đáng để toàn tâm.</span></div>}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => setPhuDe(!phuDe)} className={cx("h-8 px-3 rounded-sm border text-[13px] font-bold", phuDe ? "bg-blue text-white border-blue" : "bg-white text-ink2 border-vien hover:border-blue")}>Phụ đề tiếng Việt</button>
          <button type="button" onClick={() => setTranscript(!transcript)} className={cx("h-8 px-3 rounded-sm border text-[13px] font-bold", transcript ? "bg-blue text-white border-blue" : "bg-white text-ink2 border-vien hover:border-blue")}>Bản ghi lời thoại (transcript)</button>
        </div>
        {transcript && (
          <Card className="mt-4 p-5 text-[14px] text-ink2 leading-relaxed">
            <p>Không phải ai bắt đầu cũng biết mình sẽ đi bao xa. Nhưng qua từng trải nghiệm, từng giá trị tạo ra, từng cột mốc đạt được, họ tìm thấy lý do để toàn tâm — với nghề, với khách hàng và với chính mình.</p>
          </Card>
        )}
      </section>

      {/* Manifesto & ba trụ */}
      <section className="wrap pb-14">
        <H2 className="text-[22px]">Manifesto & câu chuyện nghề</H2>
        <Muted className="mt-3 text-[15px]">Ba trụ giá trị làm nên người Tư vấn Tài chính Toàn Tâm của Chubb Life Việt Nam.</Muted>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {TRU.map((t) => (
            <Card key={t.ten} className="p-6">
              <div className="font-bold text-[15px] text-blue uppercase tracking-wide">{t.ten}</div>
              <p className="text-[13.5px] text-ink2 mt-3 leading-relaxed">{t.mo}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Câu chuyện nghề */}
      <section id="cau-chuyen" className="bg-xam py-14 scroll-mt-20">
        <div className="wrap">
          <SectionHead title={<span className="text-[22px]">Câu chuyện nghề</span>} right={<MoreLink href={R.F03(slugButPha)}>Xem thêm câu chuyện</MoreLink>} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {nguoiKe.map((n, i) => {
              const bai = cauChuyen[i];
              return (
                <Link key={n.ten} href={bai ? R.F02(bai.slug) : R.F03(slugButPha)} className="block bg-white border border-vien rounded-sm p-6 grid grid-cols-[200px_1fr] gap-6 hover:border-blue">
                  <ImageBox src={n.anh} alt={n.ten} ratio="3/4" />
                  <div>
                    <div className="font-serif font-semibold text-[18px] text-den">{n.ten}</div>
                    <div className="text-[13px] text-ink2 mt-1">{n.chuc}</div>
                    <p className="text-[14px] text-ink2 mt-4 leading-relaxed">{n.loi}</p>
                    {bai && <div className="mt-4 text-[13px] text-blue font-bold">{bai.tieuDe}</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lộ trình */}
      <section className="wrap py-14">
        <H2 className="text-[22px]">Lộ trình thăng tiến</H2>
        <Muted className="mt-3 text-[15px]">Năm bậc phát triển với yêu cầu và quyền lợi được trình bày rõ ràng ở từng bậc.</Muted>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
          {LO_TRINH.map((b, i) => (
            <Card key={b.bac} className={cx("p-4", i === 0 && "border-blue")}>
              <div className="font-bold text-[13px] text-den">{b.bac}</div>
              <div className="mt-4 text-[9.5px] font-bold text-mut uppercase tracking-wider">Yêu cầu</div>
              <ul className="text-[11px] text-ink2 mt-1 space-y-0.5">{b.yeuCau.map((y) => <li key={y}>{y}</li>)}</ul>
              <div className="mt-3 text-[9.5px] font-bold text-mut uppercase tracking-wider">Quyền lợi</div>
              <ul className="text-[11px] text-ink2 mt-1 space-y-0.5">{b.quyenLoi.map((y) => <li key={y}>{y}</li>)}</ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Môi trường làm việc */}
      <section className="bg-xam py-14">
        <div className="wrap">
          <H2 className="text-[22px]">Môi trường làm việc</H2>
          <Muted className="mt-3 text-[15px]">Văn phòng Chubb Life trên toàn quốc — không gian làm việc chuyên nghiệp dành cho Tư vấn viên.</Muted>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 mt-8 lg:h-[480px]">
            <div className="relative min-h-[240px] lg:min-h-0 lg:h-full rounded-sm overflow-hidden bg-vien2 border border-[#D6D6D6] flex items-center justify-center text-mut text-[13px]">
              <span>Ảnh</span>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button type="button" aria-label="Ảnh trước" onClick={() => setAnh((anh + VAN_PHONG.length - 1) % VAN_PHONG.length)} className="size-9 rounded-sm bg-white/90 text-den hover:bg-white">←</button>
                <button type="button" aria-label="Ảnh sau" onClick={() => setAnh((anh + 1) % VAN_PHONG.length)} className="size-9 rounded-sm bg-white/90 text-den hover:bg-white">→</button>
              </div>
              <div className="absolute bottom-4 right-4 bg-den/70 text-white text-[12px] px-2 py-1 rounded-sm">{anh + 1} / {VAN_PHONG.length}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 lg:grid-cols-1 lg:grid-rows-3 lg:h-full">
              {VAN_PHONG.filter((_, i) => i !== anh).slice(0, 3).map((src) => (
                <button key={src} type="button" onClick={() => setAnh(VAN_PHONG.indexOf(src))} className="rounded-sm overflow-hidden border border-[#D6D6D6] hover:border-blue bg-vien2 flex items-center justify-center text-mut text-[13px] min-h-[90px] lg:min-h-0"><span>Ảnh</span></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Thành tích */}
      <section className="wrap py-14">
        <H2 className="text-[22px] mb-6">Thành tích đội ngũ</H2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {THANH_TICH.map(([v, l]) => (
            <Card key={l} className="p-7"><div className="font-serif font-semibold text-[30px] text-blue">{v}</div><div className="text-[13.5px] text-ink2 mt-2">{l}</div></Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="cau-hoi" className="wrap pb-14 scroll-mt-20">
        <H2 className="text-[22px] mb-4">Câu hỏi thường gặp</H2>
        <FaqAccordion items={faqs} emptyTitle="Chưa có câu hỏi" emptyDesc={`Gọi hotline ${HOTLINE} để được giải đáp.`} />
      </section>

      {/* Form ứng tuyển */}
      <section id="ung-tuyen" className="bg-xam py-14 scroll-mt-20">
        <div className="wrap">
          <H2 className="text-[22px]">Đăng ký ứng tuyển</H2>
          <Muted className="mt-3 text-[15px]">Điền thông tin để đội ngũ Tuyển dụng Chubb Life liên hệ với bạn.</Muted>
          <Card className="mt-8 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Họ và tên *" error={loi.hoTen}><Input value={hoTen} onChange={(e) => setHoTen(e.target.value)} placeholder="Nguyễn Văn A" /></Field>
              <Field label="Số điện thoại *" error={loi.sdt}><Input inputMode="tel" value={sdt} onChange={(e) => setSdt(e.target.value)} placeholder="09xx xxx xxx" /></Field>
              <Field label="Email *" error={loi.email}><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@email.com" /></Field>
              <Field label="Tỉnh/Thành phố"><Select value={tinh} onChange={(e) => setTinh(e.target.value)}><option value="">Chọn tỉnh/thành phố</option>{TINH_THANH.map((t) => <option key={t}>{t}</option>)}</Select></Field>
              <Field label="Bạn biết Chubb Life qua đâu?"><Select value={nguon} onChange={(e) => setNguon(e.target.value)}><option value="">Chọn nguồn thông tin</option>{NGUON_BIET.map((n) => <option key={n}>{n}</option>)}</Select></Field>
              {nguon === NGUON_BIET[0] && <Field label="Mã Tư vấn viên giới thiệu (7 số)" error={loi.maGT}><Input inputMode="numeric" maxLength={7} value={maGT} onChange={(e) => setMaGT(e.target.value.replace(/\D/g, ""))} placeholder="0161363" /></Field>}
            </div>
            <div className="mt-6">
              <Checkbox checked={dongY} onChange={(e) => setDongY(e.target.checked)} label={<span className="text-[12.5px] text-ink2">Tôi đồng ý để Chubb Life Việt Nam liên hệ và xử lý thông tin của tôi theo Chính sách bảo vệ dữ liệu cá nhân.</span>} />
              {loi.dongY && <div className="text-[12px] text-red-fg mt-1">{loi.dongY}</div>}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button kind="recruit" onClick={gui}>Gửi thông tin ứng tuyển</Button>
              <span className="text-[12.5px] text-mut">Hotline {HOTLINE}</span>
            </div>
          </Card>
        </div>
      </section>
      {node}
    </>
  );
}

export default function Page() {
  return <Suspense fallback={null}><TuyenDung /></Suspense>;
}
