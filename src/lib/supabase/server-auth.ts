import { AUTH_COOKIE_NAME, getSessionUser } from "./store";
import type { User } from "./types";

/**
 * Extracts and validates the authenticated user from an incoming Next.js Request.
 * Supports both Authorization header (Bearer token) and Cookie session.
 */
export async function authenticateRequest(
  req: Request
): Promise<{ user: User; token: string } | null> {
  let token: string | null = null;

  // 1. Try Authorization header
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  // 2. Try Cookie header
  if (!token) {
    const cookieHeader = req.headers.get("Cookie") || req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
      if (match && match[1]) {
        token = decodeURIComponent(match[1].trim());
      }
    }
  }

  if (!token) {
    return null;
  }

  const user = await getSessionUser(token);
  if (!user) {
    return null;
  }

  return { user, token };
}
