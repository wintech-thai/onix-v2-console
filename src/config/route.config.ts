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
    CUSTOMER: {
      LIST: (orgId: string) => `/${orgId}/general/customers`,
      CREATE: (orgId: string) => `/${orgId}/general/customers/create`,
      UPDATE: (orgId: string, customerId: string) => `/${orgId}/general/customers/${customerId}/update`,
    },
    QRCODE: (orgId: string) => `/${orgId}/general/qrcodes`,
    JOB: {
      LIST: (orgId: string) => `/${orgId}/general/jobs`,
      CREATE: (orgId: string) => `/${orgId}/general/jobs/create`,
      UPDATE: (orgId: string, jobId: string) => `/${orgId}/general/jobs/${jobId}/update`,
    }
  },
  ADMIN: {
    APIKEY: (orgId: string) => `/${orgId}/admin/apikeys`,
    USER: {
      LIST: (orgId: string) => `/${orgId}/admin/users`,
      CREATE: (orgId: string) => `/${orgId}/admin/users/create`,
      UPDATE: (orgId: string, userId: string) => `/${orgId}/admin/users/${userId}/update`,
    },
    AUDIT_LOG: (orgId: string) => `/${orgId}/admin/auditlog`
  },
  LOGIN: "/auth/sign-in",
}
