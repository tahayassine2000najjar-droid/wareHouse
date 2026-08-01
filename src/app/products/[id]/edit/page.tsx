"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductForm from "@/components/ProductForm";

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: { _id: string; name: string } | null;
  price: number;
  quantity: number;
}

export default function EditProductPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.status === 404) {
        setError("Product not found");
        return;
      }
      if (!response.ok) {
        setError("Failed to load product");
        return;
      }
      const data = await response.json();
      setProduct(data);
    } catch {
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProduct();
    }
  }, [status, fetchProduct]);

  if (status === "loading" || loading) {
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
            href={`/products/${productId}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            &larr; Back to product
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
            Edit product
          </h1>

          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!error && product && (
            <div className="mt-6 rounded-lg bg-white p-6 shadow sm:p-8">
              <ProductForm productId={productId} initialData={product} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
