import {
  registerSchema,
  loginSchema,
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
