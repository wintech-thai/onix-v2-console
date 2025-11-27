/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getRuleInputFieldsApi } from "../../api/fetch-rule-evaluate-input-fields.api";
import { evaluatePointRulesApi } from "../../api/evaluate-point-rules.api";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { MuiDateTimePicker } from "@/components/ui/mui-date-time-picker";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

interface EvaluateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggeredEvent: string;
}

const inputTypeMap: Record<string, string> = {
  string: "text",
  number: "number",
  int: "number",
  double: "number",
  decimal: "number",
  boolean: "text",
  date: "date",
  datetime: "datetime-local",
};

export const EvaluateRuleModal = ({
  isOpen,
  onClose,
  triggeredEvent,
}: EvaluateRuleModalProps) => {
  const { t } = useTranslation("point-rule");
  const params = useParams();
  const orgId = params?.orgId as string;
  const [evaluateResult, setEvaluateResult] = useState<{
    points: number;
    isMatch: boolean;
    messages?: string[];
  } | null>(null);

  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const { data: fieldsData, isLoading: isLoadingFields } =
    getRuleInputFieldsApi.useGetRuleInputFields(
      { triggeredEvent, orgId },
      isOpen
    );

  const { mutate: evaluateRule, isPending: isEvaluating } =
    evaluatePointRulesApi.useEvaluatePointRules();

  const fields = useMemo(() => {
    return (
      fieldsData?.data?.map((field: any) => ({
        ...field,
        defaultValue:
          field.fieldType === "number" ||
          field.fieldType === "int" ||
          field.fieldType === "double" ||
          field.fieldType === "decimal"
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
      setEvaluateResult(null);
      const initialValues: Record<string, any> = {};
      fields.forEach((field: any) => {
        if (field.defaultValue !== undefined && field.defaultValue !== "") {
          initialValues[field.fieldName] = field.defaultValue;
        }
      });
      setFormValues(initialValues);
    }
  }, [isOpen, fields]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleRunTest = (e: React.FormEvent) => {
    e.preventDefault();
    const convertedValues = { ...formValues };

    fields.forEach((field: any) => {
      const value = convertedValues[field.fieldName];
      if (value !== undefined && value !== "") {
        if (field.fieldType === "int") {
          convertedValues[field.fieldName] = parseInt(value, 10);
        } else if (
          field.fieldType === "double" ||
          field.fieldType === "decimal" ||
          field.fieldType === "number"
        ) {
          convertedValues[field.fieldName] = parseFloat(value);
        } else if (field.fieldType === "boolean") {
          convertedValues[field.fieldName] =
            String(value).toLowerCase() === "true";
        }
      }
    });

    evaluateRule(
      { orgId, triggeredEvent, values: convertedValues },
      {
        onSuccess: ({ data }) => {
          if (data.status !== "OK" && data.status !== "SUCCESS") {
            return toast.error(data.description);
          }

          setEvaluateResult({
            points: Number(data.executionResult) || 0,
            isMatch: data.isMatch,
            messages: data.messages,
          });

          toast.success(t("modals.evaluateRule.success"));
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || t("modals.evaluateRule.error")
          );
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:min-w-2xl max-h-[90vh] overflow-y-auto z-50">
        <DialogHeader>
          <DialogTitle>
            {t("modals.evaluateRule.title", { event: triggeredEvent })}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {t("modals.evaluateRule.inputFields")}
              </h3>
              {isLoadingFields && (
                <span className="text-sm text-muted-foreground">
                  {t("modals.evaluateRule.loadingFields")}
                </span>
              )}
            </div>

            <form
              id="evaluate-rule-form"
              onSubmit={handleRunTest}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                {fields.map((field: any) => (
                  <div key={field.fieldName} className="flex flex-col gap-1">
                    {field.fieldType === "date" ||
                    field.fieldType === "datetime" ? (
                      <MuiDateTimePicker
                        label={`${field.fieldName} (${field.fieldType})`}
                        value={
                          formValues[field.fieldName]
                            ? new Date(formValues[field.fieldName])
                            : null
                        }
                        onChange={(date) =>
                          handleInputChange(
                            field.fieldName,
                            date ? dayjs(date).toISOString() : ""
                          )
                        }
                        type="datetime"
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
                          value={formValues[field.fieldName] || ""}
                          onChange={(e) =>
                            handleInputChange(field.fieldName, e.target.value)
                          }
                          placeholder={field.defaultValue || ""}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t("modals.evaluateRule.result")}
            </h3>
            <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>{t("modals.evaluateRule.pointsCalculated")}</Label>
                  <div className="text-2xl font-bold">
                    {evaluateResult?.points ?? "-"}
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <Label>{t("modals.evaluateRule.matchStatus")}</Label>
                  <div className="flex items-center justify-end gap-2">
                    {evaluateResult ? (
                      evaluateResult.isMatch ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-green-500 font-medium">
                            {t("modals.evaluateRule.matched")}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="text-red-500 font-medium">
                            {t("modals.evaluateRule.notMatched")}
                          </span>
                        </>
                      )
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>

              {evaluateResult?.messages &&
                evaluateResult.messages.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t("modals.evaluateRule.messages")}</Label>
                    <div className="rounded-md bg-background p-3 text-sm space-y-1 border">
                      {evaluateResult.messages.map((msg, index) => (
                        <div key={index} className="text-muted-foreground">
                          {msg}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("modals.evaluateRule.close")}
          </Button>
          <Button
            type="submit"
            form="evaluate-rule-form"
            disabled={isEvaluating || isLoadingFields}
          >
            {isEvaluating
              ? t("modals.evaluateRule.running")
              : t("modals.evaluateRule.run")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
