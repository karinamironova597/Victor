import Link from "next/link";

type Item = {
  icon: string;
  text: string;
  href?: string;
};

const itemsLeft: Item[] = [
  { icon: "📞", text: "+7 (701) 999-99-99 (Виктор)", href: "tel:+77019999999" },
  {
    icon: "📍",
    text: "г. Алматы, Бостандыкский р-н, ул. Сатпаева, д. 90/1",
  },
  { icon: "✉️", text: "info-qs@yandex.kz", href: "mailto:info-qs@yandex.kz" },
];

export function TopInfoBar() {
  return (
    <div className="bg-black text-white text-xs">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-2 py-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {itemsLeft.map((x) => {
              const content = (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-amber-400">
                    {x.icon}
                  </span>
                  <span className="text-white/90">{x.text}</span>
                </span>
              );

              return x.href ? (
                <a key={x.text} href={x.href} className="hover:underline">
                  {content}
                </a>
              ) : (
                <span key={x.text}>{content}</span>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-white/80">
              <div>График работы: 9:00 – 18:00</div>
              <div>(Пн – Пт)</div>
            </div>

            <Link
                href="https://wa.me/77029459444?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8E%20%D0%BF%D0%BE%20%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B5%20%D0%B1%D0%B5%D0%B7%D0%BE%D0%BF%D0%B0%D1%81%D0%BD%D0%BE%D1%81%D1%82%D0%B8."
                target="_blank"
                rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-amber-400 px-4 text-amber-300 hover:bg-amber-400/10"
            >
              <span>Связаться с нами</span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-black">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
