export type ApiContext = {
  baseUrl?: string;
};

export const createApiClient = (context: ApiContext = {}) => ({
  async ping() {
    return {
      status: "ok",
      baseUrl: context.baseUrl ?? "",
      timestamp: new Date().toISOString()
    };
  }
});
