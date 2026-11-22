import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { news } from "@/server/db/schema";
import FormSection from "@/app/_components/news/form-section";
import PageBreadcrumb from "@/components/page-breadcrumb";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function Edit({
  params,
}: EditPageProps) {
  const { id } = await params;

  const [newsData] = await db
    .select()
    .from(news)
    .where(eq(news.id, id))
    .limit(1);

  if (!newsData) {
    notFound();
  }

  return (
    <div className="min-h-[88vh] space-y-6">
      <PageBreadcrumb
        items={[
          {
            title: "Kelola Berita",
            href: "/dashboard/news"
          },
          {
            title: "Perbarui Berita",
            href: `/dashboard/news/${id}`
          }
        ]}
      />
      <FormSection
        mode="edit"
        initialData={{
          id: newsData.id,
          coverImage: newsData.coverImage,
          title: newsData.title,
          teaser: newsData.teaser,
          content: newsData.content,
        }}
      />
    </div>
  )
}