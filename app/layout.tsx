import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  title: "Meditations on Ruins",
  description:
    "Ruins. A London imprint moving through tilted, dub-forward sound.",
  metadataBase: new URL("https://ruins.ltd"),
  openGraph: {
    title: "Meditations on Ruins",
    description:
      "An audiovisual and music event exploring the darker edges of sound.",
    url: "https://ruins.ltd",
    siteName: "Meditations on Ruins",
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={publicSans.variable}>
      <body>{children}</body>
    </html>
  );
}
