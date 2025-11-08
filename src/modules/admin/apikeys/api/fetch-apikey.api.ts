import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface IApiKey {
  keyId: string;
  apiKey: string;
  orgId: string;
  keyName: null;
  keyCreatedDate: Date;
  keyExpiredDate: null;
  keyDescription: null;
  keyStatus: string;
  rolesList: string;
  roles: string[];
}

export type FetchApiKeyResponse = IApiKey[];

export interface FetchApiKeyRequest {
  limit: number;
  offset: number;
  fromDate: string;
  toDate: string;
  fullTextSearch?: string;
}

export const fetchApiKeyApi = {
  key: ['fetch-api-key'],
  useFetchApiKey: (params: {
    orgId: string;
    values: FetchApiKeyRequest;
  }) => {
    return useQuery<AxiosResponse<FetchApiKeyResponse>, AxiosError>({
      queryKey: [...fetchApiKeyApi.key, params],
      queryFn: () => {
        return api.post(`api/ApiKey/org/${params.orgId}/action/GetApiKeys`, params.values);
      }
    })
  },
  useFetchApiKeyCount: (params: {
    orgId: string;
    values: FetchApiKeyRequest;
  }) => {
    return useQuery<AxiosResponse<number>, AxiosError>({
      queryKey: [...fetchApiKeyApi.key, "count", params],
      queryFn: () => {
        return api.post(`api/ApiKey/org/${params.orgId}/action/GetApiKeyCount`, params.values);
      }
    })
  }
}
