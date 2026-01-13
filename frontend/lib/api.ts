const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
console.log("API_BASE Configured:", API_BASE);

export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  // Build full URL
  const fullUrl = new URL(url, API_BASE).toString(); // ← This ensures absolute URL

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  // Check if body is FormData (works in all modern browsers and environments)
  const isFormData = options.body && (
    options.body instanceof FormData ||
    options.body.constructor.name === 'FormData'
  );

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  } else {
    // Explicitly remove Content-Type to let browser handle boundary
    delete headers["Content-Type"];
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      }
    }
    const text = await res.text();
    try {
      const err = JSON.parse(text);
      throw new Error(err.detail || "API error");
    } catch (e) {
      throw new Error(text || `API error: ${res.status} ${res.statusText}`);
    }
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}
