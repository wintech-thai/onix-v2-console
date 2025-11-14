import { useQuery } from "@tanstack/react-query";

export interface IAuditLog {
  id: string;
  timestamp?: string;
  username?: string;
  identityType?: string;
  apiName?: string;
  statusCode?: number;
  role?: string;
  ipAddress?: string;
  source?: Record<string, unknown>;
}

interface FetchAuditLogsResponse {
  total: number;
  limit: number;
  offset: number;
  items: {
    id: string;
    index: string;
    source: {
      data?: {
        ["@timestamp"]?: string;
        StatusCode?: number;
        CfClientIp?: string;
        ClientIp?: string;
        api?: {
          ApiName?: string;
          OrgId?: string;
        };
        userInfo?: {
          UserName?: string;
          IdentityType?: string;
          Role?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      };
      ["@timestamp"]?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
  }[];
}

interface FetchAuditLogsParams {
  orgId: string;
  limit: number;
  offset: number;
  searchValue: string;
  dateFrom: string;
  dateTo: string;
}

const fetchAuditLogs = async (
  params: FetchAuditLogsParams
): Promise<FetchAuditLogsResponse> => {
  const response = await fetch(
    `/api/log?orgId=${params.orgId}&limit=${params.limit}&offset=${params.offset}&dateFrom=${params.dateFrom}&dateTo=${params.dateTo}&searchValue=${params.searchValue}`
  );

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json();
};

const useFetchAuditLogs = (values: FetchAuditLogsParams) => {
  return useQuery({
    queryKey: ["audit-logs", values],
    queryFn: () => fetchAuditLogs(values),
  });
};

export const fetchAuditLogsApi = {
  key: ["audit-logs"],
  useFetchAuditLogs,
};
