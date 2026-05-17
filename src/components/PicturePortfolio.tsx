import type { ImgHTMLAttributes } from "react";

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

/**
 * <picture> with WebP source + JPG/PNG fallback.
 * WebP files live next to JPGs (scripts/convert-webp.mjs).
 */
export default function PicturePortfolio({ src, alt, ...rest }: Props) {
  const webp = src.replace(/\.(jpe?g|png)$/i, ".webp");
  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img src={src} alt={alt} {...rest} />
    </picture>
  );
}
