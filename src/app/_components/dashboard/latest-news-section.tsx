"use client";

import Link from "next/link";
import { type InferSelectModel } from "drizzle-orm";
import { type news } from "@/server/db/schema";
import { useNavigationLoader } from "@/components/app-layout/navigation-loader";

type NewsItem = InferSelectModel<typeof news>;

interface LatestNewsSectionProps {
  newsList: NewsItem[];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function LatestNewsSection({
  newsList,
}: LatestNewsSectionProps) {
  const { startLoading } = useNavigationLoader();

  return (
    <div className="flex w-full flex-col space-y-6 rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h3 className="text-dark-orange font-bricolage text-2xl font-semibold">
            Berita terbaru
          </h3>
          <p className="text-text">
            Cuplikan konten dari daftar berita sekolah.
          </p>
        </div>

        <Link
          href="/dashboard/news/all"
          onClick={startLoading}
          className="text-dark-greenblue w-fit shrink-0 rounded-lg bg-[#E9F5FF] px-5 py-2 text-base font-medium transition hover:bg-[#D6EDFF]"
        >
          Lihat semua berita
        </Link>
      </div>

      {newsList.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center rounded-xl bg-[#F5FAFF] p-6 text-center">
          <p className="text-text">
            Belum ada berita. Mulai tambahkan kabar terbaru sekolah melalui menu
            Kelola Berita.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {newsList.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/news/${item.id}`}
              onClick={startLoading}
              className="group flex overflow-hidden rounded-2xl bg-[#F5FAFF] transition hover:shadow-md"
            >
              <div className="w-2/5 shrink-0 overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="h-full min-h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                <div className="space-y-2">
                  <h4 className="line-clamp-3 text-lg leading-snug font-semibold text-slate-800">
                    {item.title}
                  </h4>
                  <p className="text-text line-clamp-3 text-sm leading-relaxed">
                    {item.teaser}
                  </p>
                </div>

                <span className="text-text text-sm">
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
