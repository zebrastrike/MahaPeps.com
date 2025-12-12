const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

interface ApiOptions extends RequestInit {
  fallback?: unknown;
}

export async function apiClient<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { fallback, headers, ...rest } = options;
  const endpoint = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...rest,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (fallback !== undefined) {
      return fallback as T;
    }

    throw error;
  }
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
