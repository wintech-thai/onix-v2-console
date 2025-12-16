import { api } from "@/lib/axios";
import { AxiosRequestConfig, AxiosResponse } from "axios";

export function createQueryService<TResponse, TBody, TParams>(config: {
  key: string[];
  url: string | ((params: TParams) => string);
  method?: "get" | "post";
  axiosOptions?: AxiosRequestConfig;
}) {
  const method = config.method || "get";

  return {
    key: config.key,

    fetch: (
      params: TParams,
      body?: TBody
    ): Promise<AxiosResponse<TResponse>> => {
      const url =
        typeof config.url === "function" ? config.url(params) : config.url;

      if (method === "post") {
        return api.post<TResponse>(url, body, config.axiosOptions);
      }
      return api.get<TResponse>(url, config.axiosOptions);
    },

    getQueryKey: (params: TParams, body?: TBody): string[] => {
      const parts: string[] = [...config.key, JSON.stringify(params)];
      if (body !== undefined) {
        parts.push(JSON.stringify(body));
      }
      return parts;
    },
  };
}

export function createMutationService<TResponse, TRequest, TParams>(config: {
  apiName: string;
  url: string | ((params: TParams) => string);
  method?: "post" | "put" | "patch" | "delete";
  axiosOptions?: AxiosRequestConfig;
}) {
  const method = config.method || "post";

  return {
    apiName: config.apiName,

    mutate: (
      params: TParams,
      data?: TRequest
    ): Promise<AxiosResponse<TResponse>> => {
      const url =
        typeof config.url === "function" ? config.url(params) : config.url;
      return api[method]<TResponse>(url, data, config.axiosOptions);
    },
  };
}
