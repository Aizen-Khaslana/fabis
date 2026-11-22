"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, PlusCircle, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadFileToGithub } from "@/lib/github-storage";

interface FacilityItem {
  id?: string;
  title: string;
  description: string;
  image: string;
}

interface StepItem {
  id?: string;
  title: string;
  description: string;
}

export default function InformationManager() {
  const [loading, setLoading] = useState(true);

  // --- STATE 1: HERO SECTION ---
  const heroInputRef = useRef<HTMLInputElement>(null);
  const [ppdbYear, setPpdbYear] = useState("");
  const [heroDesc, setHeroDesc] = useState("");
  const [heroPreview, setHeroPreview] = useState("");
  const [heroUrl, setHeroUrl] = useState("");
  const [uploadingHero, setUploadingHero] = useState(false);
  const [savingHero, setSavingHero] = useState(false);

  // --- STATE 2: PROFIL LEMBAGA & FASILITAS SEKOLAH ---
  const facilityInputRef = useRef<HTMLInputElement>(null);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(
    null,
  );
  const [facTitle, setFacTitle] = useState("");
  const [facDesc, setFacDesc] = useState("");
  const [facPreview, setFacPreview] = useState("");
  const [facUrl, setFacUrl] = useState("");
  const [uploadingFac, setUploadingFac] = useState(false);
  const [savingFac, setSavingFac] = useState(false);

  // --- STATE 3: INFORMASI & PENDAFTARAN SISWA BARU ---
  const [steps, setSteps] = useState<StepItem[]>([
    { title: "", description: "" },
  ]);
  const [pamphletUrl, setPamphletUrl] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [savingReg, setSavingReg] = useState(false);

  const fetchInformation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/information");
      const json = (await res.json()) as {
        data?: {
          hero: {
            ppdbYear: string;
            description: string;
            heroImage: string;
          } | null;
          facilities: FacilityItem[];
          registration: {
            pamphletUrl: string;
            formUrl: string;
            steps: StepItem[];
          };
        };
      };

      if (json.data) {
        if (json.data.hero) {
          setPpdbYear(json.data.hero.ppdbYear);
          setHeroDesc(json.data.hero.description);
          setHeroUrl(json.data.hero.heroImage);
          setHeroPreview(json.data.hero.heroImage);
        }
        setFacilities(json.data.facilities ?? []);
        setPamphletUrl(json.data.registration.pamphletUrl ?? "");
        setFormUrl(json.data.registration.formUrl ?? "");
        setSteps(
          json.data.registration.steps.length > 0
            ? json.data.registration.steps
            : [{ title: "", description: "" }],
        );
      }
    } catch {
      toast.error("Gagal memuat data informasi website");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInformation();
  }, [fetchInformation]);

  // Helper Upload Gambar ke GitHub Storage
  const handleImageUpload = async (
    file: File,
    folder: string,
    setPreview: (val: string) => void,
    setUrl: (val: string) => void,
    setUploading: (val: boolean) => void,
    currentUrl: string,
  ) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, atau WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);
    setUploading(true);

    try {
      const cdnUrl = await uploadFileToGithub(file, folder);
      setUrl(cdnUrl);
      toast.success("Gambar berhasil diunggah");
    } catch {
      toast.error("Gagal mengunggah gambar ke GitHub");
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  };

  // --- SUBMIT CARD 1: HERO SECTION ---
  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingHero) {
      toast.warning("Tunggu hingga proses unggah gambar selesai");
      return;
    }
    if (!ppdbYear.trim() || !heroDesc.trim() || !heroUrl) {
      toast.error("Tahun PPDB, deskripsi, dan gambar utama wajib diisi");
      return;
    }

    try {
      setSavingHero(true);
      const res = await fetch("/api/information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "hero",
          payload: {
            ppdbYear: ppdbYear.trim(),
            description: heroDesc.trim(),
            heroImage: heroUrl,
          },
        }),
      });
      const json = (await res.json()) as { message?: string };
      if (!res.ok) {
        toast.error(json.message ?? "Gagal menyimpan Hero Section");
        return;
      }
      toast.success(json.message ?? "Hero Section berhasil disimpan");
    } catch {
      toast.error("Gagal terhubung ke server");
    } finally {
      setSavingHero(false);
    }
  };

  // --- SUBMIT CARD 2: FASILITAS SEKOLAH ---
  const resetFacilityForm = () => {
    setEditingFacilityId(null);
    setFacTitle("");
    setFacDesc("");
    setFacPreview("");
    setFacUrl("");
    if (facilityInputRef.current) facilityInputRef.current.value = "";
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingFac) {
      toast.warning("Tunggu hingga proses unggah gambar selesai");
      return;
    }
    if (!facTitle.trim() || !facDesc.trim() || !facUrl) {
      toast.error("Judul, deskripsi, dan gambar fasilitas wajib diisi");
      return;
    }

    try {
      setSavingFac(true);
      const res = await fetch("/api/information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "facility",
          payload: {
            ...(editingFacilityId ? { id: editingFacilityId } : {}),
            title: facTitle.trim(),
            description: facDesc.trim(),
            image: facUrl,
          },
        }),
      });
      const json = (await res.json()) as { message?: string };
      if (!res.ok) {
        toast.error(json.message ?? "Gagal menyimpan fasilitas");
        return;
      }
      toast.success(json.message ?? "Fasilitas berhasil disimpan");
      resetFacilityForm();
      await fetchInformation();
    } catch {
      toast.error("Gagal terhubung ke server");
    } finally {
      setSavingFac(false);
    }
  };

  const handleDeleteFacility = async (id: string) => {
    try {
      const res = await fetch("/api/information", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = (await res.json()) as { message?: string };
      if (!res.ok) {
        toast.error(json.message ?? "Gagal menghapus fasilitas");
        return;
      }
      toast.success(json.message ?? "Fasilitas dihapus");
      if (editingFacilityId === id) resetFacilityForm();
      await fetchInformation();
    } catch {
      toast.error("Gagal terhubung ke server");
    }
  };

  // --- SUBMIT CARD 3: INFORMASI & PENDAFTARAN SISWA BARU ---
  const handleAddStep = () => {
    setSteps((prev) => [...prev, { title: "", description: "" }]);
  };

  const handleRemoveStep = (idx: number) => {
    if (steps.length <= 1) {
      toast.warning("Minimal harus ada 1 tahapan pendaftaran");
      return;
    }
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleStepChange = (
    idx: number,
    field: "title" | "description",
    value: string,
  ) => {
    setSteps((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const handleSaveRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const validSteps = steps.filter(
      (s) => s.title.trim() !== "" && s.description.trim() !== "",
    );
    if (validSteps.length === 0) {
      toast.error("Isi minimal 1 judul dan deskripsi tahapan pendaftaran");
      return;
    }

    try {
      setSavingReg(true);
      const res = await fetch("/api/information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "registration",
          payload: {
            pamphletUrl: pamphletUrl.trim(),
            formUrl: formUrl.trim(),
            steps: validSteps,
          },
        }),
      });
      const json = (await res.json()) as { message?: string };
      if (!res.ok) {
        toast.error(json.message ?? "Gagal menyimpan informasi pendaftaran");
        return;
      }
      toast.success(json.message ?? "Informasi pendaftaran berhasil disimpan");
      await fetchInformation();
    } catch {
      toast.error("Gagal terhubung ke server");
    } finally {
      setSavingReg(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin text-[#0077B6]" />
        <span>Memuat informasi website...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-10">
      {/* Header Judul */}
      <div>
        <h1 className="font-bricolage text-2xl font-bold text-[#005B7F] md:text-3xl">
          Kelola semua konten yang akan ditampilkan pada website utama.
        </h1>
      </div>

      {/* ===================================================================== */}
      {/* ROW 1: HERO SECTION                                                   */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSaveHero}
          className="flex flex-col space-y-5 rounded-3xl bg-[#38B6DF] p-6 text-white shadow-sm md:p-7 lg:col-span-8"
        >
          <span className="font-bricolage w-fit rounded-xl bg-[#FFEAD5] px-4 py-1.5 text-xl font-bold text-[#D97706]">
            Hero Section
          </span>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Kolom Kiri Input */}
            <div className="space-y-4 md:col-span-6">
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-semibold">Tahun PPDB</label>
                <input
                  type="text"
                  value={ppdbYear}
                  onChange={(e) => setPpdbYear(e.target.value)}
                  placeholder="Contoh: PPDB 2027/2028 Telah Dibuka"
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-semibold">Deskripsi</label>
                <textarea
                  rows={6}
                  value={heroDesc}
                  onChange={(e) => setHeroDesc(e.target.value)}
                  placeholder="Isi deskripsi mengenai sekolah anda..."
                  className="w-full resize-none rounded-xl bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Kolom Kanan Upload + Simpan */}
            <div className="flex flex-col justify-between space-y-4 md:col-span-6">
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-semibold">Gambar Utama</label>
                <input
                  ref={heroInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      void handleImageUpload(
                        f,
                        "hero",
                        setHeroPreview,
                        setHeroUrl,
                        setUploadingHero,
                        heroUrl,
                      );
                    }
                  }}
                />
                <div
                  onClick={() =>
                    !uploadingHero && heroInputRef.current?.click()
                  }
                  role="button"
                  tabIndex={0}
                  className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/40 bg-[#8E8E8E] select-none"
                >
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #4b5563 25%, transparent 25%), linear-gradient(-45deg, #4b5563 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4b5563 75%), linear-gradient(-45deg, transparent 75%, #4b5563 75%)",
                      backgroundSize: "36px 36px",
                      backgroundPosition: "0 0, 0 18px, 18px -18px, -18px 0",
                    }}
                  />
                  {uploadingHero && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
                      <Loader2 className="h-8 w-8 animate-spin text-[#EAB308]" />
                    </div>
                  )}
                  {heroPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={heroPreview}
                        alt="Hero Preview"
                        className="relative z-10 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="rounded-md bg-[#EAB308] px-3 py-1.5 text-xs font-semibold text-white">
                          Replace Image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <span className="rounded-md bg-[#EAB308] px-3 py-1 text-xs font-semibold text-white shadow">
                        Unggah media dari perangkat
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        Replace Image
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={savingHero || uploadingHero}
                className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-[#D97706] to-[#B45309] py-5 font-semibold text-white shadow hover:from-[#B45309] hover:to-[#92400E]"
              >
                {savingHero ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </form>

        {/* Preview Kanan: Hero Section */}
        <aside className="space-y-2 lg:col-span-4">
          <h3 className="font-bricolage text-lg font-bold text-[#005B7F]">
            Contoh Preview Halaman
          </h3>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="grid grid-cols-12 items-center gap-3">
              <div className="col-span-7 space-y-2">
                <span className="inline-block rounded-full bg-cyan-50 px-2.5 py-0.5 text-[10px] font-semibold text-[#0077B6]">
                  {ppdbYear || "PPDB 2027/2028 Telah Dibuka"}
                </span>
                <h4 className="font-bricolage text-base leading-tight font-bold text-[#005B7F]">
                  Fathul Baari Islamic School
                </h4>
                <p className="line-clamp-3 text-[11px] leading-relaxed text-slate-600">
                  {heroDesc ||
                    "Membentuk generasi Qur'ani yang berakhlak mulia, cerdas, dan berwawasan global."}
                </p>
              </div>
              <div className="col-span-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroPreview || "/hero.png"}
                  alt="Preview Hero"
                  className="h-28 w-full rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ===================================================================== */}
      {/* ROW 2: PROFIL LEMBAGA & FASILITAS SEKOLAH                             */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col space-y-5 rounded-3xl bg-[#38B6DF] p-6 text-white shadow-sm md:p-7 lg:col-span-8">
          <span className="font-bricolage w-fit rounded-xl bg-[#FFEAD5] px-4 py-1.5 text-xl font-bold text-[#D97706]">
            Profil Lembaga & Fasilitas Sekolah
          </span>

          <form
            onSubmit={handleSaveFacility}
            className="grid grid-cols-1 gap-6 md:grid-cols-12"
          >
            {/* Kolom Kiri Input */}
            <div className="space-y-4 md:col-span-6">
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-semibold">Judul</label>
                <input
                  type="text"
                  value={facTitle}
                  onChange={(e) => setFacTitle(e.target.value)}
                  placeholder="Contoh: Sport & Archery Center"
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-semibold">Deskripsi</label>
                <input
                  type="text"
                  value={facDesc}
                  onChange={(e) => setFacDesc(e.target.value)}
                  placeholder="Contoh: Lapangan futsal & Area Panahan"
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  required
                />
              </div>

              {editingFacilityId ? (
                <button
                  type="button"
                  onClick={resetFacilityForm}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/80 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <PlusCircle className="h-4 w-4" />
                  Batal Edit (Mode Tambah Baru)
                </button>
              ) : (
                <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/80 py-2.5 text-sm font-medium text-white/95">
                  <PlusCircle className="h-4 w-4" />
                  Tambah fasilitas
                </div>
              )}
            </div>

            {/* Kolom Kanan Upload + Simpan */}
            <div className="flex flex-col justify-between space-y-4 md:col-span-6">
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-semibold">
                  Gambar Fasilitas
                </label>
                <input
                  ref={facilityInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      void handleImageUpload(
                        f,
                        "facilities",
                        setFacPreview,
                        setFacUrl,
                        setUploadingFac,
                        facUrl,
                      );
                    }
                  }}
                />
                <div
                  onClick={() =>
                    !uploadingFac && facilityInputRef.current?.click()
                  }
                  role="button"
                  tabIndex={0}
                  className="group relative flex h-44 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/40 bg-[#8E8E8E] select-none"
                >
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #4b5563 25%, transparent 25%), linear-gradient(-45deg, #4b5563 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4b5563 75%), linear-gradient(-45deg, transparent 75%, #4b5563 75%)",
                      backgroundSize: "36px 36px",
                      backgroundPosition: "0 0, 0 18px, 18px -18px, -18px 0",
                    }}
                  />
                  {uploadingFac && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
                      <Loader2 className="h-8 w-8 animate-spin text-[#EAB308]" />
                    </div>
                  )}
                  {facPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={facPreview}
                        alt="Facility Preview"
                        className="relative z-10 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="rounded-md bg-[#EAB308] px-3 py-1.5 text-xs font-semibold text-white">
                          Replace Image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <span className="rounded-md bg-[#EAB308] px-3 py-1 text-xs font-semibold text-white shadow">
                        Unggah media dari perangkat
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        Replace Image
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={savingFac || uploadingFac}
                className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-[#D97706] to-[#B45309] py-5 font-semibold text-white shadow hover:from-[#B45309] hover:to-[#92400E]"
              >
                {savingFac
                  ? "Menyimpan..."
                  : editingFacilityId
                    ? "Simpan Perubahan"
                    : "Simpan"}
              </Button>
            </div>
          </form>

          {/* Daftar Fasilitas Tersimpan (Edit / Hapus) */}
          {facilities.length > 0 && (
            <div className="space-y-2 border-t border-white/30 pt-4">
              <p className="text-xs font-semibold tracking-wider uppercase text-white/90">
                Daftar Fasilitas Tersimpan ({facilities.length})
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {facilities.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-white/95 px-3 py-2 text-slate-800 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                      <div className="truncate">
                        <p className="truncate text-xs font-bold">
                          {item.title}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => {
                          setEditingFacilityId(item.id ?? null);
                          setFacTitle(item.title);
                          setFacDesc(item.description);
                          setFacUrl(item.image);
                          setFacPreview(item.image);
                        }}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Hapus"
                        onClick={() => item.id && handleDeleteFacility(item.id)}
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Kanan: Fasilitas Unggulan */}
        <aside className="space-y-2 lg:col-span-4">
          <h3 className="font-bricolage text-lg font-bold text-[#005B7F]">
            Contoh Preview Halaman
          </h3>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <h4 className="font-bricolage text-sm font-bold text-[#005B7F]">
              Fasilitas Unggulan
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {(facilities.length > 0
                ? facilities.slice(0, 3)
                : [
                    {
                      title: facTitle || "Sport & Archery",
                      description: facDesc || "Area olahraga lengkap",
                      image: facPreview || "/masjid.png",
                    },
                  ]
              ).map((f, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-lg border border-slate-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.image || "/masjid.png"}
                    alt={f.title}
                    className="h-16 w-full object-cover"
                  />
                  <div className="p-1.5">
                    <p className="truncate text-[10px] font-bold text-slate-800">
                      {f.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ===================================================================== */}
      {/* ROW 3: INFORMASI & PENDAFTARAN SISWA BARU                             */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSaveRegistration}
          className="flex flex-col space-y-5 rounded-3xl bg-[#38B6DF] p-6 text-white shadow-sm md:p-7 lg:col-span-8"
        >
          <span className="font-bricolage w-fit rounded-xl bg-[#FFEAD5] px-4 py-1.5 text-xl font-bold text-[#D97706]">
            Informasi & Pendaftaran Siswa Baru
          </span>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Kolom Kiri: Dynamic Tahapan */}
            <div className="space-y-4 md:col-span-6">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="space-y-2.5 rounded-2xl border border-white/30 bg-white/10 p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase">
                      Tahapan #{idx + 1}
                    </span>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="text-xs text-red-100 hover:text-white"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold">
                      Judul tahapan
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) =>
                        handleStepChange(idx, "title", e.target.value)
                      }
                      placeholder="Contoh: Registrasi Online"
                      className="w-full rounded-xl bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold">
                      Deskripsi tahapan
                    </label>
                    <textarea
                      rows={2}
                      value={step.description}
                      onChange={(e) =>
                        handleStepChange(idx, "description", e.target.value)
                      }
                      placeholder="Isi deskripsi tahapan..."
                      className="w-full resize-none rounded-xl bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddStep}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/80 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <PlusCircle className="h-4 w-4" />
                Tambah tahapan
              </button>
            </div>

            {/* Kolom Kanan: Link Pamflet, Link Form & Simpan */}
            <div className="flex flex-col justify-between space-y-4 md:col-span-6">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-sm font-semibold">
                    Link download pamflet
                  </label>
                  <input
                    type="text"
                    value={pamphletUrl}
                    onChange={(e) => setPamphletUrl(e.target.value)}
                    placeholder="Isi link download pamflet anda..."
                    className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-sm font-semibold">
                    Link formulir online
                  </label>
                  <input
                    type="text"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="Isi link formulir anda..."
                    className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={savingReg}
                className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-[#D97706] to-[#B45309] py-5 font-semibold text-white shadow hover:from-[#B45309] hover:to-[#92400E]"
              >
                {savingReg ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </form>

        {/* Preview Kanan: Informasi & Pendaftaran Siswa Baru */}
        <aside className="space-y-2 lg:col-span-4">
          <h3 className="font-bricolage text-lg font-bold text-[#005B7F]">
            Contoh Preview Halaman
          </h3>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <h4 className="font-bricolage text-sm font-bold text-[#005B7F]">
              Informasi & Pendaftaran Siswa Baru
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {steps.slice(0, 4).map((s, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-2.5"
                >
                  <span className="mb-1 inline-block rounded bg-[#38B6DF] px-1.5 py-0.5 text-[9px] font-bold text-white">
                    0{idx + 1}
                  </span>
                  <p className="truncate text-[11px] font-bold text-slate-800">
                    {s.title || `Tahap ${idx + 1}`}
                  </p>
                  <p className="line-clamp-2 text-[10px] text-slate-500">
                    {s.description || "Deskripsi tahapan pendaftaran..."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}