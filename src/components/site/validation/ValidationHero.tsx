export function ValidationHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        role="img"
        aria-label="Валидация и аттестация специалистов по безопасности и охране труда"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&h=1080&fit=crop')`
        }}
      />
      
      {/* Yellow light effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-[20%] w-96 h-96 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(244, 180, 26, 0.15) 0%, transparent 70%)'
          }}
        />
        <div 
          className="absolute bottom-0 right-[20%] w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(244, 180, 26, 0.1) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Валидация и аттестация специалистов по БиОТ
          </h1>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed mb-8">
            Независимая оценка квалификаций специалистов по безопасности и охране труда в соответствии с профессиональным стандартом Республики Казахстан
          </p>
          <a
            href="/validation"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#F4B41A] text-gray-900 rounded-xl font-bold hover:bg-[#d9a017] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-lg"
          >
            Пройти валидацию <span className="text-xl">&#8594;</span>
          </a>
        </div>
      </div>
    </section>
  );
}