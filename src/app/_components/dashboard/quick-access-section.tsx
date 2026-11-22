"use client";

import Link from "next/link";
import { ChevronRight, Newspaper, type LucideIcon } from "lucide-react";
import { useNavigationLoader } from "@/components/app-layout/navigation-loader";

interface QuickAccessItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  className: string;
}

const quickAccessItems: QuickAccessItem[] = [
  {
    title: "Buat berita",
    description: "Tambahkan kabar terbaru sekolah.",
    href: "/dashboard/news",
    icon: Newspaper,
    className: "bg-[#FFEAD5] text-dark-orange hover:bg-[#FFE0C2]",
  },
  {
    title: "Daftar berita",
    description: "Lihat dan kelola seluruh berita.",
    href: "/dashboard/news/all",
    icon: Newspaper,
    className: "bg-[#F5FAFF] text-dark-greenblue hover:bg-[#E9F5FF]",
  },
];

export default function QuickAccessSection() {
  const { startLoading } = useNavigationLoader();

  return (
    <div className="flex h-full flex-col space-y-6 rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="space-y-1">
        <h3 className="text-dark-orange font-bricolage text-2xl font-semibold">
          Akses cepat
        </h3>
        <p className="text-text">Mulai dari fitur yang ingin diperbarui.</p>
      </div>

      <div className="space-y-3">
        {quickAccessItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            onClick={startLoading}
            className={`flex items-center justify-between gap-4 rounded-xl p-5 transition ${item.className}`}
          >
            <div className="flex items-start gap-4">
              <item.icon className="mt-0.5 size-6 shrink-0" />
              <div className="space-y-0.5">
                <h4 className="text-xl font-semibold">{item.title}</h4>
                <p className="text-sm text-slate-700">{item.description}</p>
              </div>
            </div>
            <ChevronRight className="size-5 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
