import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewsSection() {
  return (
    <div className="w-full flex flex-col border border-dark-greenblue rounded-2xl min-h-32 p-6 space-y-6">
      <div className="flex justify-between items-end">
        <span className="bg-[#FFEAD5] rounded-lg p-2 text-2xl text-dark-orange font-medium font-bricolage w-fit">
          Daftar Berita
        </span>
        <div className="flex gap-6">
          <Button className="px-6 py-1.5 bg-greenblue hover:bg-dark-greenblue inset-shadow-sm inset-shadow-indigo-200 text-white text-lg cursor-pointer">
            Kelola
          </Button>
          <Link href="#" className="text-lg text-dark-greenblue cursor-pointer hover:underline">
            Lihat Semua
          </Link>
        </div>
      </div>
      <div className="flex">test</div>
    </div>
  )
}