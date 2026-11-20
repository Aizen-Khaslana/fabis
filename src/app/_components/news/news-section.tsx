import Link from "next/link";
import { Calendar } from "lucide-react";
import { type InferSelectModel } from "drizzle-orm";
import { type news } from "@/server/db/schema";

type NewsItem = InferSelectModel<typeof news>;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

interface NewsSectionProps {
  newsList: NewsItem[];
}

export default function NewsSection({
  newsList,
}: NewsSectionProps) {
  return (
    <div className="w-full flex flex-col bg-white border border-dark-greenblue rounded-2xl min-h-32 p-6 space-y-6">
      <div className="flex justify-between items-end">
        <span className="bg-[#FFEAD5] rounded-lg p-2 text-2xl text-dark-orange font-medium font-bricolage w-fit">
          Daftar Berita Terbaru
        </span>
        <div className="flex items-center gap-6">
          {/* <Button className="px-6 py-1.5 bg-greenblue hover:bg-dark-greenblue inset-shadow-sm inset-shadow-indigo-200 text-white text-lg cursor-pointer">
            Kelola
          </Button> */}
          <Link
            href="#"
            className="text-lg text-dark-greenblue cursor-pointer hover:underline"
          >
            Lihat Semua
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsList.map((item) => (
          <Link
            key={item.id}
            href={`/news/${item.id}`}
            className="group flex flex-col rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:scale-101 transition-all duration-300 bg-[#36B5CA]"
          >
            <div className="w-full h-56 overflow-hidden bg-slate-200">
              {/* eslint-disable-next-line */}
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col flex-1 justify-between p-6 text-white space-y-4">
              <div className="space-y-2.5">
                <h3 className="text-xl font-bold leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-white/90 leading-relaxed line-clamp-2">
                  {item.teaser}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 text-sm font-medium text-white/95">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}