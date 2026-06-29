import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CRM Basic · Frontend Dev Services',
  description: 'Frontend development services — landing pages, custom UI, multi-page sites.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased">{children}</body>
    </html>
  )
}
