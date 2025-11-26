/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TestRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleDefinition: string;
}

import { getRuleInputFieldsApi } from "../../api/fetch-rule-input-field.api";
import { useParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { MuiDateTimePicker } from "@/components/ui/mui-date-time-picker";
import dayjs from "dayjs";
import { Label } from "@/components/ui/label";
import { testPointRulesApi } from "../../api/test-point-rules.api";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle } from "lucide-react";

interface TestRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleDefinition: string;
  triggeredEvent: string;
  ruleName?: string;
}

export const TestRuleModal = ({
  isOpen,
  onClose,
  ruleDefinition,
  triggeredEvent,
  ruleName,
}: TestRuleModalProps) => {
  const { t } = useTranslation("point-rule");
  const params = useParams();
  const orgId = params?.orgId as string;
  const [testResult, setTestResult] = useState<{
    points: number;
    isMatch: boolean;
    message?: string;
  } | null>(null);

  const { data: fieldsData, isLoading: isLoadingFields } =
    getRuleInputFieldsApi.useGetRuleInputFields(
      { triggeredEvent, orgId },
      isOpen
    );

  const { mutate: testRule, isPending: isTesting } =
    testPointRulesApi.useTestPointRules();

  const form = useForm();

  const fields = useMemo(() => {
    return (
      fieldsData?.data?.map((field: any) => ({
        ...field,
        // Ensure default value is correct type
        defaultValue:
          field.fieldType === "number"
            ? Number(field.defaultValue)
            : field.fieldType === "boolean"
            ? field.defaultValue === "true"
            : field.defaultValue,
      })) || []
    );
  }, [fieldsData?.data]);

  // Reset form and result when modal opens or fields change
  useEffect(() => {
    if (isOpen) {
      form.reset({});
      setTestResult(null);
      // Set default values
      fields.forEach((field: any) => {
        if (field.defaultValue !== undefined && field.defaultValue !== "") {
          form.setValue(field.fieldName, field.defaultValue);
        }
      });
    }
  }, [isOpen, form, fields]);

  const onSubmit = (values: any) => {
    if (!ruleDefinition) {
      toast.error(t("modals.testRule.missingDefinition"));
      return;
    }

    const convertedValues = { ...values };

    fields.forEach((field) => {
      const value = convertedValues[field.fieldName];
      if (value !== undefined && value !== "") {
        if (field.fieldType === "int") {
          convertedValues[field.fieldName] = parseInt(value, 10);
        } else if (
          field.fieldType === "double" ||
          field.fieldType === "decimal"
        ) {
          convertedValues[field.fieldName] = parseFloat(value);
        }
      }
    });

    const payload = {
      ...convertedValues,
      ruleDefinition: ruleDefinition,
    };

    testRule(
      { orgId, values: payload },
      {
        onSuccess: ({ data }) => {
          if (data.status !== "OK" && data.status !== "SUCCESS") {
            return toast.error(data.description);
          }

          setTestResult({
            points: Number(data.executionResult) || 0,
            isMatch: data.isMatch,
            message: data.description,
          });

          toast.success(t("modals.testRule.success"));
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || t("modals.testRule.error")
          );
        },
      }
    );
  };

  const handleClose = () => {
    onClose();
    setTestResult(null);
    form.reset();
  };

  const inputTypeMap: Record<string, string> = {
    double: "number",
    decimal: "number",
    int: "number",
    string: "text",
    date: "date",
    datetime: "datetime-local",
    boolean: "checkbox",
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {t("modals.testRule.title", { name: ruleName })}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="flex flex-col gap-6">
            {/* Input Fields */}
            <div className="space-y-4 pl-1">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                {t("modals.testRule.inputFields")}
              </h3>
              {isLoadingFields ? (
                <div className="text-sm text-muted-foreground">
                  {t("modals.testRule.loadingFields")}
                </div>
              ) : fields.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  {t("modals.testRule.noInputFields")}
                </div>
              ) : (
                <FormProvider {...form}>
                  <form
                    id="test-rule-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {fields.map((field: any) => (
                      <div
                        key={field.fieldName}
                        className="flex flex-col gap-1"
                      >
                        {field.fieldType === "date" ||
                        field.fieldType === "datetime" ? (
                          <MuiDateTimePicker
                            label={`${field.fieldName} (${field.fieldType})`}
                            value={
                              form.watch(field.fieldName)
                                ? new Date(form.watch(field.fieldName))
                                : null
                            }
                            onChange={(date: Date | null) =>
                              form.setValue(
                                field.fieldName,
                                date
                                  ? dayjs(date).format(
                                      field.fieldType === "date"
                                        ? "YYYY-MM-DD"
                                        : "YYYY-MM-DDTHH:mm"
                                    )
                                  : ""
                              )
                            }
                            type={
                              field.fieldType === "date" ? "date" : "datetime"
                            }
                          />
                        ) : (
                          <div className="space-y-1">
                            <Label>
                              {field.fieldName}{" "}
                              <span className="text-xs text-muted-foreground">
                                ({field.fieldType})
                              </span>
                            </Label>
                            <Input
                              type={inputTypeMap[field.fieldType] || "text"}
                              {...form.register(field.fieldName)}
                              placeholder={field.defaultValue || ""}
                              defaultValue={field.defaultValue}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </form>
                </FormProvider>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                form="test-rule-form"
                className="w-full"
                isPending={isTesting}
                disabled={isLoadingFields || fields.length === 0}
              >
                {t("form.test")}
              </Button>
            </div>

            {/* Results */}
            <div className="space-y-6 border-t pt-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                  {t("modals.testRule.testResult")}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>{t("modals.testRule.pointsCalculated")}</Label>
                    <div className="p-3 bg-muted/50 rounded-md border font-mono text-lg font-bold h-14">
                      {testResult ? testResult.points : "-"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>{t("modals.testRule.matchStatus")}</Label>
                    <div
                      className={`flex items-center gap-2 p-3 rounded-md border h-14 ${
                        testResult
                          ? testResult.isMatch
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-red-50 border-red-200 text-red-700"
                          : "bg-muted/50"
                      }`}
                    >
                      {testResult ? (
                        testResult.isMatch ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">
                              {t("modals.testRule.matched")}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5" />
                            <span className="font-medium">
                              {t("modals.testRule.notMatched")}
                            </span>
                          </>
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* {testResult?.message && (
                  <div className="space-y-1">
                    <Label>Message</Label>
                    <div className="p-3 bg-muted/50 rounded-md border text-sm">
                      {testResult.message}
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t mt-4">
          <Button variant="outline" onClick={handleClose}>
            {t("form.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
