import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import AuthModal from '@/components/AuthModal';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BrickFund — Building Wealth, Brick by Brick',
  description:
    'Democratizing real estate investment through crowdfunding. Invest in verified property projects with as little as $100.',
  openGraph: {
    title: 'BrickFund — Building Wealth, Brick by Brick',
    description:
      'Democratizing real estate investment through crowdfunding. Invest in verified property projects.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${plusJakarta.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            <AuthModalProvider>
              {children}
              <AuthModal />
              <Toaster />
            </AuthModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
