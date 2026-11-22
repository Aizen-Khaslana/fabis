"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigationLoader } from "@/components/app-layout/navigation-loader";
import { Button } from "@/components/ui/button";
import { uploadFileToGithub } from "@/lib/github-storage";

export interface HeroData {
  id?: string;
  ppdbYear: string;
  description: string;
  heroImage: string;
}

const MAX_PPDB_YEAR = 50;
const MAX_HERO_DESC = 250;

export default function HeroSection({
  initialData,
}: {
  initialData: HeroData | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startLoading, stopLoading } = useNavigationLoader();

  const [ppdbYear, setPpdbYear] = useState(initialData?.ppdbYear ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [imagePreview, setImagePreview] = useState(
    initialData?.heroImage ?? "",
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState(
    initialData?.heroImage ?? "",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPpdbYear(initialData.ppdbYear);
      setDescription(initialData.description);
      setImagePreview(initialData.heroImage);
      setUploadedImageUrl(initialData.heroImage);
    }
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const blobUrl = URL.createObjectURL(file);
    setImagePreview(blobUrl);
    setIsUploading(true);

    try {
      const cdnUrl = await uploadFileToGithub(file, "hero");
      setUploadedImageUrl(cdnUrl);
      toast.success("Gambar utama berhasil diunggah");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunggah gambar ke GitHub");
      setImagePreview(uploadedImageUrl || "");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  const isYearOverLimit = ppdbYear.trim().length > MAX_PPDB_YEAR;
  const isDescOverLimit = description.trim().length > MAX_HERO_DESC;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploading) {
      toast.warning("Tunggu hingga proses unggah gambar selesai");
      return;
    }
    if (!ppdbYear.trim()) {
      toast.error("Tahun PPDB wajib diisi");
      return;
    }
    if (isYearOverLimit) {
      toast.error(`Tahun PPDB maksimal ${MAX_PPDB_YEAR} karakter`);
      return;
    }
    if (!description.trim()) {
      toast.error("Deskripsi sekolah wajib diisi");
      return;
    }
    if (isDescOverLimit) {
      toast.error(`Deskripsi Hero Section maksimal ${MAX_HERO_DESC} karakter`);
      return;
    }
    if (!uploadedImageUrl) {
      toast.error("Gambar utama wajib diunggah");
      return;
    }

    try {
      setIsSubmitting(true);
      startLoading();

      const res = await fetch("/api/information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "hero",
          payload: {
            ppdbYear: ppdbYear.trim(),
            description: description.trim(),
            heroImage: uploadedImageUrl,
          },
        }),
      });

      const result = (await res.json()) as { message?: string };

      if (!res.ok) {
        toast.error(result.message ?? "Gagal menyimpan Hero Section");
        return;
      }

      toast.success(result.message ?? "Hero Section berhasil disimpan!");
      router.refresh();
    } catch {
      toast.error("Gagal terhubung ke server");
    } finally {
      setIsSubmitting(false);
      stopLoading();
    }
  };

  return (
    <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="flex w-full flex-col space-y-6 rounded-3xl bg-[#36B5CA] p-6 text-white md:p-8 lg:col-span-8"
      >
        <span className="text-dark-orange font-bricolage w-fit rounded-xl bg-[#FFEAD5] px-4 py-2 text-2xl font-semibold">
          Hero Section
        </span>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="space-y-4 md:col-span-6">
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="ppdbYear"
                  className="text-base font-semibold text-white"
                >
                  Tahun PPDB <span className="font-bold text-red-500">*</span>
                </label>
                <span
                  className={`text-xs font-medium ${
                    isYearOverLimit
                      ? "rounded bg-red-500 px-1.5 py-0.5 text-white"
                      : "text-white/90"
                  }`}
                >
                  {ppdbYear.length}/{MAX_PPDB_YEAR} karakter
                </span>
              </div>
              <input
                id="ppdbYear"
                type="text"
                value={ppdbYear}
                onChange={(e) => setPpdbYear(e.target.value)}
                placeholder="Contoh: PPDB 2027/2028 Telah Dibuka"
                className={`w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                  isYearOverLimit ? "ring-2 ring-red-500" : ""
                }`}
              />
              {isYearOverLimit && (
                <div className="flex items-center gap-1.5 rounded-lg bg-red-500/95 px-3 py-1.5 text-xs font-medium text-white shadow-xs">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Jumlah karakter melebihi batas maksimal ({MAX_PPDB_YEAR}{" "}
                    karakter).
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="heroDescription"
                  className="text-base font-semibold text-white"
                >
                  Deskripsi <span className="font-bold text-red-500">*</span>
                </label>
                <span
                  className={`text-xs font-medium ${
                    isDescOverLimit
                      ? "rounded bg-red-500 px-1.5 py-0.5 text-white"
                      : "text-white/90"
                  }`}
                >
                  {description.length}/{MAX_HERO_DESC} karakter
                </span>
              </div>
              <textarea
                id="heroDescription"
                rows={7}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Isi deskripsi mengenai sekolah anda..."
                className={`w-full resize-none rounded-xl bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                  isDescOverLimit ? "ring-2 ring-red-500" : ""
                }`}
              />
              {isDescOverLimit && (
                <div className="flex items-center gap-1.5 rounded-lg bg-red-500/95 px-3 py-1.5 text-xs font-medium text-white shadow-xs">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Jumlah karakter melebihi batas maksimal ({MAX_HERO_DESC}{" "}
                    karakter).
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-4 md:col-span-6">
            <div className="flex flex-col space-y-1.5">
              <label
                htmlFor="heroImage"
                className="text-base font-semibold text-white"
              >
                Gambar Utama <span className="font-bold text-red-500">*</span>
              </label>

              <input
                ref={fileInputRef}
                id="heroImage"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => {
                  if (!isUploading) fileInputRef.current?.click();
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isUploading) {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`group relative flex h-64 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/40 bg-[#8E8E8E] select-none md:h-72 ${
                  isUploading ? "cursor-wait" : "cursor-pointer"
                }`}
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
                {isUploading && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/50 text-white backdrop-blur-[1px]">
                    <Loader2 className="h-10 w-10 animate-spin text-[#EAB308]" />
                    <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium">
                      Mengunggah gambar...
                    </span>
                  </div>
                )}
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Preview Hero"
                      className="relative z-10 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded-md bg-[#EAB308] px-4 py-2 text-sm font-medium text-white shadow-sm">
                        Ganti gambar
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
                    <span className="rounded-md bg-[#EAB308] px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition-colors group-hover:bg-[#CA8A04]">
                      Unggah media dari perangkat
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-[#D97706] to-[#B45309] py-6 text-base font-semibold text-white shadow-md transition-all hover:from-[#B45309] hover:to-[#92400E]"
            >
              {isUploading
                ? "Menunggu Unggah Gambar..."
                : isSubmitting
                  ? "Menyimpan..."
                  : "Simpan"}
            </Button>
          </div>
        </div>
      </form>

      <aside className="flex flex-col space-y-3 lg:col-span-4">
        <h3 className="text-dark-greenblue font-bricolage text-xl font-bold">
          Contoh Preview Halaman
        </h3>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="grid grid-cols-12 items-center gap-3">
            <div className="col-span-7 flex min-w-0 flex-col gap-2">
              {ppdbYear && (
                <span className="text-dark-orange border-dark-orange w-fit max-w-full rounded-full border px-2.5 py-0.5 text-[10px] font-medium break-words [overflow-wrap:anywhere]">
                  {ppdbYear}
                </span>
              )}
              <h4 className="text-dark-greenblue font-bricolage text-lg leading-tight font-bold">
                Fathul Baari <br /> Islamic School
              </h4>
              {description && (
                <p className="text-text line-clamp-5 text-[11px] leading-relaxed break-words [overflow-wrap:anywhere]">
                  {description}
                </p>
              )}
            </div>
            <div className="col-span-5 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview || "/hero.png"}
                alt="Preview Hero"
                className="h-44 w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}