import Label from "@/components/ui/Label";
import type { ContentTable } from "@/content/types";

/**
 * Īsts HTML tabulas iezīmējums (table/caption/thead/tbody). Tas nav estētisks
 * lēmums: meklētāji un AI modeļi citē tabulas, ne div režģus, un cenu tabula ir
 * šo lapu visbiežāk citētā daļa.
 *
 * Skaitļu kolonnas ir `tabular-nums` un nelaužas rindā - "900-1500 EUR" divās
 * rindās izskatās pēc divām cenām. Uz šauriem ekrāniem tabula ritinās savā
 * konteinerā, kas ir sasniedzams ar tastatūru (WCAG 2.1: ritināms saturs
 * jāsasniedz bez peles).
 */
export default function PriceTable({ table }: { table: ContentTable }) {
  const numeric = (cell: string) => /\d/.test(cell) && cell.length <= 24;

  return (
    <figure className="relative m-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-ink-900 to-transparent lg:hidden"
      />
      <div
        role="region"
        aria-label={table.caption}
        tabIndex={0}
        className="overflow-x-auto"
      >
        <table className="w-full min-w-[680px] border-collapse text-left align-top">
          <thead>
            <tr>
              {table.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="border-b border-line px-0 pb-3.5 pe-4 align-bottom font-normal"
                >
                  <Label>{column}</Label>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={row[0] ?? rowIndex}>
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th
                      key={cellIndex}
                      scope="row"
                      className="border-b border-line py-5 pe-4 text-left align-top text-[18px] font-medium leading-[1.35] text-paper"
                    >
                      {cell}
                    </th>
                  ) : (
                    <td
                      key={cellIndex}
                      className={[
                        "border-b border-line py-5 pe-4 align-top text-[16px] leading-[1.45] text-paper-2",
                        cellIndex <= 2 && numeric(cell)
                          ? "whitespace-nowrap font-semibold tabular-nums text-paper"
                          : "",
                      ].join(" ")}
                    >
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Paraksts ir vienīgais teksts lapā, kas gāja visā tabulas platumā:
          pie 1440 px tā bija 170 zīmju rinda, un acs, atgriežoties nākamās
          rindas sākumā, pazaudē vietu. */}
      <figcaption className="mt-4 max-w-[46ch]">
        <Label>{table.caption}</Label>
      </figcaption>
    </figure>
  );
}
