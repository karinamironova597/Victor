export function RecognitionAbout() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            О центре признания
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            Центр признания квалификаций на базе  ТОО «ПромКвалБиОТ» предоставляет услуги по независимой оценке и подтверждению профессиональных квалификаций специалистов в соответствии с требованиями профессиональных стандартов Республики Казахстан.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            Наша миссия — обеспечить объективную оценку знаний, навыков и квалификаций специалистов, способствуя повышению качества и безопасности труда на предприятиях.
          </p>

          {/* Кнопки связи с основным сайтом */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
  
    <a href="/"
    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
  >
    <span className="text-xl">‹</span> Вернуться на главную
  </a>
  
   <a href="/#services"
    className="inline-flex items-center gap-2 px-6 py-3 bg-[#F4B41A] text-gray-900 rounded-lg font-semibold hover:bg-[#E5A510] transition-colors"
  >
    Другие наши услуги <span className="text-xl">›</span>
  </a>
</div>
        </div>
      </div>
    </section>
  );
}