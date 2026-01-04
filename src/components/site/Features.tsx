// src/components/site/Features.tsx

export function Features() {
  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300 px-4 py-1 text-sm text-blue-600">
            ✨ Наши решения
          </div>

          <h2 className="text-3xl font-semibold md:text-5xl">
            Особенности наших решений
          </h2>
        </div>

        {/* Card */}
        <div className="rounded-[32px] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-6">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            {/* Left image */}
            <div className="relative min-h-[340px] overflow-hidden rounded-[28px] bg-neutral-100 md:min-h-[420px]">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url(/features.png)" }}
              />
              {/* soft inner border like on design */}
              <div className="pointer-events-none absolute inset-3 rounded-[22px] ring-2 ring-white/70" />
            </div>

            {/* Right content */}
            <div className="px-2 pb-4 md:px-0">
              <div className="mb-4 inline-flex rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-600">
                Стабильность и надежность
              </div>

              <h3 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
                Система, которая не подведет
              </h3>

              <p className="mt-4 leading-7 text-neutral-600">
                Вы получаете не просто оборудование, а надежного партнера, который
                обеспечивает стабильную работу комплекса безопасности.
              </p>

              <div className="mt-6 font-medium text-neutral-700">
                Что вы получаете:
              </div>

              <ul className="mt-4 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
                <li className="flex items-center gap-3 px-5 py-4">
                  <CheckIcon />
                  <span className="text-neutral-700">
                    Круглосуточная и бесперебойная работа системы
                  </span>
                </li>
                <li className="flex items-center gap-3 px-5 py-4">
                  <CheckIcon />
                  <span className="text-neutral-700">
                    Минимизация сбоев в системе
                  </span>
                </li>
                <li className="flex items-center gap-3 px-5 py-4">
                  <CheckIcon />
                  <span className="text-neutral-700">Прочное оборудование</span>
                </li>
              </ul>

              <a
               href="https://wa.me/77029459444?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8E%20%D0%BF%D0%BE%20%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B5%20%D0%B1%D0%B5%D0%B7%D0%BE%D0%BF%D0%B0%D1%81%D0%BD%D0%BE%D1%81%D1%82%D0%B8."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-medium text-black hover:bg-amber-300"
              >
                Связаться с нами
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10">
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
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">
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
