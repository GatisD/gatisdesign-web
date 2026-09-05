import type { ImgHTMLAttributes } from "react";

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /**
   * React 18 vēl nepazīst camelCase `fetchPriority`, tāpēc to padodam kā
   * mazo burtu HTML atribūtu - citādi konsolē ir brīdinājums un atribūts
   * nenonāk līdz pārlūkam.
   */
  priority?: "high" | "low";
}

/**
 * <picture> ar WebP avotu un JPG/PNG rezervi. WebP faili dzīvo blakus JPG
 * failiem (scripts/convert-webp.mjs).
 */
export default function PicturePortfolio({ src, alt, priority, ...rest }: Props) {
  const webp = src.replace(/\.(jpe?g|png)$/i, ".webp");
  const priorityAttr = priority ? { fetchpriority: priority } : {};
  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img src={src} alt={alt} {...priorityAttr} {...rest} />
    </picture>
  );
}
