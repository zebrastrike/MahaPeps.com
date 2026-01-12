export const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const getAdminHeaders = (): Record<string, string> => {
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  if (adminToken) {
    return { Authorization: `Bearer ${adminToken}` };
  }
  return {};
};

export const hasAdminHeader = () => !!process.env.NEXT_PUBLIC_ADMIN_TOKEN;
