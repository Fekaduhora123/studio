
"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  HandCoins,
  ReceiptText,
  FileBarChart,
  Megaphone,
  LogOut,
  Church,
  Settings,
  Bell,
  Loader2,
  UserCircle,
  MessageSquare,
  Video,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth, useFirestore, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Members', href: '/dashboard/members' },
  { icon: HandCoins, label: 'Donations', href: '/dashboard/donations' },
  { icon: ReceiptText, label: 'Expenses', href: '/dashboard/expenses' },
  { icon: FileBarChart, label: 'Reports', href: '/dashboard/reports' },
  { icon: Megaphone, label: 'Events', href: '/dashboard/events' },
  { icon: Video, label: 'Sermons', href: '/dashboard/sermons' },
  { icon: Camera, label: 'Gallery', href: '/dashboard/moments' },
  { icon: MessageSquare, label: 'Testimonies', href: '/dashboard/testimonies' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Notification logic for new Testimonies
  const pendingTestimoniesQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'testimonies'), where('status', '==', 'pending'));
  }, [firestore]);

  const { data: pendingTestimonies } = useCollection(pendingTestimoniesQuery);
  const pendingCount = pendingTestimonies?.length || 0;
  const lastCountRef = React.useRef(0);

  React.useEffect(() => {
    // Show toast if new testimonies arrive while admin is active
    if (pendingCount > lastCountRef.current && lastCountRef.current !== 0) {
      toast({
        title: "New Testimony Income",
        description: `A new community story or idea has been submitted for review.`,
      });
    }
    lastCountRef.current = pendingCount;
  }, [pendingCount, toast]);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="p-4 flex flex-row items-center gap-2 mb-4">
            <div className="bg-accent p-1.5 rounded-lg">
              <Church className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight">SanctuaryLink</span>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      pathname === item.href
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm'
                        : 'hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    }`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <div className="flex items-center justify-between w-full">
                        <span>{item.label}</span>
                        {item.label === 'Testimonies' && pendingCount > 0 && (
                          <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                            {pendingCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/dashboard/profile'}
                  tooltip="Profile"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    pathname === '/dashboard/profile'
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm'
                      : 'hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}
                >
                  <Link href="/dashboard/profile">
                    <UserCircle className="h-5 w-5" />
                    <span>Admin Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="hover:bg-sidebar-accent/50 text-sidebar-foreground w-full justify-start"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between px-6 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h2 className="text-lg font-headline font-semibold text-primary">
                {navItems.find(item => item.href === pathname)?.label || (pathname === '/dashboard/profile' ? 'Profile' : 'Dashboard')}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                <Link href="/dashboard/testimonies">
                  <Bell className="h-5 w-5" />
                  {pendingCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center bg-accent text-[8px] font-bold text-white rounded-full border-2 border-white ring-1 ring-accent animate-bounce">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Link href="/dashboard/profile">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="flex flex-col items-end hidden sm:flex">
                  <p className="text-sm font-medium leading-none">{user.displayName || 'Admin User'}</p>
                  <p className="text-xs text-muted-foreground">Church Admin</p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
