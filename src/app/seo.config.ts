const SEO = {
  defaultTitle: 'IQ Safety — видеонаблюдение и системы безопасности в Алматы',
  titleTemplate: '%s | IQ Safety',
  description:
    'Установка видеонаблюдения, IP и AHD камер, СКУД, охранной и пожарной сигнализации под ключ в Алматы. Монтаж для офисов, складов, домов. Бесплатная консультация и выезд.',
  canonical: 'https://iqsafety.kz',
  
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://iqsafety.kz',
    siteName: 'IQ Safety',
    title: 'IQ Safety — видеонаблюдение и системы безопасности Алматы',
    description:
      'Установка видеонаблюдения, СКУД, охранной сигнализации под ключ. IP и AHD камеры, домофоны, турникеты для офисов, складов, домов в Алматы.',
    images: [
      {
        url: 'https://iqsafety.kz/og.jpg',
        width: 1200,
        height: 630,
        alt: 'IQ Safety — системы безопасности Алматы',
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
        'видеонаблюдение Алматы, камеры видеонаблюдения, установка видеонаблюдения, IP видеонаблюдение, AHD камеры, системы безопасности Алматы, видеонаблюдение для дома, видеонаблюдение для офиса, видеонаблюдение склад, СКУД Алматы, система контроля доступа, турникеты СКУД, охранная сигнализация Алматы, пожарная сигнализация монтаж, домофон установка Алматы, видеонаблюдение установка под ключ, монтаж систем безопасности, камеры видеонаблюдения купить, установка камер видеонаблюдения цена, Hikvision Алматы, Dahua камеры, ZKTeco СКУД, системы безопасности под ключ Алматы, видеонаблюдение Казахстан, охранные системы, видеонаблюдение онлайн, удаленное видеонаблюдение',
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