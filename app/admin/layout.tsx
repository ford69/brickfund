'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  LayoutDashboard,
  Users,
  CheckCircle,
  FileText,
  Store,
  BarChart3,
  Activity,
  Package,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const sidebarItems: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }>; href: string }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/admin?tab=overview' },
  { id: 'users', label: 'Users', icon: Users, href: '/admin?tab=users' },
  { id: 'projects', label: 'Projects', icon: Building2, href: '/admin?tab=projects' },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle, href: '/admin?tab=approvals' },
  { id: 'kyc', label: 'KYC Review', icon: FileText, href: '/admin?tab=kyc' },
  { id: 'inventory', label: 'Inventory', icon: Store, href: '/admin/marketplace' },
  { id: 'fulfillment', label: 'Fulfillment Settings', icon: Package, href: '/admin/fulfillment' },
  { id: 'stats', label: 'Statistics', icon: BarChart3, href: '/admin?tab=stats' },
  { id: 'activity', label: 'Activity', icon: Activity, href: '/admin?tab=activity' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/signin?redirect=/admin');
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-slate-600 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  const isMarketplace = pathname.startsWith('/admin/marketplace');
  const isFulfillment = pathname.startsWith('/admin/fulfillment');
  const isProjectReview = pathname.startsWith('/admin/projects/');
  const isAdminRoot = pathname === '/admin';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar - full height, scrollable nav */}
      <aside
        className={`fixed lg:relative z-50 flex flex-col min-h-screen flex-shrink-0 border-r border-slate-200 bg-slate-900 text-white transition-[width] duration-300 ease-in-out ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0 lg:w-20'
        } ${mobileMenuOpen ? 'translate-x-0 w-64' : ''}`}
      >
        <div className="flex h-full flex-col min-h-0">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between gap-2 border-b border-slate-700 px-4 flex-shrink-0">
            {sidebarOpen && (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <Shield className="h-6 w-6 text-blue-400 flex-shrink-0" />
                  <span className="font-semibold truncate">Admin Portal</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="flex-shrink-0 text-slate-300 hover:text-white hover:bg-slate-700 lg:flex hidden"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </>
            )}
            {!sidebarOpen && (
              <div className="flex w-full justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="text-slate-300 hover:text-white hover:bg-slate-700 lg:flex hidden"
                  aria-label="Expand sidebar"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-300 hover:text-white"
              aria-label="Close menu"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Nav - scrollable */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-0.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href.startsWith('/admin?')
                  ? isAdminRoot && item.id === tab
                  : pathname.startsWith(item.href);
              const showLabel = sidebarOpen;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  } ${!showLabel ? 'justify-center' : ''}`}
                  title={!showLabel ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {showLabel && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer - Back to Site */}
          <div className="border-t border-slate-700 p-3 flex-shrink-0">
            <Link href="/" className="block" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className={`w-full ${sidebarOpen ? 'justify-start gap-3' : 'justify-center px-0'}`}
                title={!sidebarOpen ? 'Back to Site' : undefined}
              >
                <Building2 className="h-5 w-5 flex-shrink-0 text-slate-400" />
                {sidebarOpen && <span className="truncate text-slate-400">Back to Site</span>}
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* When sidebar collapsed on desktop, show expand FAB or bar */}
      {!sidebarOpen && (
        <div className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-30">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="rounded-r-none border-slate-200 bg-white shadow"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {isProjectReview ? 'Review Project' : isMarketplace ? 'Marketplace' : isFulfillment ? 'Fulfillment Settings' : 'Admin Dashboard'}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">BrickFund Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
