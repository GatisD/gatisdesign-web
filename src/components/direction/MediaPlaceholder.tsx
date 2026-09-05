import { cn } from "@/lib/utils";

/**
 * Vietturis materiālam, kas vēl nav uzņemts (video, portrets, video atsauksme).
 *
 * Produkcijā tas NETIEK renderēts vispār: tukša punktota kaste dzīvā lapā ir
 * solījums, ko lapa nepilda, un atsauksmju sadaļa ar diviem tukšiem rāmjiem
 * izskatās pēc salauztas vietnes. Izstrādē un priekšskatījumā tas ir redzams,
 * lai būtu skaidrs, kas vēl jāuzņem.
 *
 * Kārtulu, vai sekcija vispār renderējas, izlemj `hasPlaceholders` zemāk -
 * tāpēc sekcijas, kas sastāv tikai no vietturiem, produkcijā nemaz neparādās.
 */
export const SHOW_PLACEHOLDERS: boolean = import.meta.env.DEV || import.meta.env.MODE === "preview";

export default function MediaPlaceholder({
  text,
  className,
  ratio = "16 / 9",
}: {
  text: string;
  className?: string;
  ratio?: string;
}) {
  if (!SHOW_PLACEHOLDERS) return null;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-paper-faint bg-ink-850/70 p-6 text-center",
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      <span
        aria-hidden="true"
        className="grid h-10 w-10 place-items-center rounded-full border border-paper-faint text-paper-faint"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
          <path d="M4 2.5v9l7-4.5z" />
        </svg>
      </span>
      <span className="font-label text-label text-paper-faint">{text}</span>
    </div>
  );
}
