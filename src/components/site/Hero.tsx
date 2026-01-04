import Image from "next/image";
import Link from "next/link";

const advantages = [
  { icon: "🕒", title: "Круглосуточная бесперебойная", text: "работа системы" },
  { icon: "🛠️", title: "Минимизация простоев и сбоев", text: "в эксплуатации" },
  { icon: "📈", title: "Предсказуемость и контроль", text: "качества оборудования" },
];

export function Hero() {
  return (
    <section className="relative min-h-[720px] overflow-hidden">
      {/* Фоновое изображение */}
      <Image
        src="/hero.jpg"
        alt=""
        fill
        priority
        className="object-cover"
      />

      {/* Затемнение + нижний градиент */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-amber-700/25 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="flex min-h-[720px] flex-col items-center justify-center text-center">
          <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-white md:text-5xl">
            Надежные системы безопасности с гарантированной работой
          </h1>

          <div className="mt-6 text-white/80">
            от компании ТОО «ПромКвалБиОТ»
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-7 text-white/75 md:text-base">
            Мы разрабатываем видеонаблюдение и охранные системы для предприятий любого масштаба
          </p>

          <Link
            href="https://wa.me/77029459444?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8E%20%D0%BF%D0%BE%20%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B5%20%D0%B1%D0%B5%D0%B7%D0%BE%D0%BF%D0%B0%D1%81%D0%BD%D0%BE%D1%81%D1%82%D0%B8."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex h-11 items-center gap-3 rounded-full bg-amber-400 px-6 text-sm font-medium text-black hover:bg-amber-300"
          >
            Связаться с нами
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/10">
              →
            </span>
          </Link>
        </div>

        {/* Преимущества внизу */}
        <div className="absolute inset-x-0 bottom-10">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-6 md:grid-cols-3">
              {advantages.map((a) => (
                <div key={a.title} className="flex items-start gap-3 text-white">
                  <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                    {a.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{a.title}</div>
                    <div className="text-sm text-white/70">{a.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
