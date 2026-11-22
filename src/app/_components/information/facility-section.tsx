"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Loader2, PlusCircle, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigationLoader } from "@/components/app-layout/navigation-loader";
import { Button } from "@/components/ui/button";
import { uploadFileToGithub } from "@/lib/github-storage";

export interface FacilityData {
  id?: string;
  title: string;
  description: string;
  image: string;
}

interface FacilityFormRow {
  title: string;
  description: string;
  imagePreview: string;
  uploadedImageUrl: string;
  isUploading: boolean;
}

const MAX_SECTION_SUBTITLE = 150;
const MAX_FACILITY_TITLE = 50;
const MAX_FACILITY_DESC = 120;

export default function FacilitySection({
  initialSubtitle = "",
  initialFacilities,
}: {
  initialSubtitle?: string;
  initialFacilities: FacilityData[];
}) {
  const router = useRouter();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { startLoading, stopLoading } = useNavigationLoader();

  const [sectionSubtitle, setSectionSubtitle] = useState(initialSubtitle);
  const [rows, setRows] = useState<FacilityFormRow[]>(
    initialFacilities.length > 0
      ? initialFacilities.map((f) => ({
          title: f.title,
          description: f.description,
          imagePreview: f.image,
          uploadedImageUrl: f.image,
          isUploading: false,
        }))
      : [
          {
            title: "",
            description: "",
            imagePreview: "",
            uploadedImageUrl: "",
            isUploading: false,
          },
        ],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSectionSubtitle(initialSubtitle);
  }, [initialSubtitle]);

  useEffect(() => {
    if (initialFacilities.length > 0) {
      setRows(
        initialFacilities.map((f) => ({
          title: f.title,
          description: f.description,
          imagePreview: f.image,
          uploadedImageUrl: f.image,
          isUploading: false,
        })),
      );
    }
  }, [initialFacilities]);

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        imagePreview: "",
        uploadedImageUrl: "",
        isUploading: false,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) {
      toast.warning("Minimal harus ada 1 fasilitas sekolah");
      return;
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const handleFileChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, imagePreview: blobUrl, isUploading: true }
          : row,
      ),
    );

    try {
      const cdnUrl = await uploadFileToGithub(file, "facilities");
      setRows((prev) =>
        prev.map((row, i) =>
          i === index
            ? { ...row, uploadedImageUrl: cdnUrl, isUploading: false }
            : row,
        ),
      );
      toast.success(`Gambar fasilitas #${index + 1} berhasil diunggah`);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunggah gambar ke GitHub");
      setRows((prev) =>
        prev.map((row, i) =>
          i === index
            ? {
                ...row,
                imagePreview: row.uploadedImageUrl || "",
                isUploading: false,
              }
            : row,
        ),
      );
      const inputEl = fileInputRefs.current[index];
      if (inputEl) inputEl.value = "";
    }
  };

  const isSubtitleOver = sectionSubtitle.trim().length > MAX_SECTION_SUBTITLE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rows.some((r) => r.isUploading)) {
      toast.warning("Tunggu hingga seluruh proses unggah gambar selesai");
      return;
    }

    if (isSubtitleOver) {
      toast.error(
        `Subjudul section maksimal ${MAX_SECTION_SUBTITLE} karakter`,
      );
      return;
    }

    const hasOverLimit = rows.some(
      (r) =>
        r.title.trim().length > MAX_FACILITY_TITLE ||
        r.description.trim().length > MAX_FACILITY_DESC,
    );

    if (hasOverLimit) {
      toast.error(
        `Periksa kembali batas karakter fasilitas (Judul maks. ${MAX_FACILITY_TITLE}, Deskripsi maks. ${MAX_FACILITY_DESC} karakter)`,
      );
      return;
    }

    const validRows = rows.filter(
      (r) =>
        r.title.trim() !== "" &&
        r.description.trim() !== "" &&
        r.uploadedImageUrl !== "",
    );

    if (validRows.length !== rows.length) {
      toast.error(
        "Pastikan seluruh baris fasilitas memiliki judul, deskripsi, dan gambar",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      startLoading();

      const res = await fetch("/api/information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "facility",
          payload: {
            subtitle: sectionSubtitle.trim(),
            facilities: validRows.map((r) => ({
              title: r.title.trim(),
              description: r.description.trim(),
              image: r.uploadedImageUrl,
            })),
          },
        }),
      });

      const result = (await res.json()) as { message?: string };

      if (!res.ok) {
        toast.error(result.message ?? "Gagal menyimpan fasilitas");
        return;
      }

      toast.success(
        result.message ?? "Profil lembaga & fasilitas berhasil disimpan!",
      );
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
          Profil Lembaga & Fasilitas Sekolah
        </span>

        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="facilitySectionSubtitle"
              className="text-sm font-semibold text-white"
            >
              Deskripsi
            </label>
            <span
              className={`text-xs font-medium ${
                isSubtitleOver
                  ? "rounded bg-red-500 px-1.5 py-0.5 text-white"
                  : "text-white/90"
              }`}
            >
              {sectionSubtitle.length}/{MAX_SECTION_SUBTITLE} karakter
            </span>
          </div>
          <input
            id="facilitySectionSubtitle"
            type="text"
            value={sectionSubtitle}
            onChange={(e) => setSectionSubtitle(e.target.value)}
            placeholder="Contoh: Mendukung aktivitas belajar dan ibadah"
            className={`w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none ${
              isSubtitleOver ? "ring-2 ring-red-500" : ""
            }`}
          />
          {isSubtitleOver && (
            <div className="flex items-center gap-1.5 rounded-lg bg-red-500/95 px-3 py-1.5 text-xs font-medium text-white shadow-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>
                Subjudul section maksimal {MAX_SECTION_SUBTITLE} karakter.
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {rows.map((row, idx) => {
            const isTitleOver = row.title.trim().length > MAX_FACILITY_TITLE;
            const isDescOver =
              row.description.trim().length > MAX_FACILITY_DESC;

            return (
              <div
                key={idx}
                className="space-y-4 rounded-2xl border border-white/30 bg-white/10 p-4 md:p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Fasilitas #{idx + 1}
                  </span>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                  <div className="space-y-4 md:col-span-6">
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-white">
                          Judul{" "}
                          <span className="font-bold text-red-500">*</span>
                        </label>
                        <span
                          className={`text-xs font-medium ${
                            isTitleOver
                              ? "rounded bg-red-500 px-1.5 py-0.5 text-white"
                              : "text-white/90"
                          }`}
                        >
                          {row.title.length}/{MAX_FACILITY_TITLE} karakter
                        </span>
                      </div>
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) =>
                          handleFieldChange(idx, "title", e.target.value)
                        }
                        placeholder="Contoh: Sport & Archery Center"
                        className={`w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                          isTitleOver ? "ring-2 ring-red-500" : ""
                        }`}
                      />
                      {isTitleOver && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-red-500/95 px-3 py-1.5 text-xs font-medium text-white shadow-xs">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            Judul fasilitas maksimal {MAX_FACILITY_TITLE}{" "}
                            karakter.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-white">
                          Deskripsi{" "}
                          <span className="font-bold text-red-500">*</span>
                        </label>
                        <span
                          className={`text-xs font-medium ${
                            isDescOver
                              ? "rounded bg-red-500 px-1.5 py-0.5 text-white"
                              : "text-white/90"
                          }`}
                        >
                          {row.description.length}/{MAX_FACILITY_DESC} karakter
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={row.description}
                        onChange={(e) =>
                          handleFieldChange(idx, "description", e.target.value)
                        }
                        placeholder="Contoh: Lapangan futsal & Area Panahan"
                        className={`w-full resize-none rounded-xl bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                          isDescOver ? "ring-2 ring-red-500" : ""
                        }`}
                      />
                      {isDescOver && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-red-500/95 px-3 py-1.5 text-xs font-medium text-white shadow-xs">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            Deskripsi fasilitas maksimal {MAX_FACILITY_DESC}{" "}
                            karakter.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5 md:col-span-6">
                    <label className="text-sm font-semibold text-white">
                      Gambar Fasilitas{" "}
                      <span className="font-bold text-red-500">*</span>
                    </label>

                    <input
                      ref={(el) => {
                        fileInputRefs.current[idx] = el;
                      }}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => handleFileChange(idx, e)}
                      className="hidden"
                    />

                    <div
                      onClick={() => {
                        if (!row.isUploading)
                          fileInputRefs.current[idx]?.click();
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (
                          (e.key === "Enter" || e.key === " ") &&
                          !row.isUploading
                        ) {
                          e.preventDefault();
                          fileInputRefs.current[idx]?.click();
                        }
                      }}
                      className={`group relative flex h-48 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/40 bg-[#8E8E8E] select-none md:h-56 ${
                        row.isUploading ? "cursor-wait" : "cursor-pointer"
                      }`}
                    >
                      <div
                        className="absolute inset-0 opacity-25"
                        style={{
                          backgroundImage:
                            "linear-gradient(45deg, #4b5563 25%, transparent 25%), linear-gradient(-45deg, #4b5563 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4b5563 75%), linear-gradient(-45deg, transparent 75%, #4b5563 75%)",
                          backgroundSize: "48px 48px",
                          backgroundPosition:
                            "0 0, 0 24px, 24px -24px, -24px 0",
                        }}
                      />
                      {row.isUploading && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/50 text-white backdrop-blur-[1px]">
                          <Loader2 className="h-8 w-8 animate-spin text-[#EAB308]" />
                          <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium">
                            Mengunggah gambar...
                          </span>
                        </div>
                      )}
                      {row.imagePreview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={row.imagePreview}
                            alt="Preview Fasilitas"
                            className="relative z-10 h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="rounded-md bg-[#EAB308] px-3 py-1.5 text-xs font-medium text-white shadow-sm">
                              Ganti gambar
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
                          <span className="rounded-md bg-[#EAB308] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors group-hover:bg-[#CA8A04]">
                            Unggah media dari perangkat
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/80 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Tambah fasilitas</span>
            </button>
          </div>
          <div className="md:col-span-6">
            <Button
              type="submit"
              disabled={isSubmitting || rows.some((r) => r.isUploading)}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-[#D97706] to-[#B45309] py-6 text-base font-semibold text-white shadow-md transition-all hover:from-[#B45309] hover:to-[#92400E]"
            >
              {rows.some((r) => r.isUploading)
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
        <div className="space-y-3 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="space-y-1">
            <h4 className="text-dark-greenblue font-bricolage text-lg font-bold">
              Fasilitas Unggulan
            </h4>
            {sectionSubtitle && (
              <p className="text-text text-xs leading-snug break-words [overflow-wrap:anywhere]">
                {sectionSubtitle}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {rows.map((item, idx) => (
              <div
                key={idx}
                className="relative flex min-h-48 w-full min-w-0 flex-col justify-end overflow-hidden rounded-2xl p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imagePreview || "/masjid.png"}
                  alt={item.title || `Fasilitas ${idx + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="relative z-10 min-w-0">
                  {item.title && (
                    <h5 className="font-bricolage text-base font-semibold break-words text-white [overflow-wrap:anywhere]">
                      {item.title}
                    </h5>
                  )}
                  {item.description && (
                    <p className="line-clamp-2 text-xs font-light break-words text-white/90 [overflow-wrap:anywhere]">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}