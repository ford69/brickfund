'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, Building2, User, Shield, LogOut, ChevronDown, Store, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { itemCount } = useCart();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinkClass =
    'font-medium text-sm text-foreground/90 hover:text-primary transition-colors duration-200';

  return (
    <motion.header
      className="sticky top-0 z-50 bg-white border-b border-border transition-all duration-300 overflow-visible shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="flex justify-between items-center h-14 sm:h-16 overflow-visible">
          <Link
            href="/"
            className="relative flex items-center justify-center shrink-0 overflow-visible"
            aria-label="BrickFund Home"
          >
            <Image
              src="/images/logo.png"
              alt="BrickFund"
              width={128}
              height={128}
              className="h-[4.25rem] w-[4.25rem] sm:h-20 sm:w-20 md:h-28 md:w-28 object-contain"
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
            <Link href="/marketplace" className={navLinkClass}>
              Marketplace
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg text-primary hover:text-blue-800 hover:bg-primary/10 transition-colors"
              aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="group flex items-center gap-2 h-9 px-3 rounded-lg text-foreground hover:bg-primary/10 hover:text-foreground"
                  >
                    <Avatar className="w-8 h-8 rounded-full shrink-0 border border-border">
                      <AvatarImage src={user?.avatarUrl} alt="" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {user?.firstName?.[0] && user?.lastName?.[0]
                          ? `${user.firstName[0]}${user.lastName[0]}`
                          : user?.firstName?.[0] ?? <User className="h-4 w-4 text-primary" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm max-w-[100px] truncate">
                      {user?.firstName}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-primary group-hover:text-blue-800 transition-colors" />
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
                            : user?.role === 'investor'
                              ? '/dashboard'
                              : '/marketplace'
                      }
                      className="flex items-center rounded-lg cursor-pointer"
                    >
                      {user?.role === 'admin' && (
                        <>
                          <Shield className="mr-2 h-4 w-4 text-primary shrink-0" />
                          Admin Dashboard
                        </>
                      )}
                      {user?.role === 'owner' && (
                        <>
                          <Building2 className="mr-2 h-4 w-4 text-primary shrink-0" />
                          Owner Dashboard
                        </>
                      )}
                      {user?.role === 'investor' && (
                        <>
                          <User className="mr-2 h-4 w-4 text-primary shrink-0" />
                          Investor Dashboard
                        </>
                      )}
                      {user?.role === 'customer' && (
                        <>
                          <Store className="mr-2 h-4 w-4 text-primary shrink-0" />
                          Marketplace
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
                  className="text-foreground hover:text-primary hover:bg-primary/10"
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
              className="text-primary hover:text-blue-800 hover:bg-primary/10 transition-colors"
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
              <Link
                href="/marketplace"
                className="px-3 py-2.5 rounded-lg font-medium text-foreground hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                href="/cart"
                className="px-3 py-2.5 rounded-lg font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingCart className="h-4 w-4 text-primary" />
                Cart{itemCount > 0 ? ` (${itemCount})` : ''}
              </Link>
              <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 rounded-full shrink-0">
                          <AvatarImage src={user?.avatarUrl} alt="" />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {user?.firstName?.[0] && user?.lastName?.[0]
                              ? `${user.firstName[0]}${user.lastName[0]}`
                              : user?.firstName?.[0] ?? <User className="h-5 w-5" />}
                          </AvatarFallback>
                        </Avatar>
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
                            : user?.role === 'investor'
                              ? '/dashboard'
                              : '/marketplace'
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start rounded-lg text-foreground hover:text-primary">
                        {user?.role === 'admin' && (
                          <>
                            <Shield className="h-4 w-4 mr-2 text-primary shrink-0" />
                            Admin Dashboard
                          </>
                        )}
                        {user?.role === 'owner' && (
                          <>
                            <Building2 className="h-4 w-4 mr-2 text-primary shrink-0" />
                            Owner Dashboard
                          </>
                        )}
                        {user?.role === 'investor' && (
                          <>
                            <User className="h-4 w-4 mr-2 text-primary shrink-0" />
                            Investor Dashboard
                          </>
                        )}
                        {user?.role === 'customer' && (
                          <>
                            <Store className="h-4 w-4 mr-2 text-primary shrink-0" />
                            Marketplace
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
