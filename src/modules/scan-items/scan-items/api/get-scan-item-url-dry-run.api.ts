import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { ScanItem } from "./get-scan-items";

export interface GetScanItemURLDryRunResponse {
  status: string;
  description: string;
  scanItem?: ScanItem;
}

export const getScanItemUrlDryRunApi = {
  key: "get-scan-item-url-dry-run",
  useMutation: () => {
    return useMutation({
      mutationKey: [getScanItemUrlDryRunApi.key],
      mutationFn: async (params: { orgId: string; scanItemId: string }) => {
        return api.get<GetScanItemURLDryRunResponse>(`/api/ScanItem/org/${params.orgId}/action/GetScanItemUrlDryRunById/${params.scanItemId}`);
      },
    });
  },
};
