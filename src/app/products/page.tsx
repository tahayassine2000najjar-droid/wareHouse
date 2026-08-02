"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: { _id: string; name: string } | null;
  price: number;
  quantity: number;
  archived: boolean;
}

export default function ProductsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<"active" | "archived">("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/products?archived=${view}`);
      if (!response.ok) {
        setError("Failed to load products");
        return;
      }
      const data = await response.json();
      setProducts(data);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProducts();
    }
  }, [status, fetchProducts]);

  const handleArchive = async (product: Product, archived: boolean) => {
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });

      if (!response.ok) {
        setError("Failed to update product");
        return;
      }

      fetchProducts();
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Products
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex overflow-hidden rounded-md border border-gray-300">
                <button
                  onClick={() => setView("active")}
                  className={`px-3 py-2 text-sm font-medium ${
                    view === "active"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setView("archived")}
                  className={`px-3 py-2 text-sm font-medium ${
                    view === "archived"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Archived
                </button>
              </div>
              <Link
                href="/products/create"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add product
              </Link>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
            {products.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">
                  No {view === "archived" ? "archived " : ""}products found.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {product.sku}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {product.category?.name ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {product.quantity}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/products/${product._id}`}
                              className="text-indigo-600 hover:text-indigo-500"
                            >
                              View
                            </Link>
                            <Link
                              href={`/products/${product._id}/edit`}
                              className="text-indigo-600 hover:text-indigo-500"
                            >
                              Edit
                            </Link>
                            {product.archived ? (
                              <button
                                onClick={() =>
                                  handleArchive(product, false)
                                }
                                className="text-green-600 hover:text-green-500"
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                onClick={() => handleArchive(product, true)}
                                className="text-red-600 hover:text-red-500"
                              >
                                Archive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
