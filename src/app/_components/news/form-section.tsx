"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Headset, GraduationCap, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/rich-text-editor";
import { useNavigationLoader } from "@/components/app-layout/navigation-loader";

export interface NewsFormData {
  id?: string;
  coverImage: string;
  title: string;
  teaser: string;
  content: string;
}

interface FormSectionProps {
  mode?: "create" | "edit";
  initialData?: NewsFormData;
  onSubmit?: (data: NewsFormData) => void;
}

export default function FormSection({
  mode = "create",
  initialData,
  onSubmit,
}: FormSectionProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [teaser, setTeaser] = useState(initialData?.teaser ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(initialData?.coverImage ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { startLoading, stopLoading } = useNavigationLoader();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setTeaser(initialData.teaser);
      setContent(initialData.content);
      setCoverPreview(initialData.coverImage);
    }
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, atau WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }

    setCoverFile(file);
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create" && !coverFile && !coverPreview) {
      toast.error("Cover berita wajib diunggah");
      return;
    }

    if (!title.trim()) {
      toast.error("Judul berita wajib diisi");
      return;
    }

    if (!teaser.trim() || teaser.trim().length > 100) {
      toast.error("Teaser wajib diisi dan maksimal 100 karakter");
      return;
    }

    const plainContent = content.replace(/<[^>]*>/g, "").trim();
    if (!plainContent) {
      toast.error("Isi berita wajib diisi");
      return;
    }

    const payload: NewsFormData = {
      coverImage: "https://cdn.jsdelivr.net/gh/khaslanacorp/fabis-assets@main/fabis-default.png",
      title: title.trim(),
      teaser: teaser.trim(),
      content,
    };

    if (onSubmit) {
      onSubmit(payload);
      return;
    }

    try {
      setIsSubmitting(true);
      startLoading();

      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await res.json()) as { message?: string };

      if (!res.ok) {
        toast.error(result.message ?? "Gagal menyimpan berita");
        return;
      }

      toast.success("Berita berhasil disimpan!");

      if (mode === "create") {
        setTitle("");
        setTeaser("");
        setContent("");
        setCoverFile(null);
        setCoverPreview("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }

      router.refresh();
    } catch {
      toast.error("Gagal terhubung ke server");
    } finally {
      setIsSubmitting(false);
      stopLoading();
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <form
        onSubmit={handleFormSubmit}
        className="lg:col-span-8 w-full flex flex-col border border-dark-greenblue rounded-3xl p-6 md:p-8 space-y-6 bg-white"
      >
        <span className="bg-[#FFEAD5] rounded-xl px-4 py-2 text-2xl text-dark-orange font-semibold font-bricolage w-fit">
          {mode === "edit" ? "Edit Berita" : "Buat Berita"}
        </span>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="coverImage"
            className="text-base font-semibold text-dark-greenblue"
          >
            Cover Berita <span className="text-red-500">*</span>
          </label>

          <input
            ref={fileInputRef}
            id="coverImage"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className="relative w-full h-72 md:h-80 rounded-2xl border border-dark-greenblue overflow-hidden flex flex-col items-center justify-center cursor-pointer group select-none bg-[#8E8E8E]"
          >
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #4b5563 25%, transparent 25%), linear-gradient(-45deg, #4b5563 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4b5563 75%), linear-gradient(-45deg, transparent 75%, #4b5563 75%)",
                backgroundSize: "48px 48px",
                backgroundPosition: "0 0, 0 24px, 24px -24px, -24px 0",
              }}
            />
            {coverPreview && coverPreview !== "default-image.png" ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreview}
                  alt="Preview Cover"
                  className="relative z-10 w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-[#EAB308] text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm">
                    Ganti gambar
                  </span>
                </div>
              </>
            ) : (
              <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
                <span className="-mt-2 bg-[#EAB308] group-hover:bg-[#CA8A04] transition-colors text-white text-sm font-medium px-3.5 py-1.5 rounded-md shadow-sm">
                  Unggah media dari perangkat
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="title"
            className="text-base font-semibold text-dark-greenblue"
          >
            Judul Berita <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan judul berita . . ."
            className="w-full rounded-xl border border-dark-greenblue px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-greenblue/40 transition"
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="teaser"
              className="text-base font-semibold text-dark-greenblue"
            >
              Teaser Berita <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-400">
              {teaser.length}/100 karakter
            </span>
          </div>
          <textarea
            id="teaser"
            rows={2}
            maxLength={255}
            value={teaser}
            onChange={(e) => setTeaser(e.target.value)}
            placeholder="Masukkan ringkasan singkat berita yang tampil di kartu berita . . ."
            className="w-full rounded-xl border border-dark-greenblue px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-greenblue/40 transition resize-none"
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-base font-semibold text-dark-greenblue">
            Isi Berita <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Masukkan isi berita . . ."
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-6 rounded-xl bg-gradient-to-b from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-white font-semibold text-base shadow-md cursor-pointer transition-all"
        >
          {isSubmitting
            ? "Menyimpan..."
            : mode === "edit"
              ? "Simpan Perubahan"
              : "Simpan"}
        </Button>
      </form>

      <aside className="lg:col-span-4 lg:sticky lg:top-[calc(7vh+1.5rem)] flex flex-col gap-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#005B7F] p-6 text-white shadow-md">
          <div className="pointer-events-none absolute -bottom-8 -right-8 w-36 h-36 rounded-full bg-white/5 flex items-center justify-center">
            <GraduationCap className="w-12 h-12 text-gray-400/80 -translate-x-2 -translate-y-2" />
          </div>
          <div className="relative z-10 space-y-3">
            <span className="text-xs font-bold tracking-wider uppercase text-cyan-200/90">
              BANTUAN CEPAT
            </span>
            <h3 className="text-2xl font-bold font-bricolage">
              Panduan Pengurus
            </h3>
            <p className="text-sm text-cyan-100/90 leading-relaxed">
              Perlu bantuan update brosur atau foto kurikulum?
            </p>
            <div className="pt-2">
              <Link
                href="https://wa.me/+6281321803535"
                target="_blank"
                className="bg-[#0B7A9E] hover:bg-[#0E8FB8] text-white font-medium rounded-xl px-4 py-2.5 inline-flex items-center gap-2 shadow-sm cursor-pointer transition"
              >
                <Headset className="w-4 h-4" />
                <span>Bantuan Teknis</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between rounded-3xl bg-[#E8E8E8] p-6 md:p-8 text-slate-800">
          <div className="space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-[#6CE5F7] flex items-center justify-center shadow-xs">
              <Lightbulb className="w-6 h-6 text-slate-800 stroke-2" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold leading-snug text-slate-900 font-bricolage">
                Tips Admin: Foto Berkualitas
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Gunakan foto berorientasi lanskap (16:9) dengan resolusi minimal
                1280x720px untuk gambar banner agar tampilan di layar wali santri
                tetap tajam dan proporsional.
              </p>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t border-slate-300/80 text-xs text-slate-500">
            Format gambar yang disarankan: <strong className="text-slate-700">JPG, PNG, atau WebP</strong> (Maks. 5MB).
          </div>
        </div>
      </aside>
    </div>
  );
}