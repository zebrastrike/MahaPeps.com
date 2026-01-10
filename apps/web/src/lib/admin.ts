export const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const getAdminHeaders = () => {
  const adminUserId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
  return adminUserId ? { "x-admin-user-id": adminUserId } : {};
};

export const hasAdminHeader = () => !!process.env.NEXT_PUBLIC_ADMIN_USER_ID;
