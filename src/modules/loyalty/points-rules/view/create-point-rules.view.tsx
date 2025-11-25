"use client";

import { PointRulesForm } from "../components/point-rules-form/point-rules-form";
import { PointRulesSchemaType } from "../schema/point-rules.schema";

const CreatePointRuleViewPage = () => {
  const onSubmit = async (values: PointRulesSchemaType) => {
    console.log(values);
  };

  const defaultJson = [
    {
      WorkflowName: "workflow1",
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
        ruleDefinition: JSON.stringify(defaultJson),
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
