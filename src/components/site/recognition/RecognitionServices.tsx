"use client";

import Link from "next/link";
import Image from "next/image";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

const services: Service[] = [
  {
    id: "validation",
    title: "Валидация и аттестация специалистов по БиОТ",
    description:
      "Независимая оценка квалификаций специалистов по безопасности и охране труда в соответствии с профессиональным стандартом Республики Казахстан.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop",
    link: "/recognition/validation",
  },
];

export function RecognitionServices() {
  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* Бейдж "Наши решения" */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 border-blue-200 bg-white text-blue-600">
            <span className="text-orange-400">✨</span>
            <span className="font-medium">Услуги</span>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Наши услуги
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Профессиональная оценка и подтверждение квалификаций специалистов
          </p>
        </div>

        {/* Центрируем одну карточку */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {services.map((service) => (
              <Link
                key={service.id}
                href={service.link}
                className="group bg-white rounded-2xl shadow-lg border-l-4 border-[#F4B41A] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                    {service.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[#F4B41A] font-semibold transition-all group-hover:gap-3">
                    Подробнее <span className="text-xl">›</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}