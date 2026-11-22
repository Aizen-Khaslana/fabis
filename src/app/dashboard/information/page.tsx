import { asc, desc } from "drizzle-orm";
import PageBreadcrumb from "@/components/page-breadcrumb";
import HeaderSection from "@/app/_components/information/header-section";
import HeroSection from "@/app/_components/information/hero-section";
import FacilitySection from "@/app/_components/information/facility-section";
import RegistrationSection from "@/app/_components/information/registration-section";
import { db } from "@/server/db";
import {
  heroSection,
  schoolFacilities,
  registrationSettings,
  registrationSteps,
} from "@/server/db/schema";

export const dynamic = "force-dynamic";

export default async function Information() {
  const [heroRows, facilities, regSettingsRows, regSteps] = await Promise.all([
    db.select().from(heroSection).limit(1),
    db
      .select()
      .from(schoolFacilities)
      .orderBy(desc(schoolFacilities.createdAt)),
    db.select().from(registrationSettings).limit(1),
    db.select().from(registrationSteps).orderBy(asc(registrationSteps.order)),
  ]);

  return (
    <div className="min-h-[88vh] space-y-6 pb-10">
      <PageBreadcrumb
        items={[
          {
            title: "FABIS Dashboard",
            href: "/dashboard",
          },
          {
            title: "Kelola Informasi Website",
            href: "/dashboard/information",
          },
        ]}
      />
      <HeaderSection />
      <HeroSection initialData={heroRows[0] ?? null} />
      <FacilitySection initialFacilities={facilities} />
      <RegistrationSection
        initialData={{
          pamphletUrl: regSettingsRows[0]?.pamphletUrl ?? "",
          formUrl: regSettingsRows[0]?.formUrl ?? "",
          steps: regSteps,
        }}
      />
    </div>
  );
}