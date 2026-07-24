"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const loginDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-6 shadow sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Welcome, {session.user.name}!
            </h1>
            <div className="mt-6 space-y-4">
              <div className="rounded-md bg-indigo-50 p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Name:</span> {session.user.name}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Email:</span> {session.user.email}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Login date:</span> {loginDate}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
