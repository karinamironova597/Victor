import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { Features } from "@/components/site/Features";
import { Projects } from "@/components/site/Projects";
import { Experience } from "@/components/site/Experience";
import { Equipment } from "@/components/site/Equipment";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IQ Safety — системы безопасности под ключ в Алматы и Казахстане",
  description:
    "Профессиональное проектирование, монтаж и обслуживание систем безопасности: видеонаблюдение, СКУД, пожарная и охранная сигнализация. Работаем с бизнесом и частными клиентами по всему Казахстану.",
  keywords: [
    "системы безопасности Алматы",
    "видеонаблюдение Казахстан",
    "СКУД монтаж",
    "пожарная сигнализация установка",
    "охранная сигнализация",
    "системы контроля доступа",
    "видеонаблюдение под ключ",
    "монтаж систем безопасности",
    "IQ Safety Казахстан",
  ],
  openGraph: {
    title: "IQ Safety — системы безопасности под ключ",
    description:
      "Видеонаблюдение, СКУД, пожарная сигнализация. Проектирование и монтаж систем безопасности в Алматы и по всему Казахстану.",
    url: "https://iqsafety.kz",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "IQ Safety — системы безопасности",
      },
    ],
  },
};

export default function Home() {
  return (
    <div>
      {/* SEO: скрытый H1 для Google (визуально не отображается, но критичен для индексации) */}
      <h1 className="sr-only">
        IQ Safety — проектирование и монтаж систем безопасности в Алматы и Казахстане: 
        видеонаблюдение, СКУД, пожарная и охранная сигнализация под ключ
      </h1>

      <Navbar />
      <Hero />
      <Services />
      <Features />
      <Projects />
      <Equipment />
      <Experience />
      <Contact />
      <Footer />
    </div>
  );
}