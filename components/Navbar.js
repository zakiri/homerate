import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const Navbar = ({ user }) => {
  const router = useRouter();

  const navItems = [
    { label: '📊 Dashboard', href: '/dashboard', protected: true },
    { label: '💎 Varlıklar', href: '/assets', protected: false },
    { label: '💱 Değişim', href: '/swap', protected: false },
    { label: '📈 Pazar', href: '/market', protected: false },
    { label: '💼 Portföy', href: '/portfolio', protected: true },
    { label: '👤 Profil', href: '/profile', protected: true }
  ];

  const isActive = (href) => router.pathname === href;

  return (
    <nav className="bg-gray-900 bg-opacity-95 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-8">
          {/* Logo */}
          <Link href="/">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition">
              🏦 HomeRate
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-1">
            {navItems.map((item) => {
              if (item.protected && !user) return null;

              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-sm text-gray-400 hidden sm:block">
                  👤 <span className="text-white font-bold">{user.username}</span>
                </div>
                <Link href="/settings">
                  <span className="text-gray-400 hover:text-white cursor-pointer transition">
                    ⚙️
                  </span>
                </Link>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <span className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:border-blue-400 hover:text-white transition cursor-pointer">
                    Giriş
                  </span>
                </Link>
                <Link href="/register">
                  <span className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer">
                    Kayıt
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
