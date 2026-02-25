export function ValidationHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            
            <a  href="#content"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#F4B41A] text-gray-900 rounded-lg font-semibold hover:bg-[#E5A510] transition-colors text-lg"
            >
              Узнать подробнее
            </a>
            
            <a  href="#contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors text-lg backdrop-blur-sm"
            >
              Связаться с нами
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}