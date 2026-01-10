export const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const getAdminHeaders = () => {
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
};

export const hasAdminHeader = () => !!process.env.NEXT_PUBLIC_ADMIN_TOKEN;
