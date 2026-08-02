"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="header-brand">
            <span className="header-logo">WarehouseOS</span>
          </Link>
          <nav className="header-nav">
            <Link href="/dashboard" className="header-nav-link">
              Dashboard
            </Link>
            <Link href="/products" className="header-nav-link">
              Products
            </Link>
            <Link href="/categories" className="header-nav-link">
              Categories
            </Link>
            <Link href="/movements" className="header-nav-link">
              Movements
            </Link>
          </nav>
        </div>

        <div className="header-user">
          {session?.user && (
            <div className="header-user-info">
              <p className="header-user-name">{session.user.name}</p>
              <p className="header-user-email">{session.user.email}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="header-logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
