"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigationLoader } from "@/components/app-layout/navigation-loader";
import { Button } from "@/components/ui/button";

export interface RegistrationStepItem {
  id?: string;
  title: string;
  description: string;
}

export interface RegistrationData {
  pamphletUrl: string;
  formUrl: string;
  steps: RegistrationStepItem[];
}

export default function RegistrationSection({
  initialData,
}: {
  initialData: RegistrationData;
}) {
  const router = useRouter();
  const { startLoading, stopLoading } = useNavigationLoader();

  const [steps, setSteps] = useState<RegistrationStepItem[]>(
    initialData.steps.length > 0
      ? initialData.steps
      : [{ title: "", description: "" }],
  );
  const [pamphletUrl, setPamphletUrl] = useState(initialData.pamphletUrl ?? "");
  const [formUrl, setFormUrl] = useState(initialData.formUrl ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPamphletUrl(initialData.pamphletUrl ?? "");
    setFormUrl(initialData.formUrl ?? "");
    if (initialData.steps.length > 0) {
      setSteps(initialData.steps);
    }
  }, [initialData]);

  const handleAddStep = () => {
    setSteps((prev) => [...prev, { title: "", description: "" }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      toast.warning("Minimal harus ada 1 tahapan pendaftaran");
      return;
    }
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStepChange = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    setSteps((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validSteps = steps.filter(
      (s) => s.title.trim() !== "" && s.description.trim() !== "",
    );

    if (validSteps.length === 0) {
      toast.error("Minimal isi 1 judul dan deskripsi tahapan pendaftaran");
      return;
    }

    try {
      setIsSubmitting(true);
      startLoading();

      const res = await fetch("/api/information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "registration",
          payload: {
            pamphletUrl: pamphletUrl.trim(),
            formUrl: formUrl.trim(),
            steps: validSteps.map((s) => ({
              title: s.title.trim(),
              description: s.description.trim(),
            })),
          },
        }),
      });

      const result = (await res.json()) as { message?: string };

      if (!res.ok) {
        toast.error(result.message ?? "Gagal menyimpan informasi pendaftaran");
        return;
      }

      toast.success(
        result.message ?? "Informasi pendaftaran berhasil disimpan!",
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
        onSubmit={handleSubmit}
        className="flex w-full flex-col space-y-6 rounded-3xl bg-[#36B5CA] p-6 text-white md:p-8 lg:col-span-8"
      >
        <span className="text-dark-orange font-bricolage w-fit rounded-xl bg-[#FFEAD5] px-4 py-2 text-2xl font-semibold">
          Informasi & Pendaftaran Siswa Baru
        </span>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="space-y-4 md:col-span-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="space-y-3 rounded-2xl border border-white/30 bg-white/10 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Tahapan #{idx + 1}
                  </span>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="inline-flex cursor-pointer items-center gap-1 text-xs text-red-100 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-sm font-semibold text-white">
                    Judul tahapan <span className="text-red-200">*</span>
                  </label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) =>
                      handleStepChange(idx, "title", e.target.value)
                    }
                    placeholder="Contoh: Registrasi Online"
                    className="w-full rounded-xl bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-sm font-semibold text-white">
                    Deskripsi tahapan <span className="text-red-200">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={step.description}
                    onChange={(e) =>
                      handleStepChange(idx, "description", e.target.value)
                    }
                    placeholder="Isi deskripsi tahapan..."
                    className="w-full resize-none rounded-xl bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddStep}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/80 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Tambah tahapan</span>
            </button>
          </div>

          <div className="flex flex-col justify-between space-y-4 md:col-span-6">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="pamphletUrl"
                  className="text-base font-semibold text-white"
                >
                  Link download pamflet
                </label>
                <input
                  id="pamphletUrl"
                  type="text"
                  value={pamphletUrl}
                  onChange={(e) => setPamphletUrl(e.target.value)}
                  placeholder="Isi link download pamflet anda..."
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="formUrl"
                  className="text-base font-semibold text-white"
                >
                  Link formulir online
                </label>
                <input
                  id="formUrl"
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="Isi link formulir anda..."
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-[#D97706] to-[#B45309] py-6 text-base font-semibold text-white shadow-md transition-all hover:from-[#B45309] hover:to-[#92400E]"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </form>

      <aside className="flex flex-col space-y-3 lg:col-span-4">
        <h3 className="text-dark-greenblue font-bricolage text-xl font-bold">
          Contoh Preview Halaman
        </h3>
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <h4 className="text-dark-greenblue font-bricolage text-base font-bold">
            Informasi & Pendaftaran Siswa Baru
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            {steps.slice(0, 4).map((step, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-100 bg-slate-50 p-2.5"
              >
                <span className="mb-1 inline-block rounded bg-[#36B5CA] px-1.5 py-0.5 text-[9px] font-bold text-white">
                  0{idx + 1}
                </span>
                <p className="truncate text-[11px] font-bold text-slate-800">
                  {step.title || `Tahap ${idx + 1}`}
                </p>
                <p className="line-clamp-2 text-[10px] text-slate-500">
                  {step.description || "Deskripsi tahapan pendaftaran..."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}