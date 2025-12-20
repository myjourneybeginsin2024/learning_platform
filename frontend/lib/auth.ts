import { apiFetch } from "./api";

export async function login(email: string, password: string) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// NEW: Fetch current user
export async function getCurrentUser(token: string) {
  const response = await fetch("/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Invalid token");
  }
  return response.json();
}
