import {
  registerSchema,
  loginSchema,
  categorySchema,
  productSchema,
  stockMovementSchema,
  CategoryInput,
  ProductInput,
  StockMovementInput,
  RegisterInput,
  LoginInput,
} from "../validations";

describe("registerSchema", () => {
  const validData: RegisterInput = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("accepts valid data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 3 characters", () => {
    const result = registerSchema.safeParse({
      ...validData,
      name: "Jo",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("rejects invalid email format", () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("rejects empty email", () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
    }
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "password123",
      confirmPassword: "different123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.confirmPassword).toBeDefined();
    }
  });

  it("rejects empty confirmPassword", () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({
      ...validData,
      name: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  const validData: LoginInput = {
    email: "john@example.com",
    password: "password123",
  };

  it("accepts valid data", () => {
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({
      ...validData,
      email: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({
      ...validData,
      email: "bad-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      ...validData,
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
    }
  });
});

describe("categorySchema", () => {
  const validData: CategoryInput = {
    name: "Electronics",
    description: "Devices and accessories",
  };

  it("accepts valid data", () => {
    const result = categorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("accepts data without a description", () => {
    const result = categorySchema.safeParse({ name: "Electronics" });
    expect(result.success).toBe(true);
  });

  it("accepts archived flag", () => {
    const result = categorySchema.safeParse({ name: "Electronics", archived: true });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = categorySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("rejects name longer than 100 characters", () => {
    const result = categorySchema.safeParse({ name: "a".repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("rejects description longer than 500 characters", () => {
    const result = categorySchema.safeParse({
      name: "Electronics",
      description: "a".repeat(501),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.description).toBeDefined();
    }
  });
});

describe("stockMovementSchema", () => {
  const validData: StockMovementInput = {
    productId: "64b7f9c2e4b0f1a2b3c4d5e6",
    type: "entry",
    quantity: 10,
    note: "Restock from supplier",
  };

  it("accepts valid entry data", () => {
    const result = stockMovementSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("accepts a valid exit", () => {
    const result = stockMovementSchema.safeParse({
      ...validData,
      type: "exit",
    });
    expect(result.success).toBe(true);
  });

  it("accepts data without a note", () => {
    const { note, ...dataWithoutNote } = validData;
    const result = stockMovementSchema.safeParse(dataWithoutNote);
    expect(result.success).toBe(true);
  });

  it("rejects empty productId", () => {
    const result = stockMovementSchema.safeParse({ ...validData, productId: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.productId).toBeDefined();
    }
  });

  it("rejects an invalid type", () => {
    const result = stockMovementSchema.safeParse({
      ...validData,
      type: "transfer",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.type).toBeDefined();
    }
  });

  it("rejects a zero quantity", () => {
    const result = stockMovementSchema.safeParse({ ...validData, quantity: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.quantity).toBeDefined();
    }
  });

  it("rejects a negative quantity", () => {
    const result = stockMovementSchema.safeParse({ ...validData, quantity: -5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.quantity).toBeDefined();
    }
  });

  it("rejects a non-integer quantity", () => {
    const result = stockMovementSchema.safeParse({ ...validData, quantity: 2.5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.quantity).toBeDefined();
    }
  });

  it("rejects a note longer than 500 characters", () => {
    const result = stockMovementSchema.safeParse({
      ...validData,
      note: "a".repeat(501),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.note).toBeDefined();
    }
  });
});

describe("productSchema", () => {
  const validData: ProductInput = {
    name: "Wireless Mouse",
    sku: "SKU-001",
    categoryId: "64b7f9c2e4b0f1a2b3c4d5e6",
    description: "Ergonomic wireless mouse",
    price: 29.99,
    quantity: 10,
  };

  it("accepts valid data", () => {
    const result = productSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("accepts data without a description", () => {
    const { description, ...dataWithoutDescription } = validData;
    const result = productSchema.safeParse(dataWithoutDescription);
    expect(result.success).toBe(true);
  });

  it("accepts archived flag", () => {
    const result = productSchema.safeParse({ ...validData, archived: true });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = productSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("rejects empty sku", () => {
    const result = productSchema.safeParse({ ...validData, sku: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.sku).toBeDefined();
    }
  });

  it("rejects empty categoryId", () => {
    const result = productSchema.safeParse({ ...validData, categoryId: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.categoryId).toBeDefined();
    }
  });

  it("rejects description longer than 500 characters", () => {
    const result = productSchema.safeParse({
      ...validData,
      description: "a".repeat(501),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.description).toBeDefined();
    }
  });

  it("rejects negative price", () => {
    const result = productSchema.safeParse({ ...validData, price: -5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.price).toBeDefined();
    }
  });

  it("rejects negative quantity", () => {
    const result = productSchema.safeParse({ ...validData, quantity: -1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.quantity).toBeDefined();
    }
  });

  it("rejects non-integer quantity", () => {
    const result = productSchema.safeParse({ ...validData, quantity: 2.5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.quantity).toBeDefined();
    }
  });
});
