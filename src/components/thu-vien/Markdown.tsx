/**
 * Render markdown đơn giản cho thân bài (F02): ## ### > - 1. ![alt](src) **đậm** *nghiêng* và đoạn văn.
 * H2 có id (slug) để mục lục dính trỏ tới.
 */
import React from "react";
import { slugify } from "./helpers";

function inline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(p)) return <em key={i}>{p.slice(1, -1)}</em>;
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <a key={i} href={link[2]} className="text-blue underline">{link[1]}</a>;
    return p;
  });
}

export function Markdown({ md, className }: { md: string; className?: string }) {
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (l.startsWith("## ")) { const t = l.slice(3).trim(); out.push(<h2 key={key++} id={slugify(t)} className="font-serif font-semibold text-[26px] leading-tight text-den mt-10 mb-4 scroll-mt-24">{t}</h2>); i++; continue; }
    if (l.startsWith("### ")) { out.push(<h3 key={key++} className="font-bold text-[18px] text-den mt-8 mb-3">{l.slice(4).trim()}</h3>); i++; continue; }
    const img = l.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) {
      out.push(
        <figure key={key++} className="my-8">
          <div className="aspect-video bg-xam rounded-sm overflow-hidden"><span className="flex items-center justify-center w-full h-full bg-vien2 border border-[#D6D6D6] text-mut text-[13px]">Ảnh</span></div>
          {img[1] && <figcaption className="mt-2 text-[13px] text-mut">{img[1]}</figcaption>}
        </figure>,
      );
      i++; continue;
    }
    if (l.startsWith("> ")) {
      const q: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) { q.push(lines[i].slice(2)); i++; }
      out.push(<blockquote key={key++} className="my-8 pl-6 border-l-4 border-blue font-serif text-[22px] leading-snug text-den">{inline(q.join(" "))}</blockquote>);
      continue;
    }
    if (/^- /.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i])) { items.push(lines[i].slice(2)); i++; }
      out.push(<ul key={key++} className="my-4 pl-6 list-disc space-y-1.5 text-[16px] leading-relaxed text-ink2">{items.map((it, k) => <li key={k}>{inline(it)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\. /.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      out.push(<ol key={key++} className="my-4 pl-6 list-decimal space-y-1.5 text-[16px] leading-relaxed text-ink2">{items.map((it, k) => <li key={k}>{inline(it)}</li>)}</ol>);
      continue;
    }
    if (l.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) { const cells = lines[i].split("|").slice(1, -1).map((c) => c.trim()); if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells); i++; }
      out.push(
        <div key={key++} className="my-6 overflow-x-auto"><table className="w-full text-[15px] border border-vien"><tbody>{rows.map((r, ri) => <tr key={ri} className={ri === 0 ? "bg-xam font-bold" : "border-t border-vien2"}>{r.map((c, ci) => <td key={ci} className="px-3 py-2">{inline(c)}</td>)}</tr>)}</tbody></table></div>,
      );
      continue;
    }
    const para: string[] = [l];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#|>|- |\d+\. |!\[|\|)/.test(lines[i])) { para.push(lines[i]); i++; }
    out.push(<p key={key++} className="my-4 text-[16px] leading-[1.75] text-ink2">{inline(para.join(" "))}</p>);
  }
  return <div className={className}>{out}</div>;
}
