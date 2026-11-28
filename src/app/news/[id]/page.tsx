import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { api, HydrateClient } from "@/trpc/server";
import Footer from "@/app/_components/footer";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const allNews = await api.landing.getAllNews();
  const article = allNews.find((item) => item.id == id);

  if (!article) {
    notFound();
  }

  return (
    <HydrateClient>
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-16 mb-20 md:px-12">
        <Link
          href="/news"
          className="font-outfit text-dark-greenblue hover:text-dark-orange inline-flex w-fit items-center gap-2 font-medium"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Daftar Berita
        </Link>

        <nav aria-label="Breadcrumb" className="font-outfit flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-dark-greenblue transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/news" className="hover:text-dark-greenblue transition-colors">
            Berita
          </Link>
          <span>/</span>
          <span className="text-dark-greenblue line-clamp-1 font-medium">
            {article.title}
          </span>
        </nav>

        <div className="flex flex-col gap-1">
          <h1 className="font-bricolage text-dark-greenblue text-3xl font-bold wrap-break-word md:text-4xl">
            {article.title}
          </h1>

          <p className="font-outfit text-text leading-relaxed wrap-break-word">
            {article.teaser}
          </p>
        </div>
        
        <span className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="size-4" />
          {article.createdAt.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>

        <div className="relative h-80 w-full overflow-hidden rounded-2xl">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover w-full"
          />
        </div>

        <div
          className="font-outfit text-black leading-relaxed wrap-break-word [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </main>
      <Footer/>
    </HydrateClient>
  )
}