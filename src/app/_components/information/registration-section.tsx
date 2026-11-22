"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigationLoader } from "@/components/app-layout/navigation-loader";
import { Button } from "@/components/ui/button";

export interface RegistrationStepItem {
  id?: string;
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface RegistrationData {
  pamphletUrl: string;
  formUrl: string;
  steps: RegistrationStepItem[];
}

const MAX_STEP_TITLE = 45;
const MAX_STEP_DESC = 130;

function isValidHttpUrl(value: string) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function formatDateRange(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return "";

  const formatDayMonth = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(date);

  const formatFull = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);

  if (startDate && endDate) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return `${startDate} - ${endDate}`;
    }

    if (start.getFullYear() === end.getFullYear()) {
      return `${formatDayMonth(start)} - ${formatFull(end)}`;
    }

    return `${formatFull(start)} - ${formatFull(end)}`;
  }

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);
    return Number.isNaN(start.getTime())
      ? `Mulai ${startDate}`
      : `Mulai ${formatFull(start)}`;
  }

  const end = new Date(`${endDate!}T00:00:00`);
  return Number.isNaN(end.getTime())
    ? `Selesai ${endDate}`
    : `Selesai ${formatFull(end)}`;
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
      ? initialData.steps.map((s) => ({
          ...s,
          startDate: s.startDate ?? "",
          endDate: s.endDate ?? "",
          isActive: Boolean(s.isActive),
        }))
      : [
          {
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            isActive: false,
          },
        ],
  );
  const [pamphletUrl, setPamphletUrl] = useState(initialData.pamphletUrl ?? "");
  const [formUrl, setFormUrl] = useState(initialData.formUrl ?? "");
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [errors, setErrors] = useState<{
    pamphletUrl?: string;
    formUrl?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPamphletUrl(initialData.pamphletUrl ?? "");
    setFormUrl(initialData.formUrl ?? "");
    if (initialData.steps.length > 0) {
      setSteps(
        initialData.steps.map((s) => ({
          ...s,
          startDate: s.startDate ?? "",
          endDate: s.endDate ?? "",
          isActive: Boolean(s.isActive),
        })),
      );
    }
  }, [initialData]);

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        isActive: false,
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      toast.warning("Minimal harus ada 1 tahapan pendaftaran");
      return;
    }
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleActiveStep = (index: number) => {
    setSteps((prev) =>
      prev.map((item, i) => ({
        ...item,
        isActive: i === index ? !item.isActive : false,
      })),
    );
  };

  const handleStepChange = (
    index: number,
    field: "title" | "description" | "startDate" | "endDate",
    value: string,
  ) => {
    setSteps((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedAttempt(true);

    const trimmedPamphlet = pamphletUrl.trim();
    const trimmedForm = formUrl.trim();
    const nextErrors: { pamphletUrl?: string; formUrl?: string } = {};

    if (!isValidHttpUrl(trimmedPamphlet)) {
      nextErrors.pamphletUrl =
        "Format tautan tidak valid. Wajib diawali http:// atau https:// (contoh: https://drive.google.com/...)";
    }

    if (!isValidHttpUrl(trimmedForm)) {
      nextErrors.formUrl =
        "Format tautan tidak valid. Wajib diawali http:// atau https:// (contoh: https://forms.gle/...)";
    }

    setErrors(nextErrors);

    if (nextErrors.pamphletUrl || nextErrors.formUrl) {
      toast.error(
        "Periksa kembali format tautan pamflet atau formulir pendaftaran",
      );
      return;
    }

    const hasOverLimit = steps.some(
      (s) =>
        s.title.trim().length > MAX_STEP_TITLE ||
        s.description.trim().length > MAX_STEP_DESC,
    );

    if (hasOverLimit) {
      toast.error(
        `Periksa kembali batas karakter tahapan (Judul maks. ${MAX_STEP_TITLE}, Deskripsi maks. ${MAX_STEP_DESC} karakter)`,
      );
      return;
    }

    const hasEmptyFields = steps.some(
      (s) => s.title.trim() === "" || s.description.trim() === "",
    );

    if (hasEmptyFields) {
      toast.error(
        "Pastikan seluruh tahapan yang ditambahkan memiliki judul dan deskripsi",
      );
      return;
    }

    const hasMissingDate = steps.some(
      (s) => !s.startDate?.trim() || !s.endDate?.trim(),
    );

    if (hasMissingDate) {
      toast.error(
        "Tanggal mulai dan tanggal berakhir wajib diisi untuk setiap tahapan",
      );
      return;
    }

    const hasInvalidDate = steps.some(
      (s) => s.startDate && s.endDate && s.endDate < s.startDate,
    );

    if (hasInvalidDate) {
      toast.error(
        "Tanggal berakhir tidak boleh lebih awal dari tanggal mulai tahapan",
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
          section: "registration",
          payload: {
            pamphletUrl: trimmedPamphlet,
            formUrl: trimmedForm,
            steps: steps.map((s) => ({
              title: s.title.trim(),
              description: s.description.trim(),
              startDate: s.startDate!.trim(),
              endDate: s.endDate!.trim(),
              isActive: Boolean(s.isActive),
            })),
          },
        }),
      });

      const result = (await res.json()) as { message?: string };

      if (!res.ok) {
        toast.error(result.message ?? "Gagal menyimpan informasi pendaftaran");
        return;
      }

      setSubmittedAttempt(false);
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
        noValidate
        onSubmit={handleSubmit}
        className="flex w-full flex-col space-y-6 rounded-3xl bg-[#36B5CA] p-6 text-white md:p-8 lg:col-span-8"
      >
        <span className="text-dark-orange font-bricolage w-fit rounded-xl bg-[#FFEAD5] px-4 py-2 text-2xl font-semibold">
          Informasi & Pendaftaran Siswa Baru
        </span>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="space-y-4 md:col-span-6">
            {steps.map((step, idx) => {
              const isTitleOver = step.title.trim().length > MAX_STEP_TITLE;
              const isDescOver =
                step.description.trim().length > MAX_STEP_DESC;
              const isDateMissing =
                submittedAttempt &&
                (!step.startDate?.trim() || !step.endDate?.trim());
              const isDateInvalid = Boolean(
                step.startDate &&
                  step.endDate &&
                  step.endDate < step.startDate,
              );

              return (
                <div
                  key={idx}
                  className="space-y-3 rounded-2xl border border-white/30 bg-white/10 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold tracking-wider uppercase">
                      Tahapan #{idx + 1}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleActiveStep(idx)}
                        title={
                          step.isActive
                            ? "Klik untuk menonaktifkan tahapan ini"
                            : "Klik untuk menandai tahapan ini sedang aktif"
                        }
                        className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          step.isActive
                            ? "bg-[#EAB308] text-white shadow-xs hover:bg-[#CA8A04]"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{step.isActive ? "Aktif" : "Nonaktif"}</span>
                      </button>

                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-white">
                        Judul tahapan{" "}
                        <span className="font-bold text-red-500">*</span>
                      </label>
                      <span
                        className={`text-xs font-medium ${
                          isTitleOver
                            ? "rounded bg-red-500 px-1.5 py-0.5 text-white"
                            : "text-white/90"
                        }`}
                      >
                        {step.title.length}/{MAX_STEP_TITLE} karakter
                      </span>
                    </div>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) =>
                        handleStepChange(idx, "title", e.target.value)
                      }
                      placeholder="Contoh: Registrasi Online"
                      className={`w-full rounded-xl bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                        isTitleOver ? "ring-2 ring-red-500" : ""
                      }`}
                    />
                    {isTitleOver && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-red-500/95 px-3 py-1.5 text-xs font-medium text-white shadow-xs">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          Judul tahapan maksimal {MAX_STEP_TITLE} karakter.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-white">
                        Deskripsi tahapan{" "}
                        <span className="font-bold text-red-500">*</span>
                      </label>
                      <span
                        className={`text-xs font-medium ${
                          isDescOver
                            ? "rounded bg-red-500 px-1.5 py-0.5 text-white"
                            : "text-white/90"
                        }`}
                      >
                        {step.description.length}/{MAX_STEP_DESC} karakter
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={step.description}
                      onChange={(e) =>
                        handleStepChange(idx, "description", e.target.value)
                      }
                      placeholder="Isi deskripsi tahapan..."
                      className={`w-full resize-none rounded-xl bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                        isDescOver ? "ring-2 ring-red-500" : ""
                      }`}
                    />
                    {isDescOver && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-red-500/95 px-3 py-1.5 text-xs font-medium text-white shadow-xs">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          Deskripsi tahapan maksimal {MAX_STEP_DESC} karakter.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-semibold text-white">
                        Tanggal mulai{" "}
                        <span className="font-bold text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={step.startDate ?? ""}
                        onChange={(e) =>
                          handleStepChange(idx, "startDate", e.target.value)
                        }
                        className={`w-full rounded-xl bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none ${
                          submittedAttempt && !step.startDate?.trim()
                            ? "ring-2 ring-red-500"
                            : ""
                        }`}
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-semibold text-white">
                        Tanggal berakhir{" "}
                        <span className="font-bold text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        min={step.startDate ?? undefined}
                        value={step.endDate ?? ""}
                        onChange={(e) =>
                          handleStepChange(idx, "endDate", e.target.value)
                        }
                        className={`w-full rounded-xl bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none ${
                          isDateInvalid ||
                          (submittedAttempt && !step.endDate?.trim())
                            ? "ring-2 ring-red-500"
                            : ""
                        }`}
                      />
                    </div>
                  </div>
                  {isDateMissing && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-red-500/95 px-3 py-1.5 text-xs font-medium text-white shadow-xs">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Tanggal mulai dan tanggal berakhir wajib diisi.
                      </span>
                    </div>
                  )}
                  {isDateInvalid && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-red-500/95 px-3 py-1.5 text-xs font-medium text-white shadow-xs">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Tanggal berakhir tidak boleh sebelum tanggal mulai.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

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
              <div className="flex flex-col space-y-1.5">
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
                  onChange={(e) => {
                    setPamphletUrl(e.target.value);
                    if (errors.pamphletUrl) {
                      setErrors((prev) => ({
                        ...prev,
                        pamphletUrl: undefined,
                      }));
                    }
                  }}
                  placeholder="https://drive.google.com/..."
                  className={`w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                    errors.pamphletUrl ? "ring-2 ring-red-500" : ""
                  }`}
                />
                {errors.pamphletUrl && (
                  <div className="flex items-start gap-1.5 rounded-lg bg-red-500/95 px-3 py-2 text-xs font-medium text-white shadow-xs">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{errors.pamphletUrl}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-1.5">
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
                  onChange={(e) => {
                    setFormUrl(e.target.value);
                    if (errors.formUrl) {
                      setErrors((prev) => ({ ...prev, formUrl: undefined }));
                    }
                  }}
                  placeholder="https://forms.gle/..."
                  className={`w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                    errors.formUrl ? "ring-2 ring-red-500" : ""
                  }`}
                />
                {errors.formUrl && (
                  <div className="flex items-start gap-1.5 rounded-lg bg-red-500/95 px-3 py-2 text-xs font-medium text-white shadow-xs">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{errors.formUrl}</span>
                  </div>
                )}
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
        <div className="space-y-3 overflow-hidden rounded-3xl border border-slate-200 bg-[#FAFAFA] p-5 shadow-xs">
          <div className="space-y-1">
            <span className="text-dark-orange block text-[9px] font-bold tracking-wider uppercase">
              PENERIMAAN PESERTA DIDIK BARU
            </span>
            <h4 className="text-dark-greenblue font-bricolage text-base leading-snug font-bold">
              Informasi & Pendaftaran Siswa Baru
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="font-bricolage bg-dark-greenblue rounded-lg px-2.5 py-1 text-[10px] font-medium text-white">
                Unduh Pamflet
              </span>
              <span className="font-bricolage bg-greenblue rounded-lg px-2.5 py-1 text-[10px] font-medium text-white">
                Isi Formulir Online
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {steps.map((step, idx) => {
              const dateLabel = formatDateRange(step.startDate, step.endDate);

              return (
                <div
                  key={idx}
                  className={`flex min-w-0 flex-col justify-between gap-2.5 rounded-xl border p-3 transition ${
                    step.isActive
                      ? "border-dark-orange bg-[#FFEAD5]/40 shadow-xs"
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <div className="space-y-2">
                    <div
                      className={`font-bricolage w-fit rounded-sm px-2.5 py-1 text-xs font-bold ${
                        step.isActive
                          ? "bg-dark-orange text-white"
                          : "text-dark-greenblue bg-[#006384]/15"
                      }`}
                    >
                      0{idx + 1}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="font-bricolage text-xs font-semibold break-words text-slate-900 [overflow-wrap:anywhere]">
                        {step.title || `Tahap ${idx + 1}`}
                      </p>
                      <p className="text-text line-clamp-3 text-[11px] leading-snug break-words [overflow-wrap:anywhere]">
                        {step.description || "Deskripsi tahapan pendaftaran..."}
                      </p>
                    </div>
                  </div>

                  {dateLabel && (
                    <div
                      className={`flex items-center gap-1 border-t pt-2 text-[10px] font-semibold transition ${
                        step.isActive
                          ? "border-dark-orange/30 text-dark-orange"
                          : "border-slate-200/70 text-slate-600"
                      }`}
                    >
                      <Calendar
                        className={`h-3 w-3 shrink-0 ${
                          step.isActive ? "text-dark-orange" : "text-[#006384]"
                        }`}
                      />
                      <span className="truncate">{dateLabel}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}