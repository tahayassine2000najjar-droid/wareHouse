"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginSchema, LoginInput } from "@/lib/validations";

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginInput, string>>
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

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || "",
        password: fieldErrors.password?.[0] || "",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (response?.error) {
        setServerError("Invalid email or password");
        return;
      }

      router.push("/dashboard");
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
        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} style={{ marginTop: "1.75rem" }}>
          {serverError && (
            <div className="alert alert-error" style={{ marginBottom: "1.25rem" }}>
              <span>{serverError}</span>
            </div>
          )}

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
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="Your password"
            />
            {errors.password && (
              <p className="form-error">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ marginTop: "0.5rem" }}
          >
            {loading && <span className="spinner" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="auth-link" style={{ marginTop: "1.25rem" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
