import { count, desc } from "drizzle-orm";
import { db } from "@/server/db";
import {
  heroSection,
  news,
  registrationSettings,
  schoolFacilities,
} from "@/server/db/schema";
import { getSession } from "@/server/better-auth/server";
import HeaderSection from "@/app/_components/dashboard/header-section";
import BannerSection from "@/app/_components/dashboard/banner-section";
import StatsSection from "@/app/_components/dashboard/stats-section";
import InformationSection from "@/app/_components/dashboard/information-section";
import QuickAccessSection from "@/app/_components/dashboard/quick-access-section";
import LatestNewsSection from "@/app/_components/dashboard/latest-news-section";
import PageBreadcrumb from "@/components/page-breadcrumb";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [
    session,
    newsTotalRows,
    latestNews,
    heroRows,
    facilityTotalRows,
    regSettingsRows,
  ] = await Promise.all([
    getSession(),
    db.select({ value: count() }).from(news),
    db.select().from(news).orderBy(desc(news.createdAt)).limit(3),
    db.select({ heroImage: heroSection.heroImage }).from(heroSection).limit(1),
    db.select({ value: count() }).from(schoolFacilities),
    db
      .select({
        pamphletUrl: registrationSettings.pamphletUrl,
        formUrl: registrationSettings.formUrl,
      })
      .from(registrationSettings)
      .limit(1),
  ]);

  const hero = heroRows[0] ?? null;
  const regSettings = regSettingsRows[0] ?? null;

  const newsCount = newsTotalRows[0]?.value ?? 0;
  const facilityCount = facilityTotalRows[0]?.value ?? 0;

  const filledSectionCount = [
    hero !== null,
    facilityCount > 0,
    regSettings !== null,
  ].filter(Boolean).length;

  const ppdbLinkCount = [
    regSettings?.pamphletUrl ?? "",
    regSettings?.formUrl ?? "",
  ].filter((url) => url.trim() !== "").length;

  return (
    <div className="min-h-[88vh] space-y-6 pb-10">
      <PageBreadcrumb
        items={[
          {
            title: "Dashboard",
            href: "/dashboard",
          },
        ]}
      />
      <HeaderSection userName={session?.user.name ?? "Admin"} />
      <BannerSection heroImage={hero?.heroImage ?? null} />
      <StatsSection
        newsCount={newsCount}
        filledSectionCount={filledSectionCount}
        ppdbLinkCount={ppdbLinkCount}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <InformationSection />
        </div>
        <div className="lg:col-span-2">
          <QuickAccessSection />
        </div>
      </div>
      <LatestNewsSection newsList={latestNews} />
      <p className="text-text text-sm">Faathul Baari Islamic School</p>
    </div>
  );
}
