"use client";
/** D01 · Toàn Tâm Phát Triển (Tab 3 · Công cụ) — trang tổng: hero · một khối cho mỗi công cụ · Mới cập nhật · CTA đăng nhập. */
import Link from "next/link";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import { Button, Card, Chip, Eyebrow, H2, H3, Hero, ImageBox, Muted } from "@/components/ui";

export default function Page() {
  const { data, session } = useStore();
  const daDangNhap = session.role === "tvv";
  const mauMoi = data.studioTemplates.filter((m) => m.trangThai === "da-xuat-ban").sort((a, b) => b.capNhat.localeCompare(a.capNhat)).slice(0, 2);
  const taiLieuMoi = data.documents.filter((d) => d.phan === "cong-khai" && d.trangThai === "da-xuat-ban").sort((a, b) => b.capNhat.localeCompare(a.capNhat)).slice(0, 2);

  const congCu = [
    { ten: "Quản lý tài chính cá nhân", moTa: "Ước tính khoản tiết kiệm và thời gian để đạt mục tiêu tài chính.", href: R.D03, nut: "Mở công cụ" },
    { ten: "Studio", moTa: "Chọn mẫu Chubb đã duyệt, tải ảnh của bạn, xuất ảnh đúng nhận diện.", href: R.D08, nut: "Xem mẫu Studio", chip: "Tạo ảnh cần đăng nhập" },
    { ten: "Trắc Nghiệm Tính Cách", moTa: "Khám phá mức độ phù hợp với nghề tư vấn tài chính.", href: R.D04, nut: "Mở công cụ" },
  ];

  return (
    <>
      <Hero eyebrow="Toàn Tâm Phát Triển" title="Bộ công cụ cho người Tư vấn hiện đại" desc="Năm công cụ giúp Tư vấn viên Chubb Life làm việc chuyên nghiệp hơn mỗi ngày — từ hoạch định tài chính cá nhân, tạo ảnh cá nhân hoá đến danh thiếp điện tử và tài liệu bán hàng." image="/img/d01-kv.jpg" />

      <section className="wrap py-14">
        <H2>Bộ công cụ</H2>
        <Muted className="mt-2">Năm công cụ. Công cụ dùng dữ liệu cá nhân của bạn cần đăng nhập.</Muted>

        <Eyebrow className="mt-10 mb-4">Công cụ</Eyebrow>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {congCu.map((c) => (
            <Card key={c.ten} className="p-6 flex flex-col">
              <H3>{c.ten}</H3>
              <Muted className="mt-2 flex-1">{c.moTa}</Muted>
              {c.chip && !daDangNhap && <div className="mt-4"><Chip tone="amber">{c.chip}</Chip></div>}
              <div className="mt-5"><Button href={c.href}>{c.nut}</Button></div>
            </Card>
          ))}
        </div>

        <Eyebrow className="mt-12 mb-4">Danh thiếp & tài liệu</Eyebrow>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col">
            <H3>Sẵn Sàng Kết Nối (Danh thiếp)</H3>
            <Muted className="mt-2 flex-1">Danh thiếp điện tử với mã QR riêng.</Muted>
            {!daDangNhap && <div className="mt-4"><Chip tone="amber">Cần đăng nhập</Chip></div>}
            <div className="mt-5"><Button href={daDangNhap ? R.E04 : R.E01}>Mở công cụ</Button></div>
          </Card>
          <Card className="p-6 flex flex-col">
            <H3>Tài liệu</H3>
            <Muted className="mt-2 flex-1">Brochure, biểu mẫu, slide trình bày, tài liệu đào tạo.</Muted>
            {!daDangNhap && <div className="mt-4"><Chip tone="amber">Cần đăng nhập để mở tệp</Chip></div>}
            <div className="mt-5"><Button href={R.G04} kind="secondary">Xem tài liệu</Button></div>
          </Card>
          <Card className="p-6 flex flex-col">
            <H3>Bộ sưu tập Studio</H3>
            <Muted className="mt-2 flex-1">Ảnh Tư vấn viên tạo trong Studio, Chubb đã duyệt.</Muted>
            <div className="mt-5"><Button href={R.D07} kind="secondary">Xem bộ sưu tập</Button></div>
          </Card>
        </div>
      </section>

      <section className="bg-xam">
        <div className="wrap py-14">
          <H2>Mới cập nhật</H2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            {mauMoi.map((m) => (
              <Link key={m.id} href={`${R.D02}?mau=${m.id}`} className="block bg-white border border-vien rounded-sm p-3 hover:border-blue">
                <ImageBox src={m.anh} ratio="4/3" />
                <Eyebrow className="mt-3 text-[10px]">Mẫu mới</Eyebrow>
                <div className="font-bold text-[14px] mt-1 text-den">{m.ten}</div>
                <div className="text-[12px] text-mut mt-1">Cập nhật {fmtDate(m.capNhat)}</div>
              </Link>
            ))}
            {taiLieuMoi.map((d) => (
              <Link key={d.id} href={R.G04} className="block bg-white border border-vien rounded-sm p-3 hover:border-blue">
                <ImageBox ratio="4/3" />
                <Eyebrow className="mt-3 text-[10px]">Tài liệu</Eyebrow>
                <div className="font-bold text-[14px] mt-1 text-den">{d.ten}</div>
                <div className="text-[12px] text-mut mt-1">{d.dinhDang} · {d.phienBan} · {fmtDate(d.capNhat)}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {!daDangNhap && (
        <section className="wrap py-14">
          <Card className="p-8 flex flex-wrap items-center justify-between gap-6">
            <div>
              <H3>Đăng nhập bằng email để mở Studio và Tài liệu nghiệp vụ</H3>
              <Muted className="mt-1">Đăng nhập bằng email + mã 6 số gửi qua email. Không cần mật khẩu.</Muted>
            </div>
            <Button href={R.G01}>Đăng nhập TVV</Button>
          </Card>
        </section>
      )}
    </>
  );
}
