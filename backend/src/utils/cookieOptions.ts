import { CookieOptions } from "express";

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // "lax" allows the cookie to be sent on top-level navigations (GET) while
  // still providing CSRF protection. "strict" breaks many real-world flows.
  sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

