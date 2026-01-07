// src/components/site/Equipment.tsx

type EquipmentCard = {
  tag: string;
  title: string;
  text: string;

  image: string; // from /public
  logo: string;  // from /public (svg/png)

  // optional fine-tuning
  imageClassName?: string;
  logoClassName?: string;
  logoWrapClassName?: string;
};

const CARDS: EquipmentCard[] = [
  {
    tag: "Электросбережение",
    title: "PERCo",
    text:
      "Российский лидер в системах контроля доступа: турникеты, контроллеры и ПО, адаптированное под локальные условия эксплуатации",
    image: "/equipment-perco.png",
    logo: "/perco.svg",
    imageClassName: "bg-center",
    logoClassName: "w-[180px] md:w-[210px]",
  },
  {
    tag: "Оборудование для видеонаблюдения",
    title: "Hikvision",
    text:
      "Мировой лидер по IP-камерам, обладающим высоким качеством изображения, ежедневной аналитикой, авто-распознаванием лиц.",
    image: "/equipment-hikvision.png",
    logo: "/hikvision.svg",
    imageClassName: "bg-center bg-contain",
    logoClassName: "w-[240px] md:w-[280px]",
  },
  {
    tag: "СКУД система ",
    title: "Tbloc",
    text:
      "Лидер СНГ по обеспечению безаварийного и стабильного электропитания систем безопасности и инженерных сетей.",
    image: "/equipment-tbloc.png",
    logo: "/tbloc.svg",
    imageClassName: "bg-center",
    logoClassName: "w-[220px] md:w-[260px]",
  },
];

export function Equipment() {
  return (
    <section id="equipment" className="mx-auto max-w-6xl px-4 py-20">
      {/* Title */}
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
          Наше оборудование
        </h2>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {CARDS.map((c) => (
          <EquipmentCard key={c.title} {...c} />
        ))}
      </div>
    </section>
  );
}

function EquipmentCard({
  tag,
  title,
  text,
  image,
  logo,
  imageClassName,
  logoClassName,
  logoWrapClassName,
}: EquipmentCard) {
  return (
    <article className="relative overflow-hidden rounded-[28px] shadow-[0_18px_50px_rgba(0,0,0,0.10)]">
      {/* Background image */}
      <div
        className={["absolute inset-0 bg-cover", imageClassName ?? "bg-center"].join(" ")}
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Dark overlay (чтобы текст читался) */}
      <div className="absolute inset-0 bg-black/45" />

      {/* top tag */}
      <div className="relative z-10 p-5">
        <span className="inline-flex rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-neutral-800 backdrop-blur">
          {tag}
        </span>
      </div>

      {/* content */}
      <div className="relative z-10 flex min-h-[420px] flex-col justify-between p-6">
        {/* LOGO CENTER */}
        <div
          className={[
            "flex flex-1 items-center justify-center",
            logoWrapClassName ?? "",
          ].join(" ")}
        >
          <img
            src={logo}
            alt={title}
            className={[
              "h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
              logoClassName ?? "w-[220px]",
            ].join(" ")}
          />
        </div>

        {/* bottom text */}
        <p className="text-sm leading-6 text-white/90">
          {text}
        </p>
      </div>

      {/* soft inner border like design */}
      <div className="pointer-events-none absolute inset-3 rounded-[22px] ring-1 ring-white/25" />
    </article>
  );
}
