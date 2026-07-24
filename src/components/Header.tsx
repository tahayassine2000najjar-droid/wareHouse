"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold">
              WarehouseOS
            </Link>
            <Link
              href="/dashboard"
              className="hidden rounded-md px-3 py-2 text-sm font-medium hover:bg-indigo-500 sm:inline-block"
            >
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {session?.user && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-indigo-200">{session.user.email}</p>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium hover:bg-indigo-400"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}