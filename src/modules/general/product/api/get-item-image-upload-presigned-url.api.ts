import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface GetItemImageUploadPresignURLResponse {
  status:       string;
  description:  string;
  presignedUrl: string;
  objectName:   string;
  imagePath:    string;
  previewUrl:   string;
}

export const getItemImageUploadPresignedUrlApi = {
  key: "get-item-image-upload-presigned-url",
  useMutation: () => {
    return useMutation({
      mutationKey: [getItemImageUploadPresignedUrlApi.key],
      mutationFn: async (params: { orgId: string, productId: string }) => {
        return api.get<GetItemImageUploadPresignURLResponse>(`/api/Item/org/${params.orgId}/action/GetItemImageUploadPresignedUrl/${params.productId}`)
      },
    })
  }
}
