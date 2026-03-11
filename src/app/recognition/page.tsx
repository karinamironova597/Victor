import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { RecognitionHero } from "@/components/site/recognition/RecognitionHero";
import { RecognitionAbout } from "@/components/site/recognition/RecognitionAbout";
import { RecognitionStats } from "@/components/site/recognition/RecognitionStats"; 

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Центр признания профессиональных компетенций",
  description:
    "Независимая оценка и подтверждение квалификации специалистов в области безопасности и охраны труда в соответствии с профессиональными стандартами РК. Валидация, аттестация, сертификация.",
  keywords: [
    "центр признания квалификаций",
    "профессиональные компетенции",
    "оценка квалификации Казахстан",
    "аттестация специалистов БиОТ",
    "сертификация охрана труда",
    "профстандарты РК",
  ],
  alternates: {
    canonical: "https://iqsafety.kz/recognition",
  },
  openGraph: {
    title: "Центр признания профессиональных компетенций | ПромКвалБиОТ",
    description:
      "Валидация и аттестация специалистов по безопасности и охране труда в Казахстане",
    url: "https://iqsafety.kz/recognition",
    type: "website",
  },
};

export default function RecognitionPage() {
  return (
    <div>
      <Navbar />
      <RecognitionHero />
      <RecognitionAbout />
      <RecognitionStats />
      <Footer />
    </div>
  );
}