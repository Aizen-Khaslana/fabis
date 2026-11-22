interface BannerSectionProps {
  heroImage: string | null;
}

function resolveImageSrc(image: string | null) {
  if (!image) return "/hero.png";
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `/${image}`;
}

export default function BannerSection({ heroImage }: BannerSectionProps) {
  return (
    <div className="bg-greenblue flex w-full flex-col gap-6 overflow-hidden rounded-3xl p-6 shadow-md md:flex-row md:items-center md:justify-between">
      <div className="space-y-3 text-white">
        <span className="bg-yellow-mango inline-block w-fit rounded-md px-3 py-1 text-xs font-semibold tracking-wide text-white">
          WEBSITE SEKOLAH
        </span>
        <h3 className="font-bricolage text-3xl font-semibold">
          Informasi sekolah, dalam satu tempat.
        </h3>
        <p className="text-lg text-white/90">
          Perbarui tampilan website, fasilitas, informasi PPDB, dan kabar
          terbaru sekolah.
        </p>
        <p className="text-sm font-medium text-white/80">
          Faathul Baari Islamic School
        </p>
      </div>

      <div className="hidden h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-white/20 md:block md:w-80 lg:w-96">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero.png"
          alt="Faathul Baari Islamic School"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
