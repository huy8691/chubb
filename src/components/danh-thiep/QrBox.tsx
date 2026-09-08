/** Ô mã QR mô phỏng — vẽ SVG ổn định theo chuỗi (demo không sinh QR thật). */
export function QrBox({ value, size = 120, caption }: { value: string; size?: number; caption?: string }) {
  const n = 21;
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
  const cells: boolean[] = [];
  let s = h >>> 0;
  for (let i = 0; i < n * n; i++) { s = (Math.imul(s, 1103515245) + 12345) >>> 0; cells.push(((s >>> 16) & 1) === 1); }
  const isFinder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const finderOn = (r: number, c: number) => {
    const rr = r < 7 ? r : r - (n - 7), cc = c < 7 ? c : c - (n - 7);
    return rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
  };
  const cell = size / n;
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Mã QR mở ${value}`} className="bg-white border border-vien rounded-sm">
        {cells.map((on, i) => {
          const r = Math.floor(i / n), c = i % n;
          const fill = isFinder(r, c) ? finderOn(r, c) : on;
          return fill ? <rect key={i} x={c * cell} y={r * cell} width={cell} height={cell} fill="#191919" /> : null;
        })}
      </svg>
      {caption && <span className="text-[12px] text-ink2 text-center max-w-[160px]">{caption}</span>}
    </div>
  );
}
