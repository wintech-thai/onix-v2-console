"use client";

import { PointRulesForm } from "../components/point-rules-form/point-rules-form";
import { PointRulesSchemaType } from "../schema/point-rules.schema";

const UpdatePointRuleViewPage = () => {
  const onSubmit = async (values: PointRulesSchemaType) => {
    console.log(values);
  };

  return (
    <PointRulesForm
      onSubmit={onSubmit}
      isUpdate={false}
      defaultValues={{
        description: "",
        ruleDefinition: "[]",
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

export default UpdatePointRuleViewPage;
