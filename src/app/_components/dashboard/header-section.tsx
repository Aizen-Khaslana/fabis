import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface HeaderSectionProps {
  userName: string;
}

export default function HeaderSection({ userName }: HeaderSectionProps) {
  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="space-y-1">
        <h2 className="text-dark-greenblue font-bricolage text-3xl font-semibold">
          Assalamu&apos;alaikum, {userName}
        </h2>
        <p className="text-text text-lg">
          Selamat datang di pusat pengelolaan website Faathul Baari Islamic
          School.
        </p>
      </div>

      {/* <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="border-dark-greenblue text-dark-greenblue hover:bg-dark-greenblue/10 inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border bg-white px-5 py-2.5 text-lg font-medium transition"
      >
        Lihat website
        <ArrowUpRight className="size-5" />
      </Link> */}
    </div>
  );
}
