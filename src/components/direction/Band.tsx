import HeroMedia from "./HeroMedia";

/**
 * Foto josla ar vienu teikumu. Direction lieto to kā elpu starp garām teksta
 * sekcijām, un tā ir viena no divām vietām lapā, kur ↳ glifs ir atļauts
 * (otrā ir hero ievads). Sarakstos tas ir dekors, ne struktūra.
 */
export default function Band({
  poster,
  video,
  text,
}: {
  poster: string;
  video?: string;
  text: string;
}) {
  return (
    <section className="relative isolate h-[clamp(300px,44vw,540px)] overflow-hidden bg-ink-900">
      {/* Kadram jāpaliek saskatāmam: ar brightness .38 un izpludinājumu
          josla bija melns taisnstūris, un tā bija tikai teksta fons. */}
      <HeroMedia className="-z-[2]" poster={poster} src={video} brightness={0.55} position="center 45%" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-[1]"
        style={{
          background:
            "linear-gradient(90deg, rgba(13,11,9,.30) 0%, rgba(13,11,9,.20) 38%, rgba(13,11,9,.88) 62%, rgba(13,11,9,.94) 100%)",
        }}
      />
      <div className="relative mx-auto flex h-full max-w-wrap items-center px-5 sm:px-8 lg:px-10">
        <p className="ml-auto max-w-[42ch] text-[clamp(1.05rem,1.7vw,1.5rem)] leading-[1.4] text-paper md:w-[46%]">
          <span aria-hidden="true" className="text-amber">
            &#8627;
          </span>{" "}
          {text}
        </p>
      </div>
    </section>
  );
}
