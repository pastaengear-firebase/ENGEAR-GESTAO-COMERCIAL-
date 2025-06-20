
// src/components/layout/sidebar-nav.tsx
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/types';
import { LayoutDashboard, FilePlus, Database, FileEdit, Receipt, Settings, FileText, X, ClipboardList } from 'lucide-react'; // Adicionado ClipboardList e X
import Logo from '@/components/common/logo';
import { Button } from '@/components/ui/button';

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    isActive: (pathname) => pathname.startsWith('/dashboard'),
  },
  {
    title: 'Inserir Venda',
    href: '/inserir-venda',
    icon: FilePlus,
    isActive: (pathname) => pathname.startsWith('/inserir-venda'),
  },
  {
    title: 'Dados',
    href: '/dados',
    icon: Database,
    isActive: (pathname) => pathname.startsWith('/dados'),
  },
  {
    title: 'Editar Venda',
    href: '/editar-venda',
    icon: FileEdit,
    isActive: (pathname) => pathname.startsWith('/editar-venda'),
  },
  {
    title: 'Faturamento',
    href: '/faturamento',
    icon: Receipt,
    isActive: (pathname) => pathname.startsWith('/faturamento'),
  },
  {
    title: 'Propostas',
    href: '/propostas/gerenciar',
    icon: FileText,
    isActive: (pathname) => pathname.startsWith('/propostas'),
  },
  {
    title: 'Planner', // Novo item de menu
    href: '/planner',
    icon: ClipboardList,
    isActive: (pathname) => pathname.startsWith('/planner'),
  },
  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
    isActive: (pathname) => pathname.startsWith('/configuracoes'),
  },
];

interface SidebarNavProps {
  isMobileMenuOpen: boolean;
  closeMobileMenu: () => void;
}

export default function SidebarNav({ isMobileMenuOpen, closeMobileMenu }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      <div
        onClick={closeMobileMenu}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 md:hidden",
          isMobileMenuOpen ? "block" : "hidden"
        )}
      />

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r text-sidebar-foreground shadow-lg",
        "bg-sidebar",
        "transition-transform duration-300 ease-in-out md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-[72px] items-center justify-between border-b border-sidebar-border px-6 bg-white dark:bg-white">
          <Logo width={170} height={48} /> {/* Ajustado o tamanho do logo para caber o botão de fechar */}
          <Button variant="ghost" size="icon" onClick={closeMobileMenu} className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar menu</span>
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu} // Close menu on link click for mobile
              className={cn(
                'group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                item.isActive && item.isActive(pathname)
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2 focus:ring-offset-sidebar'
              )}
            >
              <item.icon className={cn('mr-3 h-5 w-5 flex-shrink-0')} aria-hidden="true" />
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-sidebar-border p-4">
          <p className="text-center text-xs text-sidebar-foreground/70">
            © {new Date().getFullYear()} ENGEAR
          </p>
        </div>
      </aside>
    </>
  );
}
