import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ScanItemTemplateSchemaType } from "../schema/scan-items-templates.schema";

export const createScanItemsTemplatesApi = {
  key: "create-scan-items-templates",
  useCreateScanItemsTemplates: () => {
    return useMutation({
      mutationKey: [createScanItemsTemplatesApi.key],
      mutationFn: (params: {
        orgId: string;
        values: ScanItemTemplateSchemaType;
      }) => {
        return api.post(
          `/api/ScanItemTemplate/org/${params.orgId}/action/AddScanItemTemplate`,
          params.values
        );
      },
      onError: useErrorToast("AddScanItemTemplate"),
    });
  },
};
