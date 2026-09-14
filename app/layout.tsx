import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GarbaConnect Mumbai | Match. Connect. Dance.',
  description: 'Find compatible Garba partners attending the same Garba nights across Mumbai.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" toastOptions={{ 
          style: { background: '#1E293B', color: '#F8FAFC', border: '1px solid #334155' } 
        }} />
      </body>
    </html>
  )
}