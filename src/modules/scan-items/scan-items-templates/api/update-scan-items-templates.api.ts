import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ScanItemTemplateSchemaType } from "../schema/scan-items-templates.schema";

export const updateScanItemsTemplatesApi = {
  key: "update-scan-items-templates",
  useUpdateScanItemsTemplates: () => {
    return useMutation({
      mutationKey: [updateScanItemsTemplatesApi.key],
      mutationFn: (params: {
        orgId: string;
        templateId: string;
        values: ScanItemTemplateSchemaType;
      }) => {
        return api.post(
          `/api/ScanItemTemplate/org/${params.orgId}/action/UpdateScanItemTemplateById/${params.templateId}`,
          params.values
        );
      },
      onError: useErrorToast("UpdateScanItemTemplateById"),
    });
  },
};
