import { apiFetch } from "./api";

export async function login(email: string, password: string) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// NEW: Register function
export async function register(email: string, password: string) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// NEW: Fetch current user
export async function getCurrentUser(token: string) {
  // Using fetch directly for the /users/me endpoint with Authorization header
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const text = await response.text();
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.detail || "Invalid token");
    } catch {
      throw new Error(text || `Error: ${response.status}`);
    }
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}
