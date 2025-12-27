'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, Building2, User, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    // Also check on mount
    setIsScrolled(window.scrollY > 50);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? 'bg-white border-b border-gray-200 shadow-md'
          : 'bg-transparent border-b border-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Building2 className={`h-8 w-8 transition-colors ${isScrolled ? 'text-blue-700' : 'text-blue-700'}`} />
            <span className={`ml-2 text-2xl font-bold transition-colors ${isScrolled ? 'text-gray-900' : 'text-blue-500'}`}>
              BrickFund
            </span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/projects" 
              className={`font-medium transition-colors hover:text-blue-700 ${isScrolled ? 'text-gray-700' : 'text-blue-500'}`}
            >
              Browse Projects
            </Link>
            <Link 
              href={user?.role === 'admin' ? '/admin' : '/dashboard'} 
              className={`font-medium transition-colors hover:text-blue-700 ${isScrolled ? 'text-gray-700' : 'text-blue-500'}`}
            >
              Dashboard
            </Link>
            <a 
              href="#how-it-works" 
              className={`font-medium transition-colors hover:text-blue-700 ${isScrolled ? 'text-gray-700' : 'text-blue-500'}`}
            >
              How It Works
            </a>
            <a 
              href="#about" 
              className={`font-medium transition-colors hover:text-blue-700 ${isScrolled ? 'text-gray-700' : 'text-blue-700'}`}
            >
              About
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`flex items-center space-x-2 transition-colors hover:text-blue-700 ${
                      isScrolled ? 'text-gray-700' : 'text-blue-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isScrolled ? 'bg-blue-100' : 'bg-blue-700/20'
                    }`}>
                      <User className={`h-4 w-4 transition-colors ${
                        isScrolled ? 'text-blue-700' : 'text-white'
                      }`} />
                    </div>
                    <span className="font-medium">{user?.firstName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      {user?.role === 'admin' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 w-fit">
                          Admin
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center">
                      {user?.role === 'admin' ? (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </>
                      ) : (
                        <>
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'developer' && (
                    <DropdownMenuItem asChild>
                      <Link href="/owner-dashboard" className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>Owner Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/signin">
                  <Button 
                    variant="ghost" 
                    className={`transition-colors ${
                      isScrolled ? 'text-gray-700' : 'text-white hover:bg-white/20'
                    }`}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-blue-700 hover:bg-blue-800 text-white">
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
              className={isScrolled ? 'text-gray-700' : 'text-white'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <motion.div
            className="md:hidden py-4 border-t border-gray-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-3">
              <Link 
                href="/projects" 
                className={`font-medium transition-colors hover:text-blue-700 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
                onClick={() => setIsOpen(false)}
              >
                Browse Projects
              </Link>
              <Link 
                href={user?.role === 'admin' ? '/admin' : '/dashboard'} 
                className={`font-medium transition-colors hover:text-blue-700 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <a 
                href="#how-it-works" 
                className={`font-medium transition-colors hover:text-blue-700 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
                onClick={() => setIsOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#about" 
                className={`font-medium transition-colors hover:text-blue-700 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
                onClick={() => setIsOpen(false)}
              >
                About
              </a>
              <div className="pt-3 border-t border-gray-200 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          {user?.role === 'admin' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        {user?.role === 'admin' ? (
                          <>
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4 mr-2" />
                            Dashboard
                          </>
                        )}
                      </Button>
                    </Link>
                    {user?.role === 'developer' && (
                      <Link href="/owner-dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Building2 className="h-4 w-4 mr-2" />
                          Owner Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-600 hover:text-red-700">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/signin" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}