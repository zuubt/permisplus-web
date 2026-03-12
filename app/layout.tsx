import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const inter = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'PermisPlus - Reussissez votre permis',
  description: 'Preparation au permis basee sur des quiz, pensee pour des apprenants adultes et mobiles.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#E44332',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased bg-bg`}>
        <div className="min-h-screen flex justify-center bg-[#e5e7eb]">
          <div className="w-full max-w-[430px] min-h-screen bg-bg relative overflow-hidden app-gradient shadow-soft">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
