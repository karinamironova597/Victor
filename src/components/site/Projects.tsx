// src/components/site/Projects.tsx

export function Projects() {
  return (
    <section id="projects" className="bg-neutral-50">
      {/* ✅ меньше вертикальные отступы на мобилке, большие остаются на md+ */}
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-24">
        {/* Outer card */}
        <div className="rounded-[32px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-center">
            {/* LEFT */}
            <div className="md:col-span-5">
              <div className="mb-5 inline-flex rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-600">
                Решения под ваш проект
              </div>

              <h2 className="text-3xl font-semibold text-neutral-900 md:text-4xl">
                От ЖК до складских комплексов
              </h2>

              <p className="mt-4 leading-7 text-neutral-600">
                Единый подрядчик для проектирования, поставки и обслуживания
                систем на объектах любого назначения.
              </p>

              <div className="mt-6 font-medium text-neutral-800">
                Что вы получаете:
              </div>

              <ul className="mt-4 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
                <li className="flex items-start gap-3 px-5 py-4">
                  <CheckIcon />
                  <span className="text-neutral-700">
                    Готовые решения для офисов, жилых комплексов и домов
                  </span>
                </li>

                <li className="flex items-start gap-3 px-5 py-4">
                  <CheckIcon />
                  <span className="text-neutral-700">
                    Быстрая диагностика и устранение различных неисправностей
                  </span>
                </li>

                <li className="flex items-start gap-3 px-5 py-4">
                  <CheckIcon />
                  <span className="text-neutral-700">
                    Проектирование, монтаж настройки “под ключ”
                  </span>
                </li>

                <li className="flex items-start gap-3 px-5 py-4">
                  <CheckIcon />
                  <span className="text-neutral-700">
                    Системы видеонаблюдения автоматической пожарной сигнализации и
                    электроснабжения
                  </span>
                </li>
              </ul>

              <a
                href="https://wa.me/77029459444?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8E%20%D0%BF%D0%BE%20%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B5%20%D0%B1%D0%B5%D0%B7%D0%BE%D0%BF%D0%B0%D1%81%D0%BD%D0%BE%D1%81%D1%82%D0%B8."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-medium text-black hover:bg-amber-300"
              >
                Связаться с нами
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/10">
                  →
                </span>
              </a>
            </div>

            {/* RIGHT */}
            <div className="md:col-span-7">
              <div className="relative rounded-[28px] bg-neutral-50 p-6 md:p-8">
                {/* inner frame */}
                <div className="pointer-events-none absolute inset-4 rounded-[22px] ring-1 ring-neutral-200/80" />

                {/* subtle grid */}
                <div
                  className="absolute inset-0 rounded-[28px] opacity-60"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
                    backgroundSize: "72px 72px",
                  }}
                />

                {/* content area height */}
                <div className="relative min-h-[420px] md:min-h-[520px]">
                  {/* Card 1: ЖК */}
                  <FigureCard
                    img="/projects-home.png"
                    label="Жилые комплексы"
                    className="left-[10%] top-[10%] w-[58%] rotate-[-6deg] md:left-[10%] md:top-[12%] md:w-[52%]"
                  />

                  {/* Card 2: Склады */}
                  <FigureCard
                    img="/projects-warehouse.png"
                    label="Склады"
                    className="right-[10%] top-[26%] w-[42%] rotate-[4deg] md:right-[10%] md:top-[18%] md:w-[38%]"
                  />

                  {/* Card 3: ТЦ */}
                  <FigureCard
                    img="/projects-mall.png"
                    label="Торговые центры"
                    className="left-[24%] top-[52%] w-[62%] rotate-[3deg] md:left-[26%] md:top-[52%] md:w-[56%]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Outer card */}
      </div>
    </section>
  );
}

/** Одна карточка-картинка с подписью */
function FigureCard({
  img,
  label,
  className,
}: {
  img: string;
  label: string;
  className: string;
}) {
  return (
    <div className={`absolute ${className}`}>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
        <div
          className="aspect-[16/9] bg-cover bg-center"
          style={{ backgroundImage: `url(${img})` }}
        />
      </div>

      {/* ✅ Mobile-safe label (не наезжает, переносится, читается) */}
      <div className="mt-2 flex justify-center">
        <span
          className={[
            "inline-block max-w-[92%] text-center break-words",
            "rounded-full bg-white/90 px-3 py-1",
            "text-[12px] leading-tight text-neutral-800",
            "shadow-sm backdrop-blur",
            "md:max-w-full md:rounded-none md:bg-transparent md:px-0 md:py-0 md:shadow-none md:backdrop-blur-0",
            "md:text-sm md:leading-normal md:text-neutral-700",
          ].join(" ")}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100">
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}