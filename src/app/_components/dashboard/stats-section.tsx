import {
  FolderPen,
  GraduationCap,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

interface StatsSectionProps {
  newsCount: number;
  filledSectionCount: number;
  ppdbLinkCount: number;
}

interface StatItem {
  value: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

function formatCount(value: number) {
  return String(value).padStart(2, "0");
}

export default function StatsSection({
  newsCount,
  filledSectionCount,
  ppdbLinkCount,
}: StatsSectionProps) {
  const stats: StatItem[] = [
    {
      value: newsCount,
      title: "Berita sekolah",
      description: "Konten pada daftar berita",
      icon: Newspaper,
    },
    {
      value: filledSectionCount,
      title: "Bagian informasi website",
      description: "Hero, fasilitas, dan informasi PPDB",
      icon: FolderPen,
    },
    {
      value: ppdbLinkCount,
      title: "Tautan PPDB",
      description: "Formulir online dan unduhan pamflet",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((item) => (
        <div
          key={item.title}
          className="flex gap-6 rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <div className="flex flex-col justify-between gap-3">
            <span className="text-dark-greenblue font-bricolage text-5xl leading-none font-semibold">
              {formatCount(item.value)}
            </span>
            <div className="text-dark-greenblue flex size-9 items-center justify-center rounded-lg bg-[#E9F5FF]">
              <item.icon className="size-5" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">
              {item.title}
            </h3>
            <p className="text-text">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
