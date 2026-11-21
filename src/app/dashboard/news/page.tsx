import { desc } from "drizzle-orm";
import { db } from "@/server/db";
import { news } from "@/server/db/schema";
import FormSection from "@/app/_components/news/form-section";
import HeaderSection from "@/app/_components/news/header-section";
import NewsSection from "@/app/_components/news/news-section";
import PageBreadcrumb from "@/components/page-breadcrumb";

export default async function News() {
  const latestNews = await db
    .select()
    .from(news)
    .orderBy(desc(news.createdAt))
    .limit(3);

  return (
    <div className="min-h-[88vh] space-y-6">
      <PageBreadcrumb
        items={[
          {
            title: "Kelola Berita",
            href: "/dashboard/news"
          }
        ]}
      />
      <HeaderSection />
      <NewsSection newsList={latestNews} />
      <FormSection />
    </div>
  );
}
