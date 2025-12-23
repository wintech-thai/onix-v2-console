/**
 * Authentication configuration constants
 */

// Cookie names
export const COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_NAME: "user_name",
} as const;

// Token expiration times
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN_MS: 14 * 60 * 1000, // 14 minutes in milliseconds
  REFRESH_TOKEN_SECONDS: 60 * 24 * 60 * 60, // 60 days in seconds
} as const;

// Cookie options
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
} as const;
