
// src/components/layout/header-content.tsx
"use client";
import { useAuth } from '@/hooks/use-auth';
import Logo from '@/components/common/logo';
import SellerSelector from '@/components/common/seller-selector';
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
import { LogOut, UserCircle, Moon, Sun, Menu } from 'lucide-react'; // Adicionado Menu
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { EMAIL_RECOVERY_ADDRESS } from '@/lib/constants';

interface HeaderContentProps {
  toggleMobileMenu: () => void;
}

export default function HeaderContent({ toggleMobileMenu }: HeaderContentProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white dark:bg-white"> {/* z-index ajustado para ficar abaixo da sidebar mobile */}
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="mr-2 md:hidden text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menu</span>
          </Button>
          <Link href="/dashboard" className="flex items-center">
            <Logo width={100} height={32} />
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <div className="hidden md:block">
            <SellerSelector />
          </div>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label="Toggle theme"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {EMAIL_RECOVERY_ADDRESS.startsWith('pastaengear') ? 'Administrador' : 'Vendedor'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div className="md:hidden border-t p-2 flex justify-center bg-white dark:bg-white">
         <SellerSelector />
      </div>
    </header>
  );
}
