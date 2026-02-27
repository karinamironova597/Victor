const SEO = {
  defaultTitle: 'IQ Safety — системы безопасности под ключ в Алматы и Казахстане',
  titleTemplate: '%s | IQ Safety',
  description:
    'Профессиональный монтаж и обслуживание систем безопасности: видеонаблюдение IP/AHD, СКУД, пожарная и охранная сигнализация. Проектирование, установка, гарантийное обслуживание. Работаем с бизнесом и частными объектами по всему Казахстану.',
  canonical: 'https://iqsafety.kz',
  
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://iqsafety.kz',
    siteName: 'IQ Safety',
    title: 'IQ Safety — системы безопасности под ключ в Алматы',
    description:
      'Надежные системы безопасности для бизнеса и частных объектов. Видеонаблюдение, СКУД, пожарная сигнализация. Монтаж под ключ в Алматы и по всему Казахстану.',
    images: [
      {
        url: 'https://iqsafety.kz/og.jpg',
        width: 1200,
        height: 630,
        alt: 'IQ Safety — системы безопасности',
        type: 'image/jpeg',
      },
    ],
  },
  
  twitter: {
    handle: '@iqsafety',
    site: '@iqsafety',
    cardType: 'summary_large_image',
  },
  
  additionalMetaTags: [
    {
      name: 'keywords',
      content:
        'системы безопасности Алматы, видеонаблюдение Казахстан, монтаж видеонаблюдения, СКУД установка, контроль доступа, пожарная сигнализация монтаж, охранная сигнализация, IP видеонаблюдение, AHD камеры, системы безопасности под ключ, видеонаблюдение для бизнеса, домофоны установка, проектирование систем безопасности, обслуживание видеонаблюдения Алматы',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'author',
      content: 'IQ Safety',
    },
    {
      name: 'geo.region',
      content: 'KZ-ALA',
    },
    {
      name: 'geo.placename',
      content: 'Алматы',
    },
    {
      name: 'geo.position',
      content: '43.238293;76.889709',
    },
    {
      name: 'ICBM',
      content: '43.238293, 76.889709',
    },
    {
      property: 'dc:creator',
      content: 'IQ Safety',
    },
    {
      name: 'application-name',
      content: 'IQ Safety',
    },
    {
      httpEquiv: 'x-ua-compatible',
      content: 'IE=edge',
    },
  ],
  
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
  ],
};

export default SEO;