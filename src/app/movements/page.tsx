"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ProductOption {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
}

interface Movement {
  _id: string;
  product: { _id: string; name: string; sku: string } | null;
  type: "entry" | "exit";
  quantity: number;
  previousStock: number;
  newStock: number;
  note?: string;
  createdAt: string;
}

export default function MovementsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<"entry" | "exit">("entry");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productsResponse, movementsResponse] = await Promise.all([
        fetch("/api/products?archived=false"),
        fetch("/api/movements"),
      ]);

      if (!productsResponse.ok || !movementsResponse.ok) {
        setError("Failed to load data");
        return;
      }

      const [productsData, movementsData] = await Promise.all([
        productsResponse.json(),
        movementsResponse.json(),
      ]);

      setProducts(productsData);
      setMovements(movementsData);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, fetchData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          type,
          quantity: quantity === "" ? undefined : Number(quantity),
          note: note || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (typeof data.error === "object" && data.error !== null) {
          const fieldErrors = data.error as Record<string, string[]>;
          setError(
            fieldErrors.productId?.[0] ||
              fieldErrors.type?.[0] ||
              fieldErrors.quantity?.[0] ||
              fieldErrors.note?.[0] ||
              "Failed to record movement"
          );
        } else {
          setError(data.error || "Failed to record movement");
        }
        return;
      }

      setSuccess(
        data.type === "entry" ? "Stock entry recorded." : "Stock exit recorded."
      );
      setQuantity("");
      setNote("");
      fetchData();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
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
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Stock movements
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Register stock entries and exits. An exit cannot exceed the
            available quantity.
          </p>

          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-md bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5 rounded-lg bg-white p-6 shadow sm:p-8"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Record a movement
            </h2>

            <div>
              <label
                htmlFor="productId"
                className="block text-sm font-medium text-gray-700"
              >
                Product
              </label>
              <select
                id="productId"
                name="productId"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} ({product.sku}) — {product.quantity} in stock
                  </option>
                ))}
              </select>
              {products.length === 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  No active products available.
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Movement type
                </label>
                <select
                  id="type"
                  name="type"
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "entry" | "exit")
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="entry">Entry</option>
                  <option value="exit">Exit</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="note"
                className="block text-sm font-medium text-gray-700"
              >
                Note (optional)
              </label>
              <textarea
                id="note"
                name="note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Short note about this movement"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || products.length === 0}
              className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Record movement"}
            </button>
          </form>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent movements
            </h2>
            <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
              {movements.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">
                    No movements recorded yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Previous / New stock
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {movements.map((movement) => (
                        <tr key={movement._id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {new Date(movement.createdAt).toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            {movement.product?.name ?? "—"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            {movement.type === "entry" ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                Entry
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                Exit
                              </span>
                            )}
                          </td>
                          <td
                            className={`whitespace-nowrap px-6 py-4 text-sm font-semibold ${
                              movement.type === "entry"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {movement.type === "entry" ? "+" : "-"}
                            {movement.quantity}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {movement.previousStock} → {movement.newStock}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
