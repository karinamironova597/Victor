"use client";

import { useEffect, useRef, useState } from "react";

function AnimatedStep({ 
  step, 
  title, 
  description, 
  index 
}: { 
  step: string; 
  title: string; 
  description: string; 
  index: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150);
        }
      },
      { threshold: 0.2 }
    );

    if (stepRef.current) {
      observer.observe(stepRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={stepRef}
      className={`flex gap-6 items-start transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 -translate-x-20'
      }`}
    >
      <div className="flex-shrink-0 w-14 h-14 bg-[#F4B41A] rounded-full flex items-center justify-center transform transition-transform duration-500 hover:scale-110">
        <span className="text-2xl font-bold text-gray-900">{step}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function ValidationContent() {
  const steps = [
    {
      step: "1",
      title: "Анализ профиля квалификаций",
      description: "Изучение опыта работы, образования и квалификации специалиста"
    },
    {
      step: "2",
      title: "Тестирование знаний",
      description: "Проверка теоретических знаний по охране труда и промышленной безопасности"
    },
    {
      step: "3",
      title: "Практические задания",
      description: "Оценка умения применять знания на практике в реальных ситуациях"
    },
    {
      step: "4",
      title: "Профессиональное интервью",
      description: "Собеседование с экспертами для оценки квалификаций и опыта"
    },
    {
      step: "5",
      title: "Заключение и сертификация",
      description: "Подготовка заключения о соответствии квалификаций и выдача документов"
    }
  ];

  return (
    <div id="content" className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        
        {/* Общие положения */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Общие положения
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Центр признания квалификаций на базе ТОО «ПромКвалБиОТ» проводит независимую оценку профессиональных квалификаций специалистов по безопасности и охране труда (БиОТ).
            </p>
            <p className="text-gray-700 leading-relaxed">
              Валидация осуществляется в соответствии с требованиями профессионального стандарта Республики Казахстан и включает комплексную проверку знаний, навыков и квалификаций специалистов.
            </p>
          </div>
        </section>

        {/* Нормативная основа */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Нормативная основа
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-[#F4B41A]">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Профессиональный стандарт РК
              </h3>
              <p className="text-gray-600">
                Соответствие требованиям профессионального стандарта "Специалист по безопасности и охране труда"
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-[#F4B41A]">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Трудовой кодекс РК
              </h3>
              <p className="text-gray-600">
                Требования законодательства в области охраны труда и безопасности
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-[#F4B41A]">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                ISO 45001
              </h3>
              <p className="text-gray-600">
                Международные стандарты систем управления охраной здоровья и безопасностью труда
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-[#F4B41A]">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Vision Zero
              </h3>
              <p className="text-gray-600">
                Концепция нулевого травматизма на производстве
              </p>
            </div>
          </div>
        </section>

        {/* ВИДЕО СЕКЦИЯ
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            Как проходит валидация
          </h2>
          <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Посмотрите видео о процессе валидации и аттестации специалистов
          </p>
          
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-[#F4B41A]">
            <div className="relative pb-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/cHAAYz3jaog"
                title="Валидация и аттестация специалистов по БиОТ"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section> */}

        {/* Порядок проведения - с анимацией */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Порядок проведения валидации
          </h2>
          <div className="space-y-6">
            {steps.map((item, index) => (
              <AnimatedStep key={index} {...item} index={index} />
            ))}
          </div>
        </section>

        {/* Результаты валидации */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Результаты валидации
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Для специалистов</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded flex items-center justify-center mt-1">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Официальное подтверждение квалификации</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded flex items-center justify-center mt-1">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Повышение профессионального статуса</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded flex items-center justify-center mt-1">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Рекомендации по развитию квалификаций</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Для компаний</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded flex items-center justify-center mt-1">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Подтверждение соответствия требованиям законодательства</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded flex items-center justify-center mt-1">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Снижение рисков производственного травматизма</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded flex items-center justify-center mt-1">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Защита от административной ответственности</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section id="contact" className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Готовы пройти валидацию?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Свяжитесь с нами для получения консультации и записи на процедуру валидации квалификаций
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            
            <a  href="tel:+77029459444"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#F4B41A] text-gray-900 rounded-lg font-semibold hover:bg-[#E5A510] transition-colors"
            >
              <span>📞</span> +7 702 945 9444
            </a>
            
             <a href="mailto:info-iqs@yandex.kz"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <span>✉️</span> info-iqs@yandex.kz
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}