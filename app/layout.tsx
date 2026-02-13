import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Fin3 — Finanzas Personales",
  description: "Gestiona tus finanzas personales con Fin3",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0f1a",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
