import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../LoginForm";

const mockPush = jest.fn();
const mockSignIn = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSignIn.mockResolvedValue({ error: null });
});

describe("LoginForm", () => {
  it("renders email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  it("calls signIn and redirects on success", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), "john@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "john@example.com",
        password: "password123",
        redirect: false,
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("displays error message on failed login", async () => {
    mockSignIn.mockResolvedValueOnce({ error: "CredentialsSignin" });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), "john@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it("contains a link to the register page", () => {
    render(<LoginForm />);
    const link = screen.getByRole("link", { name: /create one/i });
    expect(link).toHaveAttribute("href", "/register");
  });
});
