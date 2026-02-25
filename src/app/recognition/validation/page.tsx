import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ValidationHero } from "@/components/site/validation/ValidationHero";
import { ValidationContent } from "@/components/site/validation/ValidationContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Валидация и аттестация специалистов по БиОТ",
  description:
    "Независимая оценка компетенций специалистов по безопасности и охране труда. Официальное подтверждение квалификации в соответствии с профессиональными стандартами РК.",
  alternates: {
    canonical: "https://iqsafety.kz/recognition/validation",
  },
  openGraph: {
    title: "Валидация и аттестация специалистов по БиОТ | PromKvalBIOT",
    description:
      "Независимая оценка и подтверждение профессиональных компетенций специалистов по безопасности и охране труда",
    url: "https://iqsafety.kz/recognition/validation",
    type: "website",
  },
};

export default function ValidationPage() {
  return (
    <div>
      <Navbar />
      <ValidationHero />
      <ValidationContent />
      <Footer />
    </div>
  );
}