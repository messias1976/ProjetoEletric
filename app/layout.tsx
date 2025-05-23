// calcelectric/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Header from '../app/components/Header'; // <-- Confirme esta linha

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Calcule Fácil',
  description: 'Sua ferramenta de dimensionamento elétrico.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body className={inter.className}>
          <Header /> {/* <-- Confirme esta linha e sua posição */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}