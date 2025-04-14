import jwt from "jsonwebtoken";

// Define the structure of the decoded JWT token
interface DecodedToken {
  userId: string;
  role?: "client" | "admin";
}

/**
 * Verifies and decodes the user from a JWT token.
 * @param token - The JWT token string from the Authorization header.
 * @returns The decoded user info { userId, role } or null if invalid.
 */
export function getUserFromToken(token: string): DecodedToken | null {
  if (!token) {
    console.warn("No token provided.");
    return null;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not set in the environment.");
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;

    if (!decoded.userId) {
      console.error("Token does not include userId.");
      return null;
    }

    return decoded;
  } catch (err) {
    console.error("JWT Verification Error:", err instanceof Error ? err.message : err);
    return null;
  }
}
