"use client";

import { PointRulesForm } from "../components/point-rules-form/point-rules-form";
import { PointRulesSchemaType } from "../schema/point-rules.schema";
import { getPointRulesApi } from "../api/get-point-rules.api";
import { updatePointRuleApi } from "../api/update-point-rules.api";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { NoPermissionsPage } from "@/components/ui/no-permissions";
import { Loader } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const UpdatePointRuleViewPage = () => {
  const queryClient = useQueryClient();
  const params = useParams<{ orgId: string; pointRuleId: string }>();
  const router = useRouter();

  const getPointRule = getPointRulesApi.useGetPointRule({
    orgId: params.orgId,
    pointRuleId: params.pointRuleId,
  });

  const { mutateAsync: updatePointRule } =
    updatePointRuleApi.useUpdatePointRule();

  const onSubmit = async (values: PointRulesSchemaType) => {
    await updatePointRule(
      {
        orgId: params.orgId,
        pointRuleId: params.pointRuleId,
        values: {
          ...values,
          priority: Number(values.priority),
        },
      },
      {
        onSuccess: ({ data }) => {
          if (data.status !== "OK" && data.status !== "SUCCESS") {
            return toast.error(data.description);
          }

          toast.success("Update Point Rule Success");
          router.back();
          queryClient.invalidateQueries({
            queryKey: [getPointRulesApi.key],
          });
        },
      }
    );
  };

  if (getPointRule.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="animate-spin size-4" />
      </div>
    );
  }

  if (getPointRule.isError) {
    if (getPointRule.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetPointRuleById" />;
    }
    throw new Error(getPointRule.error.message);
  }

  const pointRulePayload = getPointRule.data?.data.pointRule;

  if (!pointRulePayload) {
    throw new Error("Point Rule Not Found");
  }

  return (
    <PointRulesForm
      onSubmit={onSubmit}
      isUpdate={true}
      defaultValues={
        pointRulePayload
          ? {
              ...pointRulePayload,
              priority: Number(pointRulePayload.priority),
            }
          : undefined
      }
    />
  );
};

export default UpdatePointRuleViewPage;
