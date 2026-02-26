"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Members', href: '/dashboard/members' },
  { icon: HandCoins, label: 'Donations', href: '/dashboard/donations' },
  { icon: ReceiptText, label: 'Expenses', href: '/dashboard/expenses' },
  { icon: FileBarChart, label: 'Reports', href: '/dashboard/reports' },
  { icon: Megaphone, label: 'Events', href: '/dashboard/events' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="p-4 flex flex-row items-center gap-2 mb-4">
            <div className="bg-accent p-1.5 rounded-lg">
              <Church className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight hidden group-data-[collapsible=icon]:inline">SanctuaryLink</span>
            <span className="font-headline font-bold text-xl tracking-tight group-data-[collapsible=icon]:hidden">SanctuaryLink</span>
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
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-sidebar-accent/50 text-sidebar-foreground">
                  <Link href="/">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </Link>
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
                {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-white" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="flex flex-col items-end hidden sm:flex">
                  <p className="text-sm font-medium leading-none">Pastor James</p>
                  <p className="text-xs text-muted-foreground">Church Admin</p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src="https://picsum.photos/seed/pastor/100/100" />
                  <AvatarFallback>PJ</AvatarFallback>
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