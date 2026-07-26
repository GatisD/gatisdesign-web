import { cn } from "@/lib/utils";
import type { ContentStep } from "@/content/types";

/**
 * Numurēts process kā plūsmas panelis (koncepta "darba plūsma"): kārtas numurs,
 * sliede ar mezglu un soļa teksts. Iezīmējums ir <ol>, jo secība ir jēgpilna -
 * gan ekrāna lasītājam, gan AI atbildēm soļi ir saraksts, ne dekors.
 *
 * `meta` ir īsa piezīme pie soļa (laiks vai lomu sadalījums) - to nedrīkst
 * pārvērst par ikonu vai attēlu, tāpēc tā paliek tekstā zem virsraksta.
 */
export default function StepFlow({
  steps,
  className,
  headingLevel = "h3",
}: {
  steps: ContentStep[];
  className?: string;
  /** Virsraksta līmenis solim - atkarīgs no tā, kas lapā ir virs plūsmas. */
  headingLevel?: "h3" | "h4";
}) {
  const StepHeading = headingLevel;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-line-strong shadow-[0_46px_90px_-46px_rgba(0,0,0,.95)]",
        "bg-[linear-gradient(170deg,var(--ink-800),var(--ink-900)_62%)]",
        className,
      )}
    >
      <ol className="p-[clamp(18px,2.4vw,28px)]">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="group grid grid-cols-[30px_18px_minmax(0,1fr)] gap-x-3 pb-6 last:pb-0 sm:grid-cols-[40px_22px_minmax(0,1fr)] sm:gap-x-4"
          >
            <span
              aria-hidden="true"
              className="pt-[2px] font-accent text-[15px] italic leading-none tabular-nums text-paper-faint transition-colors duration-300 group-hover:text-amber"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <span aria-hidden="true" className="relative block justify-self-center">
              <span className="absolute left-1/2 top-[6px] h-[9px] w-[9px] -translate-x-1/2 rounded-full border-[1.5px] border-paper-faint bg-ink-900 transition-all duration-300 group-hover:border-amber group-hover:bg-amber group-hover:shadow-[0_0_0_5px_rgba(224,114,60,.14)]" />
              {index < steps.length - 1 ? (
                <span className="absolute bottom-[-14px] left-1/2 top-[18px] w-px -translate-x-1/2 bg-gradient-to-b from-line-strong to-transparent" />
              ) : null}
            </span>

            <div className="min-w-0">
              <StepHeading className="text-[1rem] font-semibold tracking-[-0.018em] text-paper">
                {step.title}
              </StepHeading>
              {step.meta ? (
                <p className="mt-1 text-[13px] leading-[1.5] text-paper-faint">{step.meta}</p>
              ) : null}
              <p className="mt-2 text-[0.94rem] leading-[1.58] text-paper-dim">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
