export const RouteConfig = {
  DASHBOARD: {
    OVERVIEW: (orgId: string) => `/dashboard/${orgId}/overview`,
  },
  GENERAL: {
    PRODUCT: (orgId: string) => `/${orgId}/general/products`,
    CUSTOMER: (orgId: string) => `/${orgId}/general/customers`,
    QRCODE: (orgId: string) => `/${orgId}/general/qrcodes`,
    JOB: (orgId: string) => `/${orgId}/general/jobs`,
  },
  ADMIN: {
    APIKEY: (orgId: string) => `/${orgId}/admin/apikeys`,
    USER: (orgId: string) => `/${orgId}/admin/users`,
  },
  LOGIN: "/auth/sign-in",
}
