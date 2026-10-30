import type { Metadata, Viewport } from 'next'
import './globals.css'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#141210',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.citymela.space'),
  title: 'City Mela Festivals · Guwahati',
  description:
    'Guwahati comes together: Little Guwahati Festival (14–15 Nov), Discount Dhamaka (27 Nov – 2 Dec), and Brahmaputra Winter Carnival (23–31 Dec).',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'City Mela Festivals · Guwahati',
    description:
      'Guwahati comes together: Little Guwahati Festival (14–15 Nov), Discount Dhamaka (27 Nov – 2 Dec), and Brahmaputra Winter Carnival (23–31 Dec).',
    url: 'https://www.citymela.space',
    siteName: 'City Mela Festivals',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image-wide.jpg',
        width: 1200,
        height: 630,
        alt: 'City Mela Festivals · Guwahati',
      },
      {
        url: '/og-image.jpg',
        width: 800,
        height: 800,
        alt: 'City Mela Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'City Mela Festivals · Guwahati',
    description:
      'Guwahati comes together: Little Guwahati Festival (14–15 Nov), Discount Dhamaka (27 Nov – 2 Dec), and Brahmaputra Winter Carnival (23–31 Dec).',
    images: ['/og-image-wide.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bagel+Fat+One&family=Nunito:wght@400..900&family=Baloo+2:wght@600;800&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <FloatingWhatsApp phoneNumber="+919181051445" />
      </body>
    </html>
  )
}
