import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-plus-jakarta" 
});

export const metadata: Metadata = {
  title: "SkillBridge AI | Adaptive Learning Path Engine",
  description: "Apple-level clarity + AI-powered intelligence for your career growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light h-full bg-[#FAFAFA]">
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans min-h-full bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
