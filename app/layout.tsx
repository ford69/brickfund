import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { CartProvider } from '@/contexts/CartContext';
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

// Runs before paint so the correct theme class is on <html> immediately (prevents flash).
// Note: React hydration may reset the root; ThemeApplicator in ThemeProvider re-applies after mount.
const themeInitScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = theme === 'dark' || (theme !== 'light' && systemDark);
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${plusJakarta.variable}`}>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <AuthModalProvider>
                {children}
              <AuthModal />
              <Toaster />
              </AuthModalProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
