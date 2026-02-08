import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ENGEAR - Gestão Comercial',
  description: 'Sistema de controle de vendas e gestão comercial ENGEAR',
  keywords: ['vendas', 'gestão comercial', 'ENGEAR', 'CRM'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
