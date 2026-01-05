// src/components/site/Footer.tsx

export function Footer() {
  return (
    <footer className="mt-24 bg-neutral-900">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 py-10 md:grid-cols-3 md:items-start">
          {/* Left */}
          <div className="text-sm text-white/80 leading-6">
            <div className="text-white/90">Компания ТОО «ПромКвалБиОТ»</div>
            <div>БИН: 1234567890</div>
            <div>Все права защищены ©2025.</div>
          </div>

          {/* Center */}
          <div className="space-y-3 text-sm text-white/80">
            <FooterRow icon="📞" text="+7 702 945 9444 (Виктор)" />
            <FooterRow
              icon="📍"
              text="г Алматы, Бостандыкский р-н, ул. Сатпаева, д. 90/1"
            />
            <FooterRow icon="✉️" text="info-iqs@yandex.kz" />
          </div>

          {/* Right */}
          <div className="text-sm text-white/80 md:text-right">
            <div>График работы: 9:00 - 18:00,</div>
            <div>Пн - Пт</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-xs text-black">
        {icon}
      </span>
      <span className="leading-6">{text}</span>
    </div>
  );
}
