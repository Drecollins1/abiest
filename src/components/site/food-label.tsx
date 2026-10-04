// Ingredients shown the way they appear on the pack: a bordered label with heavy rules.
export function FoodLabel({
  name, ingredients, highlights = [], footnote, className = "",
}: { name: string; ingredients: string; highlights?: string[]; footnote?: string; className?: string }) {
  return (
    <div className={`border-2 border-ink bg-card px-4 pb-3 pt-3 ${className}`}>
      <p className="font-display text-[28px] font-extrabold leading-none">{name}</p>
      <div className="mt-2.5 h-2 bg-ink" aria-hidden />
      <p className="mt-2 text-[12px] font-bold uppercase tracking-[.08em]">Ingredients</p>
      <p className="mt-1 text-[17px] leading-snug">{ingredients}</p>
      {highlights.length > 0 && (
        <ul className="mt-3 border-t-[5px] border-ink">
          {highlights.map((h) => (
            <li key={h} className="flex items-center justify-between border-b border-ink/30 py-1.5 text-[14px] font-medium last:border-0">
              {h}
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M2.5 6.2 5 8.5l4.5-5" /></svg>
            </li>
          ))}
        </ul>
      )}
      {footnote && <p className="mt-2 border-t border-ink pt-2 text-[12px] text-ink/80">{footnote}</p>}
    </div>
  );
}
