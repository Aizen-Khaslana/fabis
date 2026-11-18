import HeaderSection from "@/app/_components/news/header-section";
import NewsSection from "@/app/_components/news/news-section";
import PageBreadcrumb from "@/components/page-breadcrumb";

export default function News() {
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
      <NewsSection />
    </div>
  );
}
