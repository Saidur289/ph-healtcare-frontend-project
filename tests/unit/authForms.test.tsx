// plan.md 11.10: the login and register forms (server actions are mocked).
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginForm from "@/components/modules/Auth/LoginForm";
import RegisterForm from "@/components/modules/Auth/RegisterForm";

const { loginAction, registerAction } = vi.hoisted(() => ({
  loginAction: vi.fn(),
  registerAction: vi.fn(),
}));
vi.mock("@/app/(commonLayout)/(authRouteGroup)/login/_action", () => ({ loginAction }));
vi.mock("@/app/(commonLayout)/(authRouteGroup)/register/_action", () => ({ registerAction }));

const renderWithQuery = (ui: ReactNode) => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

beforeEach(() => {
  loginAction.mockReset();
  registerAction.mockReset();
});

describe("LoginForm", () => {
  it("sends the email, password and redirect path to the login action", async () => {
    loginAction.mockResolvedValue(undefined); // success = the action redirects
    const user = userEvent.setup();
    renderWithQuery(<LoginForm redirectPath="/dashboard/my-appointments" />);

    await user.type(screen.getByLabelText("Email"), "rahim@example.test");
    await user.type(screen.getByPlaceholderText("Enter your password"), "Test#Password1");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => expect(loginAction).toHaveBeenCalledTimes(1));
    expect(loginAction).toHaveBeenCalledWith({ email: "rahim@example.test", password: "Test#Password1" }, "/dashboard/my-appointments");
  });

  it("shows the API's error message", async () => {
    loginAction.mockResolvedValue({ success: false, message: "Invalid email or password" });
    const user = userEvent.setup();
    renderWithQuery(<LoginForm />);
    await user.type(screen.getByLabelText("Email"), "rahim@example.test");
    await user.type(screen.getByPlaceholderText("Enter your password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log In" }));
    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  });

  it("shows a generic message when the action throws", async () => {
    loginAction.mockRejectedValue(new Error("network"));
    const user = userEvent.setup();
    renderWithQuery(<LoginForm />);
    await user.type(screen.getByLabelText("Email"), "rahim@example.test");
    await user.type(screen.getByPlaceholderText("Enter your password"), "x");
    await user.click(screen.getByRole("button", { name: "Log In" }));
    expect(await screen.findByText("Login failed. Please try again.")).toBeInTheDocument();
  });

  it("validates the email while typing and does not submit an invalid form", async () => {
    const user = userEvent.setup();
    renderWithQuery(<LoginForm />);
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    expect(await screen.findByText("Please enter a valid email")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Log In" }));
    expect(loginAction).not.toHaveBeenCalled();
  });

  it("shows and hides the password", async () => {
    const user = userEvent.setup();
    renderWithQuery(<LoginForm />);
    const input = screen.getByPlaceholderText("Enter your password");
    expect(input).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("pre-fills the email and shows a notice / initial error", () => {
    renderWithQuery(<LoginForm initialEmail="rahim@example.test" notice="Email verified. Please log in." />);
    expect(screen.getByLabelText("Email")).toHaveValue("rahim@example.test");
    expect(screen.getByText("Email verified. Please log in.")).toBeInTheDocument();
  });
});

describe("RegisterForm", () => {
  const fill = async (user: ReturnType<typeof userEvent.setup>, password = "Test#Password1") => {
    await user.type(screen.getByLabelText("Email"), "karim@example.test");
    await user.type(screen.getByLabelText("Name"), "Karim Ahmed");
    await user.type(screen.getByPlaceholderText(/password/i), password);
  };

  it("needs the consent checkbox before anything is sent", async () => {
    const user = userEvent.setup();
    renderWithQuery(<RegisterForm />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    expect(await screen.findByText("Please accept the privacy policy and terms")).toBeInTheDocument();
    expect(registerAction).not.toHaveBeenCalled();
  });

  it("sends the registration with acceptTerms once the box is ticked", async () => {
    registerAction.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithQuery(<RegisterForm />);
    await fill(user);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    await waitFor(() => expect(registerAction).toHaveBeenCalledTimes(1));
    expect(registerAction).toHaveBeenCalledWith({
      email: "karim@example.test",
      name: "Karim Ahmed",
      password: "Test#Password1",
      acceptTerms: true,
    });
  });

  it("applies the password policy", async () => {
    const user = userEvent.setup();
    renderWithQuery(<RegisterForm />);
    await fill(user, "password1");
    expect(await screen.findByText("This password is too common, please choose another one")).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    expect(registerAction).not.toHaveBeenCalled();
  });

  it("links to the privacy policy and terms", () => {
    renderWithQuery(<RegisterForm />);
    expect(screen.getByRole("link", { name: "privacy policy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "terms of use" })).toHaveAttribute("href", "/terms");
  });

  it("shows the API's error message", async () => {
    registerAction.mockResolvedValue({ success: false, message: "Too many attempts for this email." });
    const user = userEvent.setup();
    renderWithQuery(<RegisterForm />);
    await fill(user);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    expect(await screen.findByText("Too many attempts for this email.")).toBeInTheDocument();
  });
});
