"use client";

import { PointRulesForm } from "../components/point-rules-form/point-rules-form";
import { PointRulesSchemaType } from "../schema/point-rules.schema";
import { createPointRulesApi } from "../api/create-point-rules.api";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const CreatePointRuleViewPage = () => {
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const { mutateAsync: createPointRule } =
    createPointRulesApi.useCreatePointRule();

  const onSubmit = async (values: PointRulesSchemaType) => {
    await createPointRule({
      orgId: params.orgId,
      values: {
        ...values,
        priority: Number(values.priority),
      },
    });

    toast.success("Create Point Rule Success");
    router.back();
  };

  const defaultJson = [
    {
      WorkflowName: "Example",
      Rules: [
        {
          RuleName: "GiveDiscount10",
          Expression: "input.ProductQuantity > 0",
          SuccessEvent: 10,
          Actions: {
            OnSuccess: {
              Name: "OutputExpression",
              Context: {
                Expression: "200",
              },
            },
          },
        },
      ],
    },
  ];

  return (
    <PointRulesForm
      onSubmit={onSubmit}
      isUpdate={false}
      defaultValues={{
        description: "",
        ruleDefinition: JSON.stringify(defaultJson, null, 2),
        ruleName: "",
        tags: "",
        triggeredEvent: "",
        priority: 0,
        startDate: "",
        endDate: "",
      }}
    />
  );
};

export default CreatePointRuleViewPage;
