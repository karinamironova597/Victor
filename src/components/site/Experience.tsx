// src/components/site/Experience.tsx
import Image from "next/image";
export function Experience() {
  return (
    <section id="experience" className="bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-[32px] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            {/* LEFT (visual) */}
              <div className="relative overflow-hidden rounded-3xl bg-neutral-900/5">
              <div className="p-4 md:p-6">
                <Image
                  src="/lol.svg.png"
                  alt="Опыт компании"
                  width={900}
                  height={900}
                  className="h-auto w-full"
                  priority
                />
              </div>
            </div>
            {/* RIGHT (text) */}
            <div className="px-2 pb-2 md:px-0">
              

              <h3 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
                Залог нашего успеха — наш опыт
              </h3>

              <p className="mt-4 leading-7 text-neutral-600">
                Мы берем на себя ответственность за корректную работу систем и
                предлагаем инженерный подход к задачам любой сложности.
              </p>

              <ul className="mt-6 space-y-4 text-neutral-700">
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span>Сертифицированные инженеры и монтажники</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span>Глубокое знание продукции PERC, Hikvision, TBLOC</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span>
                    Готовность найти решение даже для нестандартных ситуаций
                  </span>
                </li>
              </ul>

              <a
                href="https://wa.me/77029459444?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8E%20%D0%BF%D0%BE%20%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B5%20%D0%B1%D0%B5%D0%B7%D0%BE%D0%BF%D0%B0%D1%81%D0%BD%D0%BE%D1%81%D1%82%D0%B8."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-medium text-black hover:bg-amber-300"
              >
                Связаться с нами
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/10">
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}
