"use client";

import Link from "next/link";
import { FolderPen, GraduationCap, type LucideIcon } from "lucide-react";
import { useNavigationLoader } from "@/components/app-layout/navigation-loader";

interface InformationItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

const informationItems: InformationItem[] = [
  {
    title: "Hero Section",
    description: "Tahun PPDB, deskripsi, dan gambar utama.",
    icon: FolderPen,
  },
  {
    title: "Profil Lembaga & Fasilitas Sekolah",
    description: "Profil, foto, dan deskripsi fasilitas sekolah.",
    icon: FolderPen,
  },
  {
    title: "Informasi & Pendaftaran Siswa Baru",
    description: "Tahapan, pamflet, dan formulir pendaftaran.",
    icon: GraduationCap,
  },
];

export default function InformationSection() {
  const { startLoading } = useNavigationLoader();

  return (
    <div className="flex h-full flex-col space-y-6 rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="space-y-1">
        <h3 className="text-dark-orange font-bricolage text-2xl font-semibold">
          Informasi website
        </h3>
        <p className="text-text">
          Kelola bagian yang tampil pada website utama.
        </p>
      </div>

      <div className="space-y-3">
        {informationItems.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between gap-4 rounded-xl bg-[#F5FAFF] p-4"
          >
            <div className="flex items-start gap-4">
              <div className="text-dark-greenblue flex size-9 shrink-0 items-center justify-center rounded-lg bg-white">
                <item.icon className="size-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-lg font-semibold text-slate-800">
                  {item.title}
                </h4>
                <p className="text-text text-sm">{item.description}</p>
              </div>
            </div>

            <Link
              href="/dashboard/information"
              onClick={startLoading}
              className="bg-greenblue hover:bg-dark-greenblue shrink-0 rounded-lg px-6 py-1.5 text-sm font-medium text-white inset-shadow-sm inset-shadow-indigo-200 transition"
            >
              Kelola
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
