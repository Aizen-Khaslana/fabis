import { api, HydrateClient } from "@/trpc/server";
import Footer from "./_components/footer";
import Navbar from "./_components/navbar";
import {
  GraduationCap,
  ShieldCheck,
  Mosque,
  Clock,
  Phone,
  Mail,
} from "lucide-react";
import HeroSection from "@/app/_components/landing/hero-section";
import ProfileSection from "@/app/_components/landing/profile-section";
import PpdbSection from "@/app/_components/landing/ppdb-section";
import LocationSection from "@/app/_components/landing/location-section";
import NewsSection from "@/app/_components/landing/news-section";

export default async function Home() {
  const landingData = await api.landing.getLandingData();

  const highlights = [
    {
      label: "Akreditasi A BAN-S/M",
      icon: <ShieldCheck className="size-4" />,
    },
    {
      label: "Kemenag Terdaftar",
      icon: <Mosque className="size-4" />,
    },
    {
      label: "Kurikulum Merdeka + Ma'had",
      icon: <GraduationCap className="size-4" />,
    },
  ];

  const schoolInfo = [
    {
      icon: <Clock className="size-4.5" />,
      label: "Jam Operasional",
      desc: "Senin - Sabtu",
      desc2: "07.30 - 16.00 WIB",
    },
    {
      icon: <Phone className="size-4.5" />,
      label: "Telepon Kantor",
      desc: "(021) 8899-2345",
      desc2: "0812-3456-7890 (WA)",
    },
    {
      icon: <Mail className="size-4.5" />,
      label: "Surel Resmi",
      desc: "info@fabis.sch.id",
      desc2: "ppdb@fabis.sch.id",
    },
  ];

  const persyaratanSantri = [
    "Fotokopi Akta Kelahiran dan Kartu Keluarga (KK) 2 rangkap",
    "Pas foto formal santri berpakaian rapih ukuran 3x4 (4 lembar, latar biru)",
    "Fotokopi Rapor 2 semester terakhir yang telah dilegalisir",
    "Surat Keterangan Sehat & Bebas Hepatitis/TBC dari dokter resmi",
    "Komitmen bersedia tinggal di asrama dan menaati tata tertib Ma'had",
  ];

  const formattedFacilities = landingData.schoolFacilities.map((item) => ({
    id: item.id,
    image: item.image.startsWith("http") || item.image.startsWith("/")
      ? item.image
      : `/${item.image}`,
    name: item.title,
    desc: item.description,
  }));

  const formattedPpdbSteps = landingData.registrationSteps.map((step, index) => ({
    id: String(step.order ?? index + 1).padStart(2, "0"),
    title: step.title,
    description: step.description,
    startDate: step.startDate,
    endDate: step.endDate,
    isActive: step.isActive,
    color: index % 2 === 0 ? "bg-[#006384]/15" : "bg-[#8C4B00]/15",
  }));

  const formattedNews = landingData.news.map((item) => ({
    ...item,
    coverImage:
      item.coverImage.startsWith("http") || item.coverImage.startsWith("/")
        ? item.coverImage
        : `/${item.coverImage}`,
  }));

  return (
    <HydrateClient>
      <Navbar />
      <HeroSection
        highlights={highlights}
        heroData={landingData.hero}
      />
      <ProfileSection
        facilitiesDesc={landingData.facilitySubtitle}
        schoolFacilities={formattedFacilities}
      />
      <NewsSection news={formattedNews} />
      <PpdbSection
        ppdb={formattedPpdbSteps}
        persyaratanSantri={persyaratanSantri}
        settings={landingData.registrationSettings}
      />
      <LocationSection schoolInfo={schoolInfo} />
      <Footer />
    </HydrateClient>
  );
}