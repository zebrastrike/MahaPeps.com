export const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const getAdminHeaders = (): Record<string, string> => {
  // Check for JWT token from login (stored in localStorage)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }

  // Fall back to environment variable (for backwards compatibility)
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  if (adminToken) {
    return { Authorization: `Bearer ${adminToken}` };
  }

  return {};
};

export const hasAdminHeader = () => {
  // Check for JWT token from login first
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      return true;
    }
  }

  // Fall back to environment variable
  return !!process.env.NEXT_PUBLIC_ADMIN_TOKEN;
};
