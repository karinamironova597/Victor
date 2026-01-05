// src/components/site/Contact.tsx

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-3xl">
        {/* small top pill like on mock */}
        <div className="mb-6 flex justify-center">
          <a
            href="https://wa.me/77029459444?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8E%20%D0%BF%D0%BE%20%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B5%20%D0%B1%D0%B5%D0%B7%D0%BE%D0%BF%D0%B0%D1%81%D0%BD%D0%BE%D1%81%D1%82%D0%B8."
                target="_blank"
                rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm text-blue-600"
          >
            ✨ Свяжитесь с нами
          </a>
        </div>

        {/* Map */}
        <div className="overflow-hidden rounded-[18px] border border-neutral-200 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
          <div className="relative h-[260px] md:h-[320px]">
            <iframe
              title="Карта: Алматы, ул. Сатпаева 90/1"
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              // Вариант без ключа: Google Maps Embed
              // Если захочешь точную точку — просто заменим src на тот, что выдаст Google Maps (см. шаг 4).
              src="https://www.google.com/maps?q=%D0%90%D0%BB%D0%BC%D0%B0%D1%82%D1%8B%2C%20%D1%83%D0%BB.%20%D0%A1%D0%B0%D1%82%D0%BF%D0%B0%D0%B5%D0%B2%D0%B0%2090%2F1&z=15&output=embed"
            />
          </div>
        </div>

        {/* Text + contacts */}
        <div className="mt-10">
          <h2 className="text-3xl font-semibold text-neutral-900 md:text-4xl">
            Сделаем ваш объект безопасным вместе
          </h2>

          <p className="mt-4 max-w-2xl text-neutral-600 leading-7">
            Расскажите нам о своем объекте и задачах — мы подберем оптимальное
            решение и типовой пакет оборудования под ваш бюджет.
          </p>

          <div className="mt-8 space-y-4">
            <ContactRow
              icon="📞"
              text="+7 702 945 9444 (Виктор)"
              href="tel:+77019999999"
            />
            <ContactRow
              icon="📍"
              text="г Алматы, Бостандыкский р-н, ул. Сатпаева, д. 90/1"
            />
            <ContactRow
              icon="✉️"
              text="info-iqs@yandex.kz"
              href="mailto:info-igs@yandex.kz"
            />
          </div>

          <a
            href="https://wa.me/77029459444?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8E%20%D0%BF%D0%BE%20%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B5%20%D0%B1%D0%B5%D0%B7%D0%BE%D0%BF%D0%B0%D1%81%D0%BD%D0%BE%D1%81%D1%82%D0%B8."
                target="_blank"
                rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-400 px-6 py-3 text-sm font-medium text-black hover:bg-amber-300"
          >
            Связаться с нами
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/10">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  text,
  href,
}: {
  icon: string;
  text: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm">
        {icon}
      </div>
      <div className="text-sm text-neutral-700 leading-6">{text}</div>
    </div>
  );

  if (!href) return content;

  return (
    <a href={href} className="block hover:opacity-80">
      {content}
    </a>
  );
}
