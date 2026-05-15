"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMail, FiLinkedin, FiInstagram, FiHeart } from "react-icons/fi";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname !== "/") {
    return null;
  }

  return (
    <footer className="bg-travel-card border-t border-travel-border mt-auto">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-10 md:mb-8">

          {/* 1. Brand Section */}
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">✈️</span>
              <span className="font-bold text-xl text-travel-text">Travel Buddy</span>
            </Link>
            <p className="text-travel-text-muted text-sm leading-relaxed max-w-xs">
              Your ultimate marketplace to find travel companions, explore destinations, and share unforgettable adventures around the globe.
            </p>
          </div>

          {/* 2. Quick Links Section */}
          <div className="flex flex-col items-center gap-4">
            <h4 className="font-bold text-travel-text uppercase tracking-wider text-sm">Explore</h4>
            <nav className="flex flex-col gap-3 text-center">
              <Link href="/" className="text-travel-text-muted hover:text-travel-accent transition-colors text-sm font-medium">
                Global Feed
              </Link>
              <Link href="/dashboard" className="text-travel-text-muted hover:text-travel-accent transition-colors text-sm font-medium">
                My Dashboard
              </Link>
              <Link href="/trips/create" className="text-travel-text-muted hover:text-travel-accent transition-colors text-sm font-medium">
                Post a Trip
              </Link>
            </nav>
          </div>

          {/* 3. Connect/Developer Section */}
          <div className="flex flex-col items-center md:items-end gap-4 text-center md:text-right">
            <h4 className="font-bold text-travel-text uppercase tracking-wider text-sm">
              Connect
            </h4>
            <p className="text-travel-text-muted text-sm flex items-center justify-center md:justify-end gap-1.5">
              Built with <FiHeart className="text-red-500 fill-red-500 animate-pulse" /> by Harsh
            </p>

            {/* Social Icon Buttons */}
            <div className="flex items-center justify-center md:justify-end gap-4 mt-1">
              <a
                href="mailto:harshshrivastava003@gmail.com"
                className="p-2.5 bg-travel-bg rounded-full text-travel-text-muted hover:text-travel-accent hover:border-travel-accent transition-all shadow-sm border border-travel-border"
                title="Email Me"
              >
                <FiMail size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/harsh-shrivastava003"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-travel-bg rounded-full text-travel-text-muted hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm border border-travel-border"
                title="LinkedIn"
              >
                <FiLinkedin size={18} />
              </a>
              <a
                href="https://www.instagram.com/harsh_shrivastava_03/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-travel-bg rounded-full text-travel-text-muted hover:text-pink-600 hover:border-pink-300 transition-all shadow-sm border border-travel-border"
                title="Instagram"
              >
                <FiInstagram size={18} />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-travel-border flex flex-col-reverse md:flex-row justify-between items-center gap-4">
          <p className="text-travel-text-muted text-xs font-medium text-center md:text-left">
            © {currentYear} Travel Buddy. All rights reserved.
          </p>
          <div className="flex items-center justify-center">
            <span className="text-[10px] font-bold tracking-widest uppercase text-travel-text-muted/70 px-3 py-1 bg-travel-bg rounded-full border border-travel-border text-center">
              Next.js • Tailwind • Express
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}