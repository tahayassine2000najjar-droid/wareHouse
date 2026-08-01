"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Category {
  _id: string;
  name: string;
  description?: string;
}

export default function CategoriesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        setError("Failed to load categories");
        return;
      }
      const data = await response.json();
      setCategories(data);
    } catch {
      setError("Failed to load categories");
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
      fetchCategories();
    }
  }, [status, fetchCategories]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Failed to create category"
        );
        return;
      }

      setName("");
      setDescription("");
      fetchCategories();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`/api/categories/${category._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete category");
        return;
      }

      fetchCategories();
    } catch {
      setError("An unexpected error occurred");
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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Categories
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage the categories used to organize products.
          </p>

          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleCreate}
            className="mt-6 space-y-4 rounded-lg bg-white p-6 shadow"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Add a category
            </h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Electronics"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Short description"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create category"}
            </button>
          </form>

          <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
            {categories.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">No categories yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <li
                    key={category._id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {category.name}
                      </p>
                      {category.description && (
                        <p className="mt-0.5 text-sm text-gray-500">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(category)}
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
