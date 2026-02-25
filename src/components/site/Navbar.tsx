"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type NavItem = { label: string; href: string };

const NAV_OFFSET = 96;

export function Navbar() {
  const router = useRouter();
  
  const items: NavItem[] = useMemo(
    () => [
      { label: "Главная", href: "#home" },
      { label: "Услуги", href: "#services" },
      { label: "Проекты", href: "#projects" },
      { label: "Оборудование", href: "#equipment" },
      { label: "Опыт", href: "#experience" },
      { label: "Преимущества", href: "#features" },
      { label: "Центр признания", href: "/recognition" },
      { label: "Контакты", href: "#contact" },
    ],
    []
  );

  const [active, setActive] = useState<string>("#home");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = items.map((i) => i.href.replace("#", "")).filter(id => id !== "/recognition");
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    const NAV_OFFSET_LOCAL = 120;

    const setActiveByScroll = () => {
      const y = window.scrollY + NAV_OFFSET_LOCAL;
      const sorted = [...els].sort((a, b) => a.offsetTop - b.offsetTop);

      let currentId = sorted[0].id;
      for (const el of sorted) {
        if (el.offsetTop <= y) currentId = el.id;
        else break;
      }

      setActive(`#${currentId}`);
    };

    setActiveByScroll();
    window.addEventListener("scroll", setActiveByScroll, { passive: true });
    return () => window.removeEventListener("scroll", setActiveByScroll);
  }, [items]);

  // Обновленная функция go с поддержкой роутов
  const go = (href: string) => {
  // Если это внутренний роут (начинается с /), используем Next.js router
  if (href.startsWith('/')) {
    setOpen(false);
    router.push(href);
    return;
  }

  // Если это #home и мы НЕ на главной странице - переходим на главную
  if (href === '#home' && window.location.pathname !== '/') {
    setOpen(false);
    router.push('/');
    return;
  }

  // Для якорных ссылок на текущей странице - прежняя логика
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  
  // Если элемент не найден на странице - переходим на главную
  if (!el) {
    router.push('/' + href);
    return;
  }

  setOpen(false);
  setActive(href);
  const top = el.getBoundingClientRect().top + window.scrollY - (NAV_OFFSET - 8);

  window.scrollTo({ top, behavior: "smooth" });
  history.replaceState(null, "", href);
};

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div
          className={[
            "rounded-2xl border border-white/10",
            "backdrop-blur-xl",
            "transition-all",
            scrolled
              ? "bg-white/85 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
              : "bg-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.10)]",
          ].join(" ")}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => go("#home")}
                className="flex items-center gap-2 rounded-xl px-2 py-1 text-left"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
                  <span className="text-sm font-semibold">P</span>
                </span>

                <span className="leading-tight">
                  <span
                    className={[
                      "block text-sm font-semibold",
                      scrolled ? "text-neutral-900" : "text-white",
                    ].join(" ")}
                  >
                    «ПромКвалБиОТ»
                  </span>
                  <span
                    className={[
                      "block text-xs",
                      scrolled ? "text-neutral-500" : "text-white/70",
                    ].join(" ")}
                  >
                    Системы безопасности
                  </span>
                </span>
              </button>

              <nav className="hidden items-center gap-1 md:flex">
                {items.map((it) => {
                  const isActive = active === it.href;
                  return (
                    <button
                      key={it.href}
                      onClick={() => go(it.href)}
                      className={[
                        "rounded-full px-3 py-2 text-sm transition",
                        isActive
                          ? "bg-neutral-900 text-white"
                          : scrolled
                          ? "text-neutral-800 hover:bg-neutral-900/5"
                          : "text-white/90 hover:bg-white/10",
                      ].join(" ")}
                    >
                      {it.label}
                    </button>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2">
                
                 <a href="https://wa.me/77029459444"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    "hidden rounded-full px-4 py-2 text-sm font-medium md:inline-flex",
                    "bg-amber-400 text-black hover:bg-amber-300",
                  ].join(" ")}
                >
                  WhatsApp
                </a>

                <button
                  onClick={() => setOpen((v) => !v)}
                  className={[
                    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm md:hidden",
                    scrolled
                      ? "border border-black/10 bg-white text-neutral-900"
                      : "border border-white/20 bg-white/10 text-white",
                  ].join(" ")}
                  aria-label="Open menu"
                >
                  {open ? "✕" : "☰"}
                </button>
              </div>
            </div>

            {open && (
              <div
                className={[
                  "mt-3 grid gap-1 rounded-2xl p-2 md:hidden",
                  scrolled
                    ? "border border-black/5 bg-white"
                    : "border border-white/15 bg-white/10",
                ].join(" ")}
              >
                {items.map((it) => {
                  const isActive = active === it.href;
                  return (
                    <button
                      key={it.href}
                      onClick={() => go(it.href)}
                      className={[
                        "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                        isActive
                          ? "bg-neutral-900 text-white"
                          : scrolled
                          ? "text-neutral-800 hover:bg-neutral-900/5"
                          : "text-white/90 hover:bg-white/10",
                      ].join(" ")}
                    >
                      {it.label}
                    </button>
                  );
                })}

                
                 <a href="https://wa.me/77029459444"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-medium text-black hover:bg-amber-300"
                >
                  Написать в WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}