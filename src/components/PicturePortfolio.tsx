import type { ImgHTMLAttributes } from "react";

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /**
   * React 18 vēl nepazīst camelCase `fetchPriority`, tāpēc to padodam kā mazo
   * burtu HTML atribūtu - citādi konsolē ir brīdinājums un atribūts nenonāk
   * līdz pārlūkam.
   */
  priority?: "high" | "low";
  /**
   * Pieejamie platumi (piem. [960, 1600]). Faili ir `<nosaukums>-<platums>.jpg`
   * un `.webp` blakus bāzes failam (scripts/prepare-media.mjs). Bez tā telefons
   * lejupielādē datora izmēra kadru - mērīts: 145 KiB lieka svara.
   */
  widths?: number[];
  sizes?: string;
}

/** <picture> ar WebP avotu un JPG/PNG rezervi. */
export default function PicturePortfolio({ src, alt, priority, widths, sizes, ...rest }: Props) {
  const ext = /\.(jpe?g|png)$/i.exec(src)?.[0] ?? "";
  const base = ext ? src.slice(0, -ext.length) : src;
  const webp = `${base}.webp`;
  const priorityAttr = priority ? { fetchpriority: priority } : {};

  const srcSet = (target: string) =>
    widths && widths.length > 0
      ? widths.map((w) => `${base}-${w}${target} ${w}w`).join(", ")
      : undefined;

  return (
    <picture>
      <source srcSet={srcSet(".webp") ?? webp} type="image/webp" sizes={sizes} />
      {widths ? <source srcSet={srcSet(ext)} type="image/jpeg" sizes={sizes} /> : null}
      <img src={src} alt={alt} sizes={sizes} {...priorityAttr} {...rest} />
    </picture>
  );
}
