import { db } from "./index";
import { news } from "./schema";

async function main() {
  console.log("Start seeding!");

  await db.insert(news).values([
    {
      coverImage: "https://cdn.jsdelivr.net/gh/khaslanacorp/fabis-assets@main/fabis-default.png",
      title: "FABIS Menjuarai Lomba Panahan Tingkat Provinsi Jawa Barat",
      teaser: "Kontingen panahan FABIS berhasil meraih medali emas dalam kejuaraan panahan antar pelajar tingkat provinsi.",
      content: "<p>Alhamdulillah, tim panahan Fathul Baari Islamic School (FABIS) kembali menorehkan prestasi membanggakan di tingkat Provinsi Jawa Barat. Setelah melalui latihan intensif selama tiga bulan, para santri berhasil membawa pulang medali emas pada kategori perseorangan maupun beregu.</p>",
      createdAt: new Date("2026-11-15"),
    },
    {
      coverImage: "https://cdn.jsdelivr.net/gh/khaslanacorp/fabis-assets@main/fabis-default.png",
      title: "Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2026/2027",
      teaser: "Pendaftaran gelombang pertama telah resmi dibuka untuk calon santri baru jenjang SD dan SMP Islam Terpadu.",
      content: "<p>Fathul Baari Islamic School resmi membuka pendaftaran peserta didik baru untuk tahun ajaran 2026/2027. Wali santri dapat melakukan pendaftaran secara daring maupun datang langsung ke sekretariat sekolah pada jam kerja untuk mendapatkan informasi kurikulum dan beasiswa prestasi.</p>",
      createdAt: new Date("2026-11-14"),
    },
    {
      coverImage: "https://cdn.jsdelivr.net/gh/khaslanacorp/fabis-assets@main/fabis-default.png",
      title: "Kegiatan Tahfidz Camp dan Mabit Bersama Santri",
      teaser: "Meningkatkan kecintaan santri terhadap Al-Qur'an melalui program karantina hafalan dan pembinaan karakter.",
      content: "<p>Dalam rangka mempercepat target hafalan Al-Qur'an, FABIS menyelenggarakan kegiatan Tahfidz Camp dan Malam Bina Iman dan Taqwa (Mabit). Kegiatan ini diisi dengan setoran hafalan, muraja'ah bersama musyrif, serta kajian adab menuntut ilmu.</p>",
      createdAt: new Date("2026-11-13"),
    },
    {
      coverImage: "https://cdn.jsdelivr.net/gh/khaslanacorp/fabis-assets@main/fabis-default.png",
      title: "Kunjungan Edukatif ke Museum Geologi Bandung",
      teaser: "Santri kelas 5 belajar sejarah perkembangan bumi dan mengenal ragam batuan mineral secara langsung di lapangan.",
      content: "<p>Program <em>outing class</em> semester ini mengajak para santri menjelajahi Museum Geologi Bandung. Para santri tampak antusias mencatat berbagai temuan fosil purba serta berdiskusi langsung dengan pemandu edukasi museum mengenai mitigasi bencana geologi.</p>",
      createdAt: new Date("2026-11-12"),
    },
    {
      coverImage: "https://cdn.jsdelivr.net/gh/khaslanacorp/fabis-assets@main/fabis-default.png",
      title: "Pelatihan Public Speaking dan Leadership Pengurus OSIS",
      teaser: "Membekali pengurus OSIS dengan kemampuan komunikasi efektif, manajemen acara, dan jiwa kepemimpinan Islami.",
      content: "<p>Pengurus OSIS FABIS mengikuti pelatihan kepemimpinan dasar selama dua hari di aula sekolah. Materi yang diberikan meliputi teknik berbicara di depan umum, penyusunan proposal kegiatan, serta praktik simulasi pengambilan keputusan dalam organisasi.</p>",
      createdAt: new Date("2026-11-11"),
    },
    {
      coverImage: "https://cdn.jsdelivr.net/gh/khaslanacorp/fabis-assets@main/fabis-default.png",
      title: "Peringatan Hari Pahlawan dengan Pentas Drama Perjuangan",
      teaser: "Menumbuhkan semangat nasionalisme santri melalui lomba pidato kebangsaan dan teater sejarah kemerdekaan.",
      content: "<p>Memperingati Hari Pahlawan, seluruh jenjang kelas di FABIS menampilkan karya seni bertema perjuangan kemerdekaan Indonesia. Kegiatan ditutup dengan pembacaan doa bersama untuk para pahlawan bangsa dan penyerahan penghargaan bagi penampil terbaik.</p>",
      createdAt: new Date("2026-11-10"),
    },
  ]);

  console.log("Seed complete!");
}

await main();
