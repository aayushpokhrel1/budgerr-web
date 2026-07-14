'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/tonight', label: 'Tonight' },
  { href: '/accounts', label: 'Accounts' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/bets', label: 'Bets' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/rewards', label: 'Rewards' },
  { href: '/categories', label: 'Categories' },
  { href: '/link-bank', label: 'Link bank' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 flex items-center gap-6 h-14">
        <span className="font-medium shrink-0">Budgerr</span>
        <div className="flex items-center gap-6 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm border-b-2 pb-[3px] shrink-0 whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                pathname === link.href
                  ? 'font-medium text-primary border-primary'
                  : 'text-muted border-transparent hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
