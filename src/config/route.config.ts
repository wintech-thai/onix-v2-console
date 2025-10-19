export const RouteConfig = {
  DASHBOARD: {
    OVERVIEW: (orgId: string) => `/dashboard/${orgId}/overview`,
  },
  GENERAL: {
    PRODUCT: {
      LIST: (orgId: string) => `/${orgId}/general/products`,
      CREATE: (orgId: string) => `/${orgId}/general/products/create`,
      UPDATE: (orgId: string, productId: string) => `/${orgId}/general/products/${productId}/update`,
      IMAGE: (orgId: string, productId: string) => `/${orgId}/general/products/${productId}/image`,
    },
    CUSTOMER: (orgId: string) => `/${orgId}/general/customers`,
    QRCODE: (orgId: string) => `/${orgId}/general/qrcodes`,
    JOB: (orgId: string) => `/${orgId}/general/jobs`,
  },
  ADMIN: {
    APIKEY: (orgId: string) => `/${orgId}/admin/apikeys`,
    USER: (orgId: string) => `/${orgId}/admin/users`,
    AUDIT_LOG: (orgId: string) => `/${orgId}/admin/auditlog`
  },
  LOGIN: "/auth/sign-in",
}
