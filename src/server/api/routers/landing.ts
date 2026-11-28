import { asc, desc } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  facilitySettings,
  heroSection,
  news,
  registrationSettings,
  registrationSteps,
  schoolFacilities,
} from "@/server/db/schema";

export const landingRouter = createTRPCRouter({
  getLandingData: publicProcedure.query(async ({ ctx }) => {
    const [
      heroData,
      facilitySettingData,
      facilitiesData,
      registrationSettingData,
      stepsData,
      newsData,
    ] = await Promise.all([
      ctx.db.query.heroSection.findFirst(),
      ctx.db.query.facilitySettings.findFirst(),
      ctx.db.query.schoolFacilities.findMany({
        orderBy: [asc(schoolFacilities.createdAt)],
      }),
      ctx.db.query.registrationSettings.findFirst(),
      ctx.db.query.registrationSteps.findMany({
        orderBy: [asc(registrationSteps.order)],
      }),
      ctx.db.query.news.findMany({
        orderBy: [desc(news.createdAt)],
        limit: 4,
      }),
    ]);

    return {
      hero: heroData ?? null,
      facilitySubtitle: facilitySettingData?.subtitle ?? "",
      schoolFacilities: facilitiesData,
      registrationSettings: registrationSettingData ?? null,
      registrationSteps: stepsData,
      news: newsData,
    };
  }),

  getAllNews: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.news.findMany({
      orderBy: [desc(news.createdAt)],
    });
  }),
});