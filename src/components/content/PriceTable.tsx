import type { ContentTable } from "@/content/types";

/**
 * Īsts HTML tabulas iezīmējums (table/caption/thead/tbody) ar apzinātu nolūku:
 * AI modeļi un meklētāji citē tabulas, nevis div režģus. Mobilajā tabula
 * nedrīkst pārplūst lapā, tāpēc tā ritinās savā konteinerā, kas ir fokusējams
 * ar tastatūru (WCAG 2.1: ritināms saturs jāsasniedz bez peles).
 */
export default function PriceTable({ table }: { table: ContentTable }) {
  return (
    <div className="relative mt-[clamp(26px,3vw,38px)]">
      {/* Ritināšanas norāde: uz šauriem ekrāniem tabula ir platāka par ekrānu,
          un nogriezta mala bez pārejas izskatās pēc salauztas lapas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 rounded-r-lg bg-gradient-to-l from-ink-850 to-transparent lg:hidden"
      />
      <div
        role="region"
        aria-label={table.caption}
        tabIndex={0}
        className="overflow-x-auto rounded-lg border border-line bg-ink-850/60"
      >
        <table className="w-full min-w-[620px] border-collapse text-left align-top text-[0.95rem]">
          {/* Paraksts paliek <caption> elementā (semantika tabulai), bet teksts
              ir lipīgs pie kreisās malas, lai ritinot sāniski nepazustu. */}
          <caption className="caption-bottom border-t border-line px-5 py-4 text-left text-[0.85rem] leading-relaxed text-paper-faint">
            <span className="sticky left-0 block max-w-[calc(100vw_-_5_*_var(--pad-x))]">
              {table.caption}
            </span>
          </caption>
          <thead>
            <tr>
              {table.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="border-b border-line-strong px-5 py-4 align-bottom text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-faint"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={row[0] ?? rowIndex} className="border-b border-line last:border-b-0">
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th
                      key={cellIndex}
                      scope="row"
                      className="px-5 py-4 text-left align-top font-medium leading-snug text-paper"
                    >
                      {cell}
                    </th>
                  ) : (
                    <td key={cellIndex} className="px-5 py-4 align-top leading-snug text-paper-dim">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
