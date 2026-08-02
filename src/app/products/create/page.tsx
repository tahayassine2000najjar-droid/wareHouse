"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductForm from "@/components/ProductForm";

export default function CreateProductPage() {
  const { status } = useSession();
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

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            &larr; Back to products
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
            Add a product
          </h1>
          <div className="mt-6 rounded-lg bg-white p-6 shadow sm:p-8">
            <ProductForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
