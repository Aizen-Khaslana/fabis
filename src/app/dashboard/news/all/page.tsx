import { desc } from "drizzle-orm";
import { db } from "@/server/db";
import { news } from "@/server/db/schema";
import PageBreadcrumb from "@/components/page-breadcrumb";
import NewsSection from "@/app/_components/news/news-section";

export default async function AllNews() {
  const allNews = await db
      .select()
      .from(news)
      .orderBy(desc(news.createdAt));
      
  return (
    <div className="min-h-[88vh] space-y-6">
      <PageBreadcrumb
        items={[
          {
            title: "Kelola Berita",
            href: "/dashboard/news"
          },
          {
            title: "Daftar Berita",
            href: "/dashboard/news/all"
          }
        ]}
      />
      <NewsSection newsList={allNews} mode="all" />
    </div>
  )
}