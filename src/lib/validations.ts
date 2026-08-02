import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must be at most 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  archived: z.boolean().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50, "SKU must be at most 50 characters"),
  categoryId: z.string().min(1, "Category is required"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  price: z.number().min(0, "Price cannot be negative"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be negative"),
  archived: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
