import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Anime Stream & Sync',
  description: 'A personal anime streaming app synced with MyAnimeList',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0A0A] text-slate-50 min-h-screen flex antialiased`}>
        <Sidebar />
        <main className="flex-1 ml-64 p-8 relative overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
