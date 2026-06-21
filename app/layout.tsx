import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-stack",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-stack",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · ${siteConfig.handle}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} · ${siteConfig.handle}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.handle,
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased geek-grid-bg">
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-10 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
