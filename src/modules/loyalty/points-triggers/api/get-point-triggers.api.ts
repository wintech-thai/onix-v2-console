import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { IPointTrigger } from "./fetch-point-triggers.api";

export interface GetPointTriggerResponse {
  status: string;
  description: string;
  pointTrigger: IPointTrigger;
}

export const getPointTriggerApi = {
  key: "get-point-trigger",
  useGetPointTrigger: (params: {
    orgId: string;
    pointTriggerId: string;
  }) => {
    return useQuery<AxiosResponse<GetPointTriggerResponse>, AxiosError>({
      queryKey: [getPointTriggerApi.key, params],
      queryFn: () => {
        return api.get(`/api/PointTrigger/org/${params.orgId}/action/GetPointTriggerById/${params.pointTriggerId}`)
      }
    })
  }
}
