import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Corretora Cristal - Imóveis de Qualidade",
  description:
    "Encontre o imóvel dos seus sonhos com a Corretora Cristal. Apartamentos, casas e terrenos com a melhor localização.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
