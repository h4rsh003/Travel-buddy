import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 👇 Import looks like this (Next.js alias "@" points to root)
import { Providers } from "@/components/Providers"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Travel Buddy 2.0",
  description: "Find your perfect travel partner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}