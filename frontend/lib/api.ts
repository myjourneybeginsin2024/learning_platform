const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://noleij.com';

export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  // Build full URL
  const fullUrl = new URL(url, API_BASE).toString(); // ← This ensures absolute URL

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "API error");
  }

  return res.json();
}
