import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "../styles/globals.css";
import { site } from "@/config/site";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-sans",
  display: "swap",
});

const title = `Centro estético en ${site.city} | ${site.name}`;
const description = `Centro estético en ${site.city}: tratamientos faciales, corporales y masajes de relajación, con atención personalizada y ambiente tranquilo.`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title,
  description,
  openGraph: {
    title,
    description,
    locale: "es_CO",
    type: "website",
    images: [{ url: "/images/hero-bg.jpg", width: 2400, height: 1250 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
