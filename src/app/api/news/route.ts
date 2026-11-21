import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { news } from "@/server/db/schema";
import { deleteFileFromGithub } from "@/lib/github-storage";

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

const deleteNewsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Minimal pilih 1 berita untuk dihapus"),
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

export async function DELETE(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    const parsed = deleteNewsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 },
      );
    }

    const targets = await db
      .select({ id: news.id, coverImage: news.coverImage })
      .from(news)
      .where(inArray(news.id, parsed.data.ids));

    for (const item of targets) {
      if (item.coverImage) {
        await deleteFileFromGithub(item.coverImage);
      }
    }

    await db.delete(news).where(inArray(news.id, parsed.data.ids));

    return NextResponse.json(
      { message: "Berita dan gambar berhasil dihapus" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/news error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menghapus berita" },
      { status: 500 },
    );
  }
}
