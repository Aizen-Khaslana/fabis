import { NextResponse } from "next/server";
import { asc, desc, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import {
  heroSection,
  facilitySettings,
  schoolFacilities,
  registrationSettings,
  registrationSteps,
} from "@/server/db/schema";
import { deleteFileFromGithub } from "@/lib/github-storage";

const heroSchema = z.object({
  ppdbYear: z
    .string()
    .trim()
    .min(1, "Tahun PPDB wajib diisi")
    .max(50, "Tahun PPDB maksimal 50 karakter"),
  description: z
    .string()
    .trim()
    .min(1, "Deskripsi wajib diisi")
    .max(250, "Deskripsi maksimal 250 karakter"),
  heroImage: z.string().min(1, "Gambar utama wajib diisi"),
});

const facilitySchema = z.object({
  subtitle: z
    .string()
    .trim()
    .max(150, "Subjudul section maksimal 150 karakter")
    .default(""),
  facilities: z
    .array(
      z.object({
        title: z
          .string()
          .trim()
          .min(1, "Judul fasilitas wajib diisi")
          .max(50, "Judul fasilitas maksimal 50 karakter"),
        description: z
          .string()
          .trim()
          .min(1, "Deskripsi fasilitas wajib diisi")
          .max(120, "Deskripsi fasilitas maksimal 120 karakter"),
        image: z.string().min(1, "Gambar fasilitas wajib diisi"),
      }),
    )
    .min(1, "Minimal harus ada 1 fasilitas"),
});

const urlField = z
  .string()
  .trim()
  .refine(
    (val) => val === "" || /^https?:\/\/.+\..+/.test(val),
    "Format tautan tidak valid (harus diawali http:// atau https://)",
  );

const registrationSchema = z.object({
  pamphletUrl: urlField.default(""),
  formUrl: urlField.default(""),
  steps: z
    .array(
      z
        .object({
          title: z
            .string()
            .trim()
            .min(1, "Judul tahapan wajib diisi")
            .max(45, "Judul tahapan maksimal 45 karakter"),
          description: z
            .string()
            .trim()
            .min(1, "Deskripsi tahapan wajib diisi")
            .max(130, "Deskripsi tahapan maksimal 130 karakter"),
          startDate: z.string().trim().min(1, "Tanggal mulai wajib diisi"),
          endDate: z.string().trim().min(1, "Tanggal berakhir wajib diisi"),
          isActive: z.boolean().default(false),
        })
        .refine((step) => step.endDate >= step.startDate, {
          message: "Tanggal berakhir tidak boleh sebelum tanggal mulai",
        }),
    )
    .min(1, "Minimal harus ada 1 tahapan pendaftaran"),
});

export async function GET() {
  try {
    const [hero, facSettings, facilities, regSettings, regSteps] =
      await Promise.all([
        db.select().from(heroSection).limit(1),
        db.select().from(facilitySettings).limit(1),
        db
          .select()
          .from(schoolFacilities)
          .orderBy(desc(schoolFacilities.createdAt)),
        db.select().from(registrationSettings).limit(1),
        db
          .select()
          .from(registrationSteps)
          .orderBy(asc(registrationSteps.order)),
      ]);

    return NextResponse.json({
      data: {
        hero: hero[0] ?? null,
        facilitySubtitle: facSettings[0]?.subtitle ?? "",
        facilities,
        registration: {
          pamphletUrl: regSettings[0]?.pamphletUrl ?? "",
          formUrl: regSettings[0]?.formUrl ?? "",
          steps: regSteps,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/information error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data informasi website" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { section?: string; payload?: unknown };
    const { section, payload } = body;

    if (section === "hero") {
      const parsed = heroSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json(
          { message: parsed.error.issues[0]?.message ?? "Data tidak valid" },
          { status: 400 },
        );
      }

      const existing = await db.select().from(heroSection).limit(1);
      if (existing[0]) {
        const [updated] = await db
          .update(heroSection)
          .set(parsed.data)
          .where(eq(heroSection.id, existing[0].id))
          .returning();
        return NextResponse.json({
          message: "Hero Section berhasil diperbarui",
          data: updated,
        });
      }

      const [created] = await db
        .insert(heroSection)
        .values(parsed.data)
        .returning();
      return NextResponse.json(
        { message: "Hero Section berhasil disimpan", data: created },
        { status: 201 },
      );
    }

    if (section === "facility") {
      const parsed = facilitySchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json(
          { message: parsed.error.issues[0]?.message ?? "Data tidak valid" },
          { status: 400 },
        );
      }

      const existingFacSettings = await db
        .select()
        .from(facilitySettings)
        .limit(1);
      if (existingFacSettings[0]) {
        await db
          .update(facilitySettings)
          .set({ subtitle: parsed.data.subtitle })
          .where(eq(facilitySettings.id, existingFacSettings[0].id));
      } else {
        await db.insert(facilitySettings).values({
          subtitle: parsed.data.subtitle,
        });
      }

      await db
        .delete(schoolFacilities)
        .where(isNotNull(schoolFacilities.id));

      const created = await db
        .insert(schoolFacilities)
        .values(
          parsed.data.facilities.map((item) => ({
            title: item.title,
            description: item.description,
            image: item.image,
          })),
        )
        .returning();

      return NextResponse.json({
        message: "Profil lembaga & fasilitas berhasil disimpan",
        data: created,
      });
    }

    if (section === "registration") {
      const parsed = registrationSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json(
          { message: parsed.error.issues[0]?.message ?? "Data tidak valid" },
          { status: 400 },
        );
      }

      const existingSettings = await db
        .select()
        .from(registrationSettings)
        .limit(1);
      if (existingSettings[0]) {
        await db
          .update(registrationSettings)
          .set({
            pamphletUrl: parsed.data.pamphletUrl,
            formUrl: parsed.data.formUrl,
          })
          .where(eq(registrationSettings.id, existingSettings[0].id));
      } else {
        await db.insert(registrationSettings).values({
          pamphletUrl: parsed.data.pamphletUrl,
          formUrl: parsed.data.formUrl,
        });
      }

      await db
        .delete(registrationSteps)
        .where(isNotNull(registrationSteps.id));
      await db.insert(registrationSteps).values(
        parsed.data.steps.map((step, index) => ({
          title: step.title,
          description: step.description,
          startDate: step.startDate,
          endDate: step.endDate,
          isActive: step.isActive,
          order: index + 1,
        })),
      );

      return NextResponse.json({
        message: "Informasi pendaftaran berhasil disimpan",
      });
    }

    return NextResponse.json(
      { message: "Section tidak valid" },
      { status: 400 },
    );
  } catch (error) {
    console.error("POST /api/information error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = (await req.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json(
        { message: "ID fasilitas wajib disertakan" },
        { status: 400 },
      );
    }

    const [target] = await db
      .select({ id: schoolFacilities.id, image: schoolFacilities.image })
      .from(schoolFacilities)
      .where(eq(schoolFacilities.id, body.id));

    if (target?.image && target.image !== "fabis-default.png") {
      await deleteFileFromGithub(target.image);
    }

    await db.delete(schoolFacilities).where(eq(schoolFacilities.id, body.id));

    return NextResponse.json({ message: "Fasilitas berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/information error:", error);
    return NextResponse.json(
      { message: "Gagal menghapus fasilitas" },
      { status: 500 },
    );
  }
}