// src/components/site/Services.tsx

export function Services() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      {/* Header */}
      <div className="mb-14 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300 px-4 py-1 text-sm text-blue-600">
          ✨ Наши услуги
        </div>

        <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
          Мы реализуем комплексные решения безопасности под ключ
        </h2>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Большая карточка */}
        <ServiceCard
          image="/services-install.png"
          title="Поставка и монтаж оборудования"
          text="Выполняем поставку и профессиональный монтаж оборудования видеонаблюдения и комплексных систем безопасности на объектах любой сложности с гарантией качества."
          className="md:col-span-2 md:row-span-2 min-h-[360px] md:min-h-[520px]"
        />

        {/* Правая верхняя */}
        <ServiceCard
          image="/services-design.png"
          title="Проектирование объекта"
          text="Проводим обследование объекта, анализируем риски и определяем оптимальное расположение оборудования."
          className="min-h-[220px] md:min-h-[250px]"
        />

        {/* Правая нижняя */}
        <ServiceCard
          image="/services-fire.png"
          title="Разработка пожарной безопасности"
          text="Проектирование систем пожарной сигнализации, оповещения, пожаротушения и дымоудаления."
          className="min-h-[220px] md:min-h-[250px]"
        />
      </div>
    </section>
  );
}

type CardProps = {
  image: string;
  title: string;
  text: string;
  className?: string;
};

function ServiceCard({ image, title, text, className }: CardProps) {
  return (
    <div className={`relative h-full overflow-hidden rounded-3xl ${className ?? ""}`}>
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
        <h3 className="text-xl font-semibold">{title}</h3>

        <p className="mt-3 text-sm leading-6 text-white/80">{text}</p>

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
  );
}
