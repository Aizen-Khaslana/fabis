"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LoginIndex() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onError: (ctx) => {
          alert(ctx.error.message);
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="flex items-center justify-between min-h-screen">
      <div className="flex flex-col flex-3 w-full bg-dark-greenblue shadow-inner shadow-white/70 h-screen p-12 rounded-r-[40px] justify-between max-lg:hidden">
        <div>
          <Image 
            src="/footer-logo.png"
            width={300}
            height={300}
            alt="logo"
            className="rounded-3xl"/>
        </div>
        <div className="gap-3 flex flex-col">
          <h1 className="font-bricolage text-5xl text-white font-semibold leading-15">
            Kelola website sekolah dengan mudah
          </h1>
          <p className="text-white/90 font-normal">
            Perbarui informasi, profil, dan berita FABIS dari satu dashboard.
          </p>
        </div>
        <div>
          <span className="text-sm text-white/80">
            © 2025 - FAATHUL BAARI ISLAMIC SCHOOL
          </span>
        </div>
      </div>

      <div className="w-full lg:flex-4 mx-10 items-center justify-center flex flex-col">
        <div className="w-full max-w-120 flex flex-col items-start">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-dark-greenblue font-medium transition-colors duration-200 mb-6"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali ke Beranda
          </Link>
          <div className="w-full flex flex-col justify-between text-center gap-5 items-center shadow-[inset_0_3px_7px_rgba(0,0,0,0.1),inset_0_-4px_6px_rgba(255,255,255,0.1)] p-14 max-lg:px-10 rounded-xl border-black/20">
          <h2 className="font-bricolage text-dark-greenblue font-semibold text-4xl mb-5">
            Masuk ke Dashboard
          </h2>
          <p>
            Gunakan akun Google yang sudah didaftarkan sebagai admin.
          </p>
          <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full transition-all duration-200 text-slate-700 font-medium text-base border border-black/10 disabled:opacity-50 cursor-pointer active:text-[15px] disabled:cursor-not-allowed shadow-[0_-2px_6px_rgba(0,0,0,0.1),0_4px_6px_rgba(255,255,255,0.1)] active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.1),inset_0_-4px_6px_rgba(255,255,255,0.1)]"
        >
          <svg className="w-5 h-5 max-md:size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="max-md:text-sm">{loading ? "Memproses..." : "Masuk dengan Google"}</span>
        </button>
          <div className="p-6 text-black/60 bg-[#E4E4E4] rounded-lg">
            Hanya email yang terdaftar sebagai  admin yang dapat masuk.
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}