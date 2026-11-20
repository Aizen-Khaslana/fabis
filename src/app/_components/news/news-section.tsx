"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, Pencil, Trash2, Loader2 } from "lucide-react";
import { type InferSelectModel } from "drizzle-orm";
import { toast } from "sonner";
import { type news } from "@/server/db/schema";
import { useNavigationLoader } from "@/components/app-layout/navigation-loader";
import { Button } from "@/components/ui/button";

type NewsItem = InferSelectModel<typeof news>;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

interface NewsSectionProps {
  newsList: NewsItem[];
  mode?: "latest" | "all";
}

export default function NewsSection({
  newsList,
  mode = "latest",
}: NewsSectionProps) {
  const router = useRouter();
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const isAllSelected = newsList.length > 0 && selectedIds.length === newsList.length;
  const { startLoading, stopLoading } = useNavigationLoader();

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(newsList.map((item) => item.id));
    }
  };

  const handleCancelManage = () => {
    setIsManageMode(false);
    setSelectedIds([]);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Pilih minimal satu berita yang ingin dihapus");
      return;
    }

    try {
      setIsDeleting(true);
      startLoading();

      const res = await fetch("/api/news", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const result = (await res.json()) as { message?: string };

      if (!res.ok) {
        toast.error(result.message ?? "Gagal menghapus berita");
        return;
      }

      toast.success(`${selectedIds.length} berita berhasil dihapus`);
      setSelectedIds([]);
      setIsManageMode(false);
      router.refresh();
    } catch {
      toast.error("Gagal terhubung ke server");
    } finally {
      setIsDeleting(false);
      stopLoading();
    }
  };

  return (
    <div className="border-dark-greenblue flex min-h-32 w-full flex-col space-y-6 rounded-2xl border bg-white p-6">
      <div className="flex items-end justify-between">
        <span className="text-dark-orange font-bricolage w-fit rounded-lg bg-[#FFEAD5] p-2 text-2xl font-medium">
          {mode != "latest" ? "Daftar Berita" : "Daftar Berita Terbaru"}
        </span>
        <div className="flex items-center gap-6">
          {mode !== "latest" ? (
            isManageMode ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelManage}
                disabled={isDeleting}
                className="px-5 py-1.5 border-greenblue text-greenblue hover:bg-greenblue/10 hover:text-dark-greenblue rounded-lg cursor-pointer"
              >
                Batalkan
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setIsManageMode(true)}
                className="px-6 py-1.5 bg-greenblue hover:bg-dark-greenblue inset-shadow-sm inset-shadow-indigo-200 text-white text-lg cursor-pointer"
              >
                Kelola
              </Button>
            )
          ) : (
            <Link
              href="/dashboard/news/all"
              className="text-lg text-dark-greenblue cursor-pointer hover:underline"
            >
              Lihat Semua
            </Link>
          )}
        </div>
      </div>

      {mode !== "latest" && isManageMode && (
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              disabled={newsList.length === 0 || isDeleting}
              className="w-4 h-4 rounded border-slate-300 accent-dark-orange cursor-pointer"
            />
            <span>Pilih semua</span>
          </label>

          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0 || isDeleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500 text-red-500 text-xs font-medium hover:bg-red-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>
              Hapus berita
              {selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
            </span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {newsList.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          const cardInner = (
            <>
              {isManageMode && selectedIds.length === 0 && (
                <Link
                  href={`/dashboard/news/edit/${item.id}`}
                  onClick={(e) => e.stopPropagation()}
                  title="Edit berita"
                  className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-dark-greenblue shadow-md transition hover:scale-105"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
              )}

              <div className="w-full h-56 overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line */}
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex flex-col flex-1 justify-between p-6 text-white space-y-4">
                <div className="space-y-2.5">
                  <h3 className="text-xl font-bold leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/90 leading-relaxed line-clamp-2">
                    {item.teaser}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 text-sm font-medium text-white/95">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </>
          );

          if (isManageMode) {
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSelect(item.id);
                  }
                }}
                className={`relative group flex flex-col rounded-3xl overflow-hidden shadow-md transition-all duration-200 bg-[#36B5CA] cursor-pointer select-none ${
                  isSelected
                    ? "border-2 border-yellow-mango ring-2 ring-dark-orange/30"
                    : "border-2 border-transparent hover:shadow-xl"
                }`}
              >
                {cardInner}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="relative group flex flex-col rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:scale-101 transition-all duration-300 bg-[#36B5CA]"
            >
              {cardInner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
