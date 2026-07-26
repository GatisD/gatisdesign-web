import { Fragment } from "react";
import { CONTACT_EMAIL } from "@/lib/site";

const INLINE_LINK =
  "underline decoration-amber/50 underline-offset-4 transition-colors duration-200 hover:text-amber";

/**
 * Teksts, kurā saturā ierakstītā e-pasta adrese kļūst par īstu mailto saiti.
 * Pats teksts netiek mainīts - tikai ietīts. Ja adreses tekstā nav, iznākums ir
 * tieši tā pati rinda.
 */
export default function LinkedEmail({ text }: { text: string }) {
  const parts = text.split(CONTACT_EMAIL);
  if (parts.length === 1) return <>{text}</>;

  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 ? (
            <a href={`mailto:${CONTACT_EMAIL}`} className={INLINE_LINK}>
              {CONTACT_EMAIL}
            </a>
          ) : null}
        </Fragment>
      ))}
    </>
  );
}
