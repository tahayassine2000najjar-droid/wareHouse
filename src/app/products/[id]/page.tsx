"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: { _id: string; name: string; description?: string } | null;
  description?: string;
  price: number;
  quantity: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage() {
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

  const handleArchive = async (archived: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });

      if (!response.ok) {
        setError("Failed to update product");
        return;
      }

      fetchProduct();
    } catch {
      setError("Failed to update product");
    }
  };

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
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            &larr; Back to products
          </Link>

          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!error && product && (
            <>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {product.name}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    SKU: {product.sku}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {product.archived && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      Archived
                    </span>
                  )}
                  <Link
                    href={`/products/${product._id}/edit`}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Edit
                  </Link>
                  {product.archived ? (
                    <button
                      onClick={() => handleArchive(false)}
                      className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => handleArchive(true)}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
                <dl className="divide-y divide-gray-200">
                  <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {product.name}
                    </dd>
                  </div>
                  <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">SKU</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {product.sku}
                    </dd>
                  </div>
                  <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Description
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {product.description || "—"}
                    </dd>
                  </div>
                  <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Category
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {product.category?.name ?? "—"}
                    </dd>
                  </div>
                  <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      ${product.price.toFixed(2)}
                    </dd>
                  </div>
                  <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Quantity in stock
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {product.quantity}
                    </dd>
                  </div>
                  <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Created
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {new Date(product.createdAt).toLocaleString()}
                    </dd>
                  </div>
                  <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Last updated
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {new Date(product.updatedAt).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
