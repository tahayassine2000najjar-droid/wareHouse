"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CategoryOption {
  _id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  sku: string;
  categoryId: string;
  price: string;
  quantity: string;
}

interface ProductFormProps {
  productId?: string;
  initialData?: {
    name: string;
    sku: string;
    category: { _id: string; name: string } | string | null;
    price: number;
    quantity: number;
  };
}

export default function ProductForm({
  productId,
  initialData,
}: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name ?? "",
    sku: initialData?.sku ?? "",
    categoryId:
      (typeof initialData?.category === "object" && initialData?.category?._id) ||
      (typeof initialData?.category === "string" ? initialData.category : "") ||
      "",
    price: initialData?.price != null ? String(initialData.price) : "",
    quantity: initialData?.quantity != null ? String(initialData.quantity) : "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductFormData, string>>
  >({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch {
        setServerError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");

    const payload = {
      name: formData.name,
      sku: formData.sku,
      categoryId: formData.categoryId,
      price: formData.price === "" ? undefined : Number(formData.price),
      quantity:
        formData.quantity === "" ? undefined : Number(formData.quantity),
    };

    const url = productId ? `/api/products/${productId}` : "/api/products";
    const method = productId ? "PATCH" : "POST";

    setLoading(true);

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (typeof data.error === "object" && data.error !== null) {
          const fieldErrors = data.error as Record<string, string[]>;
          setErrors({
            name: fieldErrors.name?.[0] || "",
            sku: fieldErrors.sku?.[0] || "",
            categoryId: fieldErrors.categoryId?.[0] || "",
            price: fieldErrors.price?.[0] || "",
            quantity: fieldErrors.quantity?.[0] || "",
          });
        } else {
          setServerError(data.error || "Failed to save product");
        }
        return;
      }

      router.push(`/products/${data._id}`);
      router.refresh();
    } catch {
      setServerError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {serverError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Product name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
          SKU (reference)
        </label>
        <input
          id="sku"
          name="sku"
          type="text"
          value={formData.sku}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. SKU-001"
        />
        {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
      </div>

      <div>
        <label
          htmlFor="categoryId"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
        )}
        {!loading && categories.length === 0 && (
          <p className="mt-1 text-sm text-amber-600">
            No categories yet.{" "}
            <Link href="/categories" className="font-medium text-indigo-600 hover:text-indigo-500">
              Create one first
            </Link>
            .
          </p>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price ($)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="0.00"
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700"
        >
          Quantity in stock
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min="0"
          step="1"
          value={formData.quantity}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="0"
        />
        {errors.quantity && (
          <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : productId
              ? "Save changes"
              : "Create product"}
        </button>
        <Link
          href="/products"
          className="rounded-md bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
