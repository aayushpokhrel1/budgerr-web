'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/tonight', label: 'Tonight' },
  { href: '/bets', label: 'Bets' },
  { href: '/rewards', label: 'Rewards' },
  { href: '/categories', label: 'Categories' },
  { href: '/link-bank', label: 'Link bank' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-5xl px-6 flex items-center gap-6 h-14">
        <span className="font-medium">Budgerr</span>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href
                ? 'text-sm font-medium text-blue-600 dark:text-blue-400'
                : 'text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
