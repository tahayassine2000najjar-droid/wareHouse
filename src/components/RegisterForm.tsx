"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterInput } from "@/lib/validations";

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0] || "",
        email: fieldErrors.email?.[0] || "",
        password: fieldErrors.password?.[0] || "",
        confirmPassword: fieldErrors.confirmPassword?.[0] || "",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || "Registration failed");
        return;
      }

      router.push("/login");
    } catch {
      setServerError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-card">
        <h1 className="auth-logo">WarehouseOS</h1>
        <p className="auth-subtitle">Create your account</p>

        <form onSubmit={handleSubmit} style={{ marginTop: "1.75rem" }}>
          {serverError && (
            <div className="alert alert-error" style={{ marginBottom: "1.25rem" }}>
              <span>{serverError}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? "error" : ""}`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="Min. 8 characters"
            />
            {errors.password && (
              <p className="form-error">{errors.password}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? "error" : ""}`}
              placeholder="Repeat your password"
            />
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ marginTop: "0.5rem" }}
          >
            {loading && <span className="spinner" />}
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p className="auth-link" style={{ marginTop: "1.25rem" }}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
