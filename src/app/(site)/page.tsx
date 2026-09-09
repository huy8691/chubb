"use client";
/**
 * A01 · Trang chủ — dùng chung cho khách và Tư vấn viên đã đăng nhập (nav tự đổi, bỏ A02 08/09).
 * Khối theo wireframe: hero xám · 4 số liệu · Chọn hành trình (2 thẻ) · Công cụ nổi bật · Câu chuyện (3 bài mới nhất)
 * · Vinh danh tháng · Về Chubb Life · CTA Ứng tuyển.
 */
import { XemNhanhButton } from "@/components/danh-thiep/XemNhanh";
import Link from "next/link";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { TVV_DEMO, thangLabel } from "@/lib/seed";
import { Avatar, Button, Card, Chip, Eyebrow, H1, H2, ImageBox, MoreLink, Muted, SectionHead } from "@/components/ui";

const SO_LIEU = [
  ["54", "quốc gia & vùng lãnh thổ"],
  ["21", "năm tại Việt Nam"],
  ["AA / A++", "xếp hạng S&P · AM Best"],
  ["128", "MDRT 2026"],
];

export default function Page() {
  const { data } = useStore();
  const tvv = useCurrentAdvisor();

  const baiMoi = data.articles
    .filter((a) => a.trangThai === "da-xuat-ban")
    .sort((a, b) => (b.ngayXuatBan ?? "").localeCompare(a.ngayXuatBan ?? ""))
    .slice(0, 3);
  const thang = data.honorMonths.filter((m) => m.trangThai === "da-cong-bo").sort((a, b) => b.id.localeCompare(a.id))[0];
  const hangMucChinh = thang?.hangMuc.find((h) => h.hangMucId === "mdrt") ?? thang?.hangMuc[0];
  const tenHangMuc = data.hangMuc.find((h) => h.id === hangMucChinh?.hangMucId)?.ten ?? "";
  const nguoiDat = (hangMucChinh?.nguoiDat ?? [])
    .filter((n) => n.dongYCongKhai === "dong-y")
    .sort((a, b) => a.thuHang - b.thuHang)
    .map((n) => ({ ...n, tvv: data.advisors.find((a) => a.ma === n.advisorMa) }))
    .filter((n) => n.tvv);
  const dauBang = nguoiDat[0];
  const keTiep = nguoiDat.slice(1, 5);
  const tinh = (vp: string) => vp.split(" — ")[0];

  const congCu = [
    { ten: "Quản lý tài chính cá nhân", moTa: "Ước tính khoản tiết kiệm và thời gian để đạt mục tiêu tài chính.", href: R.D03, anh: "/img/d01-m1.jpg" },
    { ten: "Studio", moTa: "Chọn mẫu Chubb đã duyệt, tải ảnh của bạn, xuất ảnh đúng nhận diện.", href: tvv ? R.D02 : `${R.G01}?next=${encodeURIComponent(R.D02)}`, anh: "/img/d01-m2.jpg", canDangNhap: true },
    { ten: "Trắc Nghiệm Tính Cách", moTa: "Khám phá mức độ phù hợp với nghề tư vấn tài chính.", href: R.D04, anh: "/img/d01-m3.jpg" },
    { ten: "Sẵn Sàng Kết Nối", moTa: "Danh thiếp điện tử với mã QR riêng.", href: R.E01, anh: "/img/d01-m4.jpg" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-xam">
        <div className="wrap py-16 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <Eyebrow className="mb-3">Ngôi nhà chung của Tư vấn viên Chubb Life</Eyebrow>
            <H1 className="text-[46px]">Chọn Điều Đáng Để Toàn Tâm</H1>
            <Muted className="mt-4 text-[17px] max-w-[600px]">Không chỉ là một công việc, mà còn là cơ hội để bạn tạo dựng sự nghiệp vững vàng và mang những giá trị thiết thực đến hàng triệu gia đình Việt.</Muted>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button kind="recruit" href={R.B01}>Khám phá ngay</Button>
              <XemNhanhButton ma={TVV_DEMO.ma} size="md" label="Xem danh thiếp mẫu" />
            </div>
          </div>
          <ImageBox src="/img/hero-kv.jpg" alt="Đội ngũ Tư vấn viên Chubb Life" ratio="16/10" />
        </div>
      </section>

      {/* Số liệu */}
      <section className="wrap py-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SO_LIEU.map(([v, l]) => (
          <Card key={l} className="p-5">
            <div className="font-serif font-semibold text-[22px] text-blue">{v}</div>
            <div className="text-[13px] text-ink2 mt-1">{l}</div>
          </Card>
        ))}
      </section>

      {/* Chọn hành trình */}
      <section className="wrap pb-14">
        <H2 className="text-[22px] mb-6">Chọn hành trình của bạn</H2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-blue-soft border border-blue/20 rounded-sm p-7">
            <h3 className="font-serif font-semibold text-[22px] text-den">Tôi là Tư vấn viên Chubb Life</h3>
            <ul className="mt-4 space-y-2 text-[14px] text-ink2">
              <li>• Vinh danh</li><li>• Công cụ</li><li>• Danh thiếp của tôi</li>
            </ul>
            <div className="mt-6">
              {tvv ? <Button href={R.G02a}>Vào Trang cá nhân</Button> : <Button href={R.G01}>Đăng nhập TVV</Button>}
            </div>
          </div>
          <div className="bg-hong-soft border border-hong/20 rounded-sm p-7">
            <h3 className="font-serif font-semibold text-[22px] text-den">Tôi muốn trở thành Tư vấn viên</h3>
            <ul className="mt-4 space-y-2 text-[14px] text-ink2">
              <li>• Nghề tư vấn</li><li>• Lộ trình</li><li>• Ứng tuyển</li>
            </ul>
            <div className="mt-6"><Button kind="recruit" href={R.B01}>Tìm hiểu nghề</Button></div>
          </div>
        </div>
      </section>

      {/* Công cụ nổi bật */}
      <section className="wrap pb-14">
        <SectionHead title={<span className="text-[22px]">Toàn Tâm Phát Triển — công cụ nổi bật</span>} right={<MoreLink href={R.D01} />} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {congCu.map((c) => (
            <Link key={c.ten} href={c.href} className="block bg-white border border-vien rounded-sm overflow-hidden hover:border-blue">
              <ImageBox src={c.anh} alt={c.ten} ratio="16/9" className="rounded-none" />
              <div className="p-5">
                <div className="font-bold text-[15px] text-den">{c.ten}</div>
                <p className="text-[13px] text-ink2 mt-2 leading-relaxed">{c.moTa}</p>
                {c.canDangNhap && !tvv && <Chip tone="amber" className="mt-3">Cần đăng nhập</Chip>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Câu chuyện */}
      <section className="bg-xam py-14">
        <div className="wrap">
          <SectionHead title={<span className="text-[22px]">Toàn Tâm Chia Sẻ — câu chuyện</span>} right={<MoreLink href={R.F01} />} desc="Không phải ai bắt đầu cũng biết mình sẽ đi bao xa. Nhưng qua từng trải nghiệm, từng giá trị tạo ra, từng cột mốc đạt được, họ tìm thấy lý do để toàn tâm." />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {baiMoi.map((a) => {
              const cd = data.chuyenDe.find((c) => c.id === a.chuyenDeId);
              return (
                <Link key={a.id} href={R.F02(a.slug)} className="block bg-white border border-vien rounded-sm overflow-hidden hover:border-blue">
                  <ImageBox src={a.anh} alt={a.altAnh} ratio="16/9" className="rounded-none" />
                  <div className="p-5">
                    <Eyebrow className="text-[11px]">{cd?.ten}</Eyebrow>
                    <div className="font-bold text-[16px] text-den mt-2 line-clamp-2">{a.tieuDe}</div>
                    <div className="text-[12px] text-mut mt-3">6 phút đọc</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vinh danh tháng */}
      <section className="wrap py-14">
        <SectionHead title={<span className="text-[22px]">Toàn Tâm Dẫn Đầu — vinh danh tháng</span>} right={<MoreLink href={R.C01} />} />
        {dauBang?.tvv ? (
          <>
            <Card className="p-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-center">
              <ImageBox src="/img/tvv-thang.png" alt={dauBang.tvv.hoTen} ratio="1/1" />
              <div>
                <Eyebrow className="mb-2">{tenHangMuc} · {thang ? thangLabel(thang) : ""}</Eyebrow>
                <div className="font-serif font-semibold text-[26px] text-den">{dauBang.tvv.hoTen}</div>
                <Muted className="mt-1">{tenHangMuc} 2026 · {tinh(dauBang.tvv.vanPhong)}</Muted>
                <div className="mt-5"><XemNhanhButton ma={dauBang.tvv.ma} /></div>
              </div>
            </Card>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {keTiep.map((n) => n.tvv && (
                <Card key={n.advisorMa} className="p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={n.tvv.hoTen} size={48} />
                    <div>
                      <div className="font-bold text-[14px] text-den">{n.tvv.hoTen}</div>
                      <div className="text-[12px] text-ink2">{tenHangMuc} 2026 · {tinh(n.tvv.vanPhong)}</div>
                    </div>
                  </div>
                  <div className="mt-4"><XemNhanhButton ma={n.tvv.ma} kind="ghost" /></div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card className="p-8 text-center text-ink2">Tháng vinh danh sẽ được công bố vào đầu tháng.</Card>
        )}
        <div className="mt-6"><Button kind="secondary" href={R.C01}>Xem bảng vinh danh</Button></div>
      </section>

      {/* Về Chubb Life */}
      <section className="bg-xam py-14">
        <div className="wrap">
          <H2 className="text-[22px]">Về Chubb Life</H2>
          <Muted className="mt-3 text-[15px] max-w-[720px]">Chubb Life Việt Nam là thành viên của Tập đoàn Chubb — công ty bảo hiểm tài sản và trách nhiệm được niêm yết lớn nhất thế giới, hiện diện tại 54 quốc gia và vùng lãnh thổ, đồng hành cùng người Việt từ 2005.</Muted>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {["Chubb", "MDRT", "S&P Global", "AM Best"].map((l) => (
              <div key={l} className="h-24 bg-white border border-vien rounded-sm flex items-center justify-center font-bold text-mut tracking-wider">{l}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="wrap py-14">
        <div className="bg-hong-soft border border-hong/20 rounded-sm px-8 py-10 flex flex-wrap items-center justify-between gap-6">
          <H2>Sẵn sàng bắt đầu hành trình Toàn Tâm?</H2>
          <Button kind="recruit" href={`${R.B01}#ung-tuyen`}>Ứng tuyển ngay</Button>
        </div>
      </section>
    </>
  );
}
