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
      <head>
        {/* Ahrefs Verification */}
        <meta name="ahrefs-site-verification" content="3385d07fcbf632f17ad1b156002c1497a6d99f4b396e3db0b3536eefb7f55fa2" />
      </head>
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
            priceRange: "10000-500000",
          }}
        />

        <JsonLd
          id="jsonld-organization"
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ПромКвалБиОТ",
            alternateName: "IQ Safety",
            url: "https://iqsafety.kz",
            logo: "https://iqsafety.kz/og.jpg",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+77029459444",
              contactType: "customer service",
              availableLanguage: ["Russian", "Kazakh"],
            },
            address: {
              "@type": "PostalAddress",
              addressLocality: "Алматы",
              addressCountry: "KZ",
              streetAddress: "ул. Сатпаева, 90/1",
            },
            sameAs: ["https://wa.me/77029459444"],
          }}
        />

        <JsonLd
          id="jsonld-faq"
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Какие услуги предоставляет IQ Safety?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "IQ Safety предоставляет полный спектр услуг по безопасности: проектирование, монтаж и обслуживание систем видеонаблюдения, СКУД, пожарной и охранной сигнализации. Также проводим валидацию и аттестацию специалистов по безопасности и охране труда (БиОТ).",
                },
              },
              {
                "@type": "Question",
                name: "Что такое валидация специалистов по БиОТ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Валидация — это независимая оценка и подтверждение профессиональных компетенций специалистов по безопасности и охране труда в соответствии с профессиональными стандартами Республики Казахстан. Процедура включает подачу заявки, проверку документов и онлайн-тестирование с прокторингом.",
                },
              },
              {
                "@type": "Question",
                name: "Как пройти валидацию специалиста?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Для прохождения валидации необходимо: 1) Подать заявку на сайте iqsafety.kz с приложением документов об образовании и квалификации; 2) Дождаться одобрения заявки; 3) Пройти онлайн-тестирование из 20 вопросов за 30 минут с минимальным проходным баллом 80%.",
                },
              },
              {
                "@type": "Question",
                name: "В каких городах Казахстана работает IQ Safety?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Основной офис IQ Safety находится в Алматы, но мы работаем по всему Казахстану. Проектирование и монтаж систем безопасности выполняем на объектах любой сложности в любом регионе страны.",
                },
              },
              {
                "@type": "Question",
                name: "Какие системы безопасности вы устанавливаете?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Мы устанавливаем системы видеонаблюдения (IP и аналоговые), системы контроля и управления доступом (СКУД), пожарную сигнализацию, охранную сигнализацию, системы оповещения, пожаротушения и дымоудаления. Работаем с жилыми комплексами, складами, торговыми центрами и офисами.",
                },
              },
            ],
          }}
        />

        <JsonLd
          id="jsonld-services"
          data={{
            "@context": "https://schema.org",
            "@type": "Service",
            serviceType: "Монтаж систем безопасности",
            provider: {
              "@type": "Organization",
              name: "IQ Safety",
              url: "https://iqsafety.kz",
            },
            areaServed: {
              "@type": "Country",
              name: "Казахстан",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Услуги безопасности",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Проектирование и монтаж видеонаблюдения",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Установка СКУД",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Пожарная сигнализация",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Охранная сигнализация",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Валидация специалистов по БиОТ",
                  },
                },
              ],
            },
          }}
        />

        {children}
        <FloatingNewsWidget />
      </body>
    </html>
  );
}