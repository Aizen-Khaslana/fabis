import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { news } from "@/server/db/schema";

const createNewsSchema = z.object({
  coverImage: z.string().min(1, "Cover berita wajib diisi"),
  title: z
    .string()
    .trim()
    .min(1, "Judul berita wajib diisi")
    .max(255, "Judul maksimal 255 karakter"),
  teaser: z
    .string()
    .trim()
    .min(1, "Teaser berita wajib diisi")
    .max(100, "Teaser maksimal 100 karakter"),
  content: z
    .string()
    .refine(
      (val) => val.replace(/<[^>]*>/g, "").trim().length > 3,
      "Isi berita wajib diisi",
    ),
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    const parsed = createNewsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message ?? "Data tidak valid",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const [created] = await db
      .insert(news)
      .values({
        coverImage: parsed.data.coverImage,
        title: parsed.data.title,
        teaser: parsed.data.teaser,
        content: parsed.data.content,
      })
      .returning();

    return NextResponse.json(
      { message: "Berita berhasil ditambahkan", data: created },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/news error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
