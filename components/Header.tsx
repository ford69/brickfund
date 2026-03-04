'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, Building2, User, Shield, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { openAuthModal } = useAuthModal();

  useEffect(() => setMounted(true), []);

  const handleThemeToggle = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('class', next === 'dark' ? 'dark' : 'light');
    }
    setTheme(next);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinkClass =
    'font-medium text-sm text-white/90 hover:text-white transition-colors duration-200';

  return (
    <motion.header
      className="sticky top-0 z-50 bg-black border-b border-white/10 transition-all duration-300"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="flex items-center shrink-0" aria-label="BrickFund Home">
            <Image
              src="/images/brickfund.png"
              alt="BrickFund"
              width={64}
              height={64}
              className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main">
            <Link href="/" className={navLinkClass}>
              Home
            </Link>
            <Link href="/#services" className={navLinkClass}>
              Services
            </Link>
            <Link href="/#how-it-works" className={navLinkClass}>
              How It Works
            </Link>
            <Link href="/#about" className={navLinkClass}>
              About
            </Link>
            <Link href="/#contact" className={navLinkClass}>
              Contact Us
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white/90 hover:bg-white/10 hover:text-white"
                onClick={handleThemeToggle}
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-9 px-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/20 text-white">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm max-w-[100px] truncate">
                      {user?.firstName}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-border">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-foreground">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      {user?.role === 'admin' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary w-fit mt-1">
                          Admin
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={
                        user?.role === 'admin'
                          ? '/admin'
                          : user?.role === 'owner'
                            ? '/owner-dashboard'
                            : '/dashboard'
                      }
                      className="flex items-center rounded-lg cursor-pointer"
                    >
                      {user?.role === 'admin' && (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </>
                      )}
                      {user?.role === 'owner' && (
                        <>
                          <Building2 className="mr-2 h-4 w-4" />
                          Owner Dashboard
                        </>
                      )}
                      {user?.role === 'investor' && (
                        <>
                          <User className="mr-2 h-4 w-4" />
                          Investor Dashboard
                        </>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive rounded-lg cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/90 hover:bg-white/10 hover:text-white"
                  onClick={() => openAuthModal('login')}
                >
                  Sign In
                </Button>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="bg-primary hover:opacity-90 text-primary-foreground rounded-lg"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-white/10"
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <motion.div
            className="md:hidden py-4 border-t border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              <Link
                href="/"
                className="px-3 py-2.5 rounded-lg font-medium text-foreground hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/#services"
                className="px-3 py-2.5 rounded-lg font-medium text-foreground hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/#how-it-works"
                className="px-3 py-2.5 rounded-lg font-medium text-foreground hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/#about"
                className="px-3 py-2.5 rounded-lg font-medium text-foreground hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/#contact"
                className="px-3 py-2.5 rounded-lg font-medium text-foreground hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact Us
              </Link>
              {mounted && (
                <button
                  className="px-3 py-2.5 rounded-lg font-medium text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                  onClick={() => {
                    handleThemeToggle();
                    setIsOpen(false);
                  }}
                >
                  {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
              )}
              <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          {user?.role === 'admin' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary mt-1">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={
                        user?.role === 'admin'
                          ? '/admin'
                          : user?.role === 'owner'
                            ? '/owner-dashboard'
                            : '/dashboard'
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start rounded-lg">
                        {user?.role === 'admin' && (
                          <>
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </>
                        )}
                        {user?.role === 'owner' && (
                          <>
                            <Building2 className="h-4 w-4 mr-2" />
                            Owner Dashboard
                          </>
                        )}
                        {user?.role === 'investor' && (
                          <>
                            <User className="h-4 w-4 mr-2" />
                            Investor Dashboard
                          </>
                        )}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-lg"
                      onClick={() => { openAuthModal('login'); setIsOpen(false); }}
                    >
                      Sign In
                    </Button>
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-primary hover:opacity-90 text-primary-foreground rounded-lg">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
