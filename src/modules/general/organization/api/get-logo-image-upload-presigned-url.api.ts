import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface GetLogoImageUploadPresignedUrlResponse {
  status:       string;
  description:  string;
  presignedUrl: string;
  objectName:   string;
  imagePath:    string;
  previewUrl:   string;
}

export const getLogoImageUploadPresignedUrlApi = {
  key: "get-logo-image-upload-presigned-url",
  useGetLogoImageUploadPresignedUrl: (params: { orgId: string }) => {
    return useMutation({
      mutationKey: [getLogoImageUploadPresignedUrlApi.key, params],
      mutationFn: () => {
        return api.get<GetLogoImageUploadPresignedUrlResponse>(
          `/api/Organization/org/${params.orgId}/action/GetLogoImageUploadPresignedUrl`
        );
      },
      onError: useErrorToast()
    });
  },
};
