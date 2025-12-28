"use client";

export default function Footer() {
  return (
    <footer className="bg-travel-card border-t border-travel-border mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xl">✈️</span>
            <span className="font-bold text-lg text-travel-text ml-2">Travel Buddy</span>
            <p className="text-travel-text-muted text-sm mt-1">
              © 2025 Travel Buddy. Built for travelers.
            </p>
          </div>
          <div className="flex gap-4">
            {/* Replaced GitHub with Email */}
            <a 
              href="mailto:harshshrivastava003@gmail.com" 
              className="text-travel-text-muted hover:text-travel-accent transition-colors text-sm"
            >
              Email
            </a>
            <a 
              href="https://www.linkedin.com/in/harsh-shrivastava003" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-travel-text-muted hover:text-travel-accent transition-colors text-sm"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}