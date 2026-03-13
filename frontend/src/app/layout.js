import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar'; // 1. Import our new Navbar

// Keep the cool default fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2. Update the metadata for your specific app
export const metadata = {
  title: "CampusGig | Your Campus Marketplace",
  description: "Buy and sell services, textbooks, and more purely on campus.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 3. Combine the font variables with our custom background colors */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {/* 4. Place the Navbar right at the top of the body */}
        <Navbar /> 
        
        {/* 5. Wrap the page content in a nicely spaced main container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}