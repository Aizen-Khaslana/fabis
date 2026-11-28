import type React from "react";
import { CircleStar } from "lucide-react";
import Image from "next/image";

export interface SchoolInfoItems {
  image: string;
  name: string;
  desc: string;
}

interface ProfileSectionProps {
  facilitiesDesc?: string;
  schoolFacilities: SchoolInfoItems[];
}

export default function ProfileSection({
  facilitiesDesc = "Dirancang untuk menunjang kenyamanan belajar, ibadah, dan tumbuh kembang fisik santri",
  schoolFacilities,
}: ProfileSectionProps) {
  return (
    <section id="tentang-kami" className="flex flex-col w-full items-center gap-4 mb-32 px-18 max-md:px-7 justify-center max-md:py-30">
      <span className="font-outfit text-dark-orange justify-center w-full flex items-center gap-2 font-semibold">
        <CircleStar />
        Profil Lembaga & Fasilitas Sekolah
      </span>

      <h2 className="font-bricolage text-center max-w-200 text-dark-greenblue text-4xl font-bold">
        Menjadi Lembaga Pendidikan Islam Teladan Berlandaskan Sunnah & Prestasi Sains
      </h2>

      <p className="text-text max-w-210 text-center font-outfit font-normal">
        Fathul Baari Islamic School (FABIS) adalah lembaga pendidikan jenjang SMP di bawah naungan Yayasan Fathul Baari Ishlahul Ummah, yang berkomitmen mencetak generasi muda bertakwa, berakhlak mulia, dan unggul dalam akademik.
      </p>

      <div className="flex flex-col items-start justify-start w-full gap-3 mt-10">
        <h3 className="font-bricolage text-center max-w-200 text-dark-greenblue text-4xl font-bold">Fasilitas Unggulan</h3>
        <p>
          {facilitiesDesc}
        </p>
        <div className="grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 grid gap-3 w-full mt-2">
          {schoolFacilities.map((item) => (
            <div key={item.name}
              className="relative overflow-hidden min-w-full p-5 justify-end flex flex-col   min-h-60 rounded-2xl">
              <Image
                src={item.image}
                fill
                alt={item.name}
                className="object-cover -z-10"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent -z-10" />

              <h4 className="text-xl font-semibold text-white font-bricolage">
                {item.name}
              </h4>
              <span className="text-md text-white font-light">
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
