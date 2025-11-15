export const RouteConfig = {
  DASHBOARD: {
    OVERVIEW: (orgId: string) => `/dashboard/${orgId}/overview`,
  },
  GENERAL: {
    ORG: {
      VIEW: (orgId: string) => `/${orgId}/general/organization`,
    },
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
    QRCODE: {
      INDEX: (orgId: string) => `/${orgId}/general/qrcodes`,
      VIEW: (orgId: string, scanItemId: string) => `/${orgId}/general/qrcodes/${scanItemId}/view`,
    },
    JOB: {
      LIST: (orgId: string) => `/${orgId}/general/jobs`,
      CREATE: (orgId: string) => `/${orgId}/general/jobs/create`,
      UPDATE: (orgId: string, jobId: string) => `/${orgId}/general/jobs/${jobId}/update`,
    }
  },
  LOYALTY: {
    POINTS_WALLETS: {
      LIST: (orgId: string) => `/${orgId}/loyalty/points-wallets`,
    },
    PRIVILEGES: {
      LIST: (orgId: string) => `/${orgId}/loyalty/privileges`,
    },
    POINT_FUNCTIONS: {
      LIST: (orgId: string) => `/${orgId}/loyalty/point-functions`,
    },
    POINT_REDEEM: {
      LIST: (orgId: string) => `/${orgId}/loyalty/point-redeem`,
    },
  },
  ADMIN: {
    APIKEY: {
      LIST: (orgId: string) => `/${orgId}/admin/apikeys`,
      CREATE: (orgId: string) => `/${orgId}/admin/apikeys/create`,
      UPDATE: (orgId: string, apikeyId: string) => `/${orgId}/admin/apikeys/${apikeyId}/update`,
    },
    USER: {
      LIST: (orgId: string) => `/${orgId}/admin/users`,
      CREATE: (orgId: string) => `/${orgId}/admin/users/create`,
      UPDATE: (orgId: string, userId: string) => `/${orgId}/admin/users/${userId}/update`,
    },
    AUDIT_LOG: {
      LIST: (orgId: string) => `/${orgId}/admin/auditlog`,
      FULL_LOG: (orgId: string) => `/${orgId}/admin/auditlog/full-log`,
    }
  },
  LOGIN: "/auth/sign-in",
}
