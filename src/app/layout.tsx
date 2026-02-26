import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Denials AI Copilot — Qualified Health',
  description: 'AI-powered claim denial analysis, evidence matching, and appeal generation',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-navy-900 text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
