export function RecognitionHero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=1080&fit=crop')`
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
            Центр признания профессиональных квалификаций
          </h1>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed">
            Независимая оценка и подтверждение квалификации специалистов в области безопасности и охраны труда
          </p>
        </div>
      </div>
    </section>
  );
}