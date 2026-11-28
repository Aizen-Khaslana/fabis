import Link from "next/link";
import { api, HydrateClient } from "@/trpc/server";
import Footer from "../_components/footer";
import { ArrowLeft, Newspaper, Calendar } from "lucide-react";
import Image from "next/image";

export default async function NewsPage() {
  const allNews = await api.landing.getAllNews();

  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col gap-4 p-20 max-md:py-10 max-md:px-7">
        <Link
          href="/"
          className="font-outfit text-dark-greenblue hover:text-dark-orange mb-2 inline-flex w-fit items-center gap-2 font-medium transition-colors"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Beranda
        </Link>

        <div className="flex flex-col gap-4 mt-6">
          <span className="font-outfit text-dark-orange flex items-center gap-2 font-semibold">
            <Newspaper />
            BERITA & KEGIATAN SEKOLAH
          </span>

          <h2 className="font-bricolage text-dark-greenblue text-4xl font-bold">
            Kabar Terbaru Fathul Baari
          </h2>

          <p className="text-text font-outfit font-normal">
            Prestasi, kegiatan, dan pengumuman terkini dari santri dan keluarga besar FABIS.
          </p>
        </div>

        <div className="grid-cols-4 max-md:grid-cols-2 max-sm:grid-cols-1 grid gap-4 w-full mt-8 mb-18">
          {(allNews ?? []).map((item) => (
            <Link href={`/news/${item.id}`}
              key={item.id}
              className="group relative overflow-hidden min-w-full justify-end flex flex-col min-h-80 rounded-2xl gap-1 cursor-pointer shadow-[inset_0_0_15px_rgba(255,255,255,0.8)] shadow-white/60"
            >
              <Image
                src={item.coverImage}
                fill
                alt={item.title}
                className="object-cover -z-10 transition-transform duration-300 group-hover:scale-105"
              />
  
              <div className="bg-greenblue p-4 flex h-44 flex-col justify-between gap-2 group-hover:bg-dark-greenblue duration-200 transition-all shadow-[inset_0_0_15px_rgba(255,255,255,0.8)] shadow-white/50">
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-md font-semibold text-white font-bricolage line-clamp-2">
                    {item.title}
                  </h4>
                  <span className="text-sm text-white font-light line-clamp-2">
                    {item.teaser}
                  </span>
                </div>
                <span className="text-xs flex items-center justify-end gap-1 text-white font-light w-full text-end">
                  <Calendar className="size-4" />
                  {item.createdAt.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </HydrateClient>
  );
}