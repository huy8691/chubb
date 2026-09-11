"use client";
/** D08 · Mẫu Studio (archive, công khai) — 09/09: Chubb có nhiều mẫu nên tách trang danh sách; D01 → D08 → D02 (chọn mẫu rồi tạo ảnh).
 *  Lọc theo tỉ lệ · sắp xếp · đếm · lưới 4×2 · phân trang · sidebar tìm / dùng nhiều nhất / Ảnh thực tế từ Tư vấn viên / đăng nhập. "Dùng mẫu này" → D02?mau= (khách → G01). */
import { useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtNum } from "@/lib/seed";
import type { StudioTemplate } from "@/lib/types";
import { MauStudioCard } from "@/components/cong-cu/MauStudioCard";
import { Breadcrumb, Button, Card, EmptyState, FilterChips, H1, H3, Muted, Pagination, SearchBox, Select } from "@/components/ui";

const MOI_TRANG = 8;
type Sap = "moi" | "cu" | "dung-nhieu";
type Loc = "tat-ca" | "doc" | "vuong" | "story";
const NHOM: Record<Exclude<Loc, "tat-ca">, StudioTemplate["tiLe"][]> = { doc: ["3:4", "4:5"], vuong: ["1:1"], story: ["9:16"] };
const NHAN: Record<Loc, string> = { "tat-ca": "Tất cả", doc: "Dọc 3:4 · 4:5", vuong: "Vuông 1:1", story: "Story 9:16" };

export default function Page() {
  const { data, session } = useStore();
  const [loc, setLoc] = useState<Loc>("tat-ca");
  const [sap, setSap] = useState<Sap>("moi");
  const [q, setQ] = useState("");
  const [trang, setTrang] = useState(1);
  const tatCa = useMemo(() => data.studioTemplates.filter((m) => m.trangThai === "da-xuat-ban"), [data.studioTemplates]);
  const dem = (l: Loc) => (l === "tat-ca" ? tatCa : tatCa.filter((m) => NHOM[l].includes(m.tiLe))).length;
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    const l = tatCa.filter((m) => (loc === "tat-ca" || NHOM[loc].includes(m.tiLe)) && (!k || m.ten.toLowerCase().includes(k)));
    return l.sort((a, b) => sap === "dung-nhieu" ? b.soAnhDaTao - a.soAnhDaTao : sap === "cu" ? a.capNhat.localeCompare(b.capNhat) : b.capNhat.localeCompare(a.capNhat));
  }, [tatCa, loc, q, sap]);
  const pages = Math.max(1, Math.ceil(list.length / MOI_TRANG));
  const p = Math.min(trang, pages);
  const hien = list.slice((p - 1) * MOI_TRANG, p * MOI_TRANG);
  const dungNhieu = [...tatCa].sort((a, b) => b.soAnhDaTao - a.soAnhDaTao).slice(0, 3);
  const daDangNhap = session.role === "tvv";

  return (
    <>
      <section className="bg-xam">
        <div className="wrap py-10">
          <Breadcrumb items={[{ label: "Trang chủ", href: R.A01 }, { label: "Toàn Tâm Phát Triển", href: R.D01 }, { label: "Mẫu Studio" }]} />
          <H1 className="mt-3">Mẫu Studio</H1>
          <Muted className="mt-3 text-[16px]"><b>Khung mẫu Chubb thiết kế</b> — chọn một mẫu để tạo ảnh của bạn. Muốn xem ảnh thật đồng nghiệp đã làm? Vào <a href={R.D07} className="text-blue font-bold hover:underline">Ảnh thực tế từ Tư vấn viên</a>. ({tatCa.length} mẫu)</Muted>
        </div>
      </section>

      <section className="wrap py-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <FilterChips<Loc> options={(["tat-ca", "doc", "vuong", "story"] as Loc[]).map((l) => ({ value: l, label: NHAN[l], count: dem(l) }))} value={loc} onChange={(v) => { setLoc(v); setTrang(1); }} />
            <Select value={sap} onChange={(e) => setSap(e.target.value as Sap)} className="w-[180px]"><option value="moi">Mới nhất</option><option value="cu">Cũ nhất</option><option value="dung-nhieu">Dùng nhiều nhất</option></Select>
          </div>
          <Muted className="mt-4 text-[13px]">Hiện {list.length === 0 ? 0 : (p - 1) * MOI_TRANG + 1}–{Math.min(p * MOI_TRANG, list.length)} / {list.length} mẫu</Muted>
          {hien.length === 0 ? <div className="mt-4"><EmptyState title="Không có mẫu khớp" desc="Thử từ khoá khác hoặc bỏ bộ lọc tỉ lệ." action={<Button kind="secondary" onClick={() => { setQ(""); setLoc("tat-ca"); }}>Bỏ bộ lọc</Button>} /></div> : (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-5">
              {hien.map((m) => <MauStudioCard key={m.id} m={m} />)}
            </div>
          )}
          <Pagination page={p} pages={pages} onChange={setTrang} />
        </div>

        <aside className="space-y-6">
          <Card className="p-4 sm:p-5">
            <H3>Tìm mẫu</H3>
            <SearchBox className="mt-3" value={q} onChange={(v) => { setQ(v); setTrang(1); }} placeholder="Tên mẫu…" />
          </Card>
          <Card className="p-4 sm:p-5">
            <H3>Dùng nhiều nhất</H3>
            <ol className="mt-3 space-y-2 text-[13px] text-ink2">{dungNhieu.map((m, i) => <li key={m.id}>{i + 1}. {m.ten} · {fmtNum(m.soAnhDaTao)} ảnh</li>)}</ol>
          </Card>
          <Card className="p-4 sm:p-5">
            <H3>Ảnh thực tế từ Tư vấn viên</H3>
            <Muted className="mt-1 text-[13px]">Ảnh <b>đã hoàn thành</b> của đồng nghiệp, tạo từ các mẫu này — xem để lấy cảm hứng.</Muted>
            <Button className="mt-4" kind="secondary" href={R.D07}>Xem ảnh thực tế</Button>
          </Card>
          {!daDangNhap && (
            <Card className="p-4 sm:p-5">
              <div className="font-bold text-[15px] text-den">Bạn là Tư vấn viên Chubb Life?</div>
              <Muted className="mt-1 text-[13px]">Đăng nhập để dùng mẫu và tạo ảnh của bạn.</Muted>
              <Button className="mt-4" href={`${R.G01}?next=${encodeURIComponent(R.D08)}`}>Đăng nhập</Button>
            </Card>
          )}
        </aside>
      </section>
    </>
  );
}
