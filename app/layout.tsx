import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

export const metadata: Metadata = {
  title: "AirCargo Pro - Professional Air Cargo Booking",
  description: "Fast, reliable air cargo booking platform for global shipping solutions",
  generator: "v0.app",
  keywords: ["air cargo", "shipping", "logistics", "freight", "booking", "global shipping"],
  authors: [{ name: "AirCargo Pro" }],
  creator: "AirCargo Pro",
  publisher: "AirCargo Pro",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aircargo-pro.vercel.app",
    siteName: "AirCargo Pro",
    title: "AirCargo Pro - Professional Air Cargo Booking",
    description: "Fast, reliable air cargo booking platform for global shipping solutions",
  },
  twitter: {
    card: "summary_large_image",
    title: "AirCargo Pro - Professional Air Cargo Booking",
    description: "Fast, reliable air cargo booking platform for global shipping solutions",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
