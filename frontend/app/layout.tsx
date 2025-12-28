import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Travel Buddy",
  description: "Find your perfect travel partner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 1. suppressHydrationWarning: Essential for next-themes to work without errors
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {/* 2. Flex Container: Ensures Footer always stays at the bottom */}
          <div className="flex flex-col min-h-screen">
            <Navbar />
            
            {/* 3. Main Content: Grows to fill available space */}
            {/* Updated 'flex-grow' to 'grow' based on Tailwind recommendation */}
            <main className="grow">
              {children}
            </main>
            
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}