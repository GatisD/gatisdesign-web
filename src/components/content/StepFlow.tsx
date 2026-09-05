import { cn } from "@/lib/utils";
import Reveal from "@/components/animations/Reveal";
import type { ContentStep } from "@/content/types";

/**
 * Numurēts process. Iezīmējums ir <ol>, jo secība ir jēgpilna - gan ekrāna
 * lasītājam, gan AI atbildēm soļi ir saraksts, ne dekors.
 *
 * Sliede zīmējas, kad sekcija ienāk skatā (`.rail-draw`, CSS transform), soļi
 * ienāk pēc kārtas ar monotonu aizturi - viencolonnas sarakstā kolonnu vilnis
 * liktu 4. solim parādīties pirms 3.
 */
export default function StepFlow({
  steps,
  className,
  headingLevel = "h3",
}: {
  steps: ContentStep[];
  className?: string;
  headingLevel?: "h3" | "h4";
}) {
  const StepHeading = headingLevel;

  return (
    <Reveal className={cn("relative", className)}>
      <ol className="relative border-t border-line">
        <span
          aria-hidden="true"
          className="rail-draw absolute bottom-6 left-[15px] top-6 w-px bg-line-strong sm:left-[19px]"
        />
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="relative grid grid-cols-[32px_minmax(0,1fr)] gap-x-5 border-b border-line py-6 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-x-7"
          >
            <span className="relative z-10 bg-transparent pt-0.5 text-[15px] font-semibold tabular-nums text-amber">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <StepHeading className="text-[19px] font-medium leading-snug text-paper">
                {step.title}
              </StepHeading>
              {step.meta ? (
                <p className="mt-1.5">
                  <span className="font-label text-label text-paper-faint">{step.meta}</span>
                </p>
              ) : null}
              <p className="mt-2.5 max-w-[62ch] text-[16px] leading-[1.55] text-paper-dim">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
