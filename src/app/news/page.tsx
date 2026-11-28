import Link from "next/link";
import { api, HydrateClient } from "@/trpc/server";
import Navbar from "../_components/navbar";
import Footer from "../_components/footer";
import { ArrowLeft, Newspaper } from "lucide-react";
import NewsList from "./_components/news-list";

export default async function NewsPage() {
  const allNews = await api.landing.getAllNews();

  return (
    <HydrateClient>
      <Navbar />
      <div className="flex min-h-screen flex-col gap-4 p-20 max-md:py-28 py-35 max-md:px-7">
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

        <NewsList news={allNews ?? []} />
      </div>
      <Footer />
    </HydrateClient>
  );
}