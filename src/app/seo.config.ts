import { DefaultSeoProps } from 'next-seo';

const SEO: DefaultSeoProps = {
  defaultTitle: 'IQ Safety —  в Алматы и Казахстане',
  titleTemplate: '%s | IQ Safety',
  description:
    'Профессиональное проектирование, монтаж и обслуживание : . Работаем с бизнесом и частными клиентами по всему Казахстану.',
  canonical: 'https://iqsafety.kz',
  
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://iqsafety.kz',
    siteName: 'IQ Safety',
    title: 'IQ Safety — системы безопасности под ключ',
    description:
      'Надежные системы безопасности для бизнеса и частных объектов.  в Алматы и Казахстане.',
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
        '',
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
