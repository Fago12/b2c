import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { UmamiAnalytics } from "@/components/analytics/Umami";

const classyVogue = localFont({
  src: '../../public/fonts/ClassyVogue-Regular.otf',
  variable: '--font-classy-vogue',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Woven Kulture",
  description: "Redefining Elegance",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${classyVogue.variable} antialiased font-sans`}>
        <UmamiAnalytics />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}


