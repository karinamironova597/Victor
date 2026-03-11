import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ValidationHero } from "@/components/site/validation/ValidationHero";
import { ValidationContent } from "@/components/site/validation/ValidationContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Валидация и аттестация специалистов по БиОТ",
  description:
    "Порядок прохождения валидации специалистов по безопасности и охране труда. Нормативная база, этапы процедуры, требования к документам. Официальное подтверждение квалификации по профстандартам РК.",
  keywords: [
    "валидация БиОТ",
    "аттестация специалистов охрана труда",
    "порядок валидации",
    "требования к специалистам БиОТ",
    "профессиональный стандарт безопасность",
    "подтверждение квалификации РК",
  ],
  alternates: {
    canonical: "https://iqsafety.kz/recognition/validation",
  },
  openGraph: {
    title: "Валидация и аттестация специалистов по БиОТ | ПромКвалБиОТ",
    description:
      "Порядок прохождения, нормативная база и требования к валидации специалистов по безопасности и охране труда",
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