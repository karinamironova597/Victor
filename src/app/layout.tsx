// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";
import FloatingNewsWidget from "@/components/FloatingNewsWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://iqsafety.kz"),

  title: {
    default: "IQ Safety — системы безопасности под ключ",
    template: "%s | IQ Safety",
  },

  verification: {
    google: 'TYLO_sLc0DQ0v5DE6mpinWKV_8FH5luMv4JiByr_09w',
  },  

  description:
    "Проектирование, монтаж и обслуживание систем безопасности: видеонаблюдение, СКУД, пожарная и охранная сигнализация. Работаем с бизнесом и частными клиентами по Алматы и Казахстану.",

  alternates: {
    canonical: "https://iqsafety.kz",
  },

  openGraph: {
    title: "IQ Safety — системы безопасности под ключ",
    description:
      "Надежные системы безопасности для бизнеса и частных объектов любой сложности. Проектирование, монтаж, обслуживание.",
    url: "https://iqsafety.kz",
    siteName: "IQ Safety",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "IQ Safety — системы безопасности",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "IQ Safety — системы безопасности под ключ",
    description:
      "Проектирование, монтаж и обслуживание систем безопасности. Консультация и выезд специалиста.",
    images: ["/og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* JSON-LD (структурированные данные для SEO) */}
        <JsonLd
          id="jsonld-localbusiness"
          data={{
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "IQ Safety",
            url: "https://iqsafety.kz",
            telephone: "+77029459444",
            email: "info-iqs@yandex.kz",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Алматы",
              addressCountry: "KZ",
              streetAddress: "ул. Сатпаева, 90/1",
            },
            areaServed: ["Алматы", "Казахстан"],
            openingHours: ["Mo-Fr 09:00-18:00"],
            sameAs: ["https://wa.me/77029459444"],
            description: "Профессиональный монтаж систем безопасности: видеонаблюдение, СКУД, пожарная и охранная сигнализация",
            priceRange: "$$",
          }}
        />

        {children}
        <FloatingNewsWidget />
      </body>
    </html>
  );
}