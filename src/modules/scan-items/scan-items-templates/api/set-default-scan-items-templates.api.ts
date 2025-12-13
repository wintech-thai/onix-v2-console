import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface SetDefaultScanItemsTemplatesResponse {
  status: string;
  description: string;
}

export const setDefaultScanItemsTemplatesApi = {
  key: "set-default-scan-items-templates",
  useSetDefaultScanItemsTemplates: () => {
    return useMutation({
      mutationKey: [setDefaultScanItemsTemplatesApi.key],
      mutationFn: (params: { orgId: string; templateId: string }) => {
        return api.post<SetDefaultScanItemsTemplatesResponse>(
          `/api/ScanItemTemplate/org/${params.orgId}/action/SetDefaultScanItemTemplateById/${params.templateId}`
        );
      },
      onError: useErrorToast("SetDefaultScanItemTemplateById")
    });
  },
};
