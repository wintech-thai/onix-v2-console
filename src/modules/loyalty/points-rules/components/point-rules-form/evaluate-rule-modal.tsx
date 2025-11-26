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
import {
  useForm,
  FormProvider,
  Controller,
  ControllerRenderProps,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { MuiDateTimePicker } from "@/components/ui/mui-date-time-picker";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

interface EvaluateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggeredEvent: string;
}

const inputTypeMap: Record<string, string> = {
  string: "text",
  number: "number",
  boolean: "text", // We might want a select/checkbox for boolean, but text "true"/"false" is what was in test-rule-modal
  date: "date",
  datetime: "datetime-local",
};

export const EvaluateRuleModal = ({
  isOpen,
  onClose,
  triggeredEvent,
}: EvaluateRuleModalProps) => {
  const params = useParams();
  const orgId = params?.orgId as string;
  const [evaluateResult, setEvaluateResult] = useState<{
    points: number;
    isMatch: boolean;
    messages?: string[];
  } | null>(null);

  const { data: fieldsData, isLoading: isLoadingFields } =
    getRuleInputFieldsApi.useGetRuleInputFields(
      { triggeredEvent, orgId },
      isOpen
    );

  const { mutate: evaluateRule, isPending: isEvaluating } =
    evaluatePointRulesApi.useEvaluatePointRules();

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
      setEvaluateResult(null);
      // Set default values
      fields.forEach((field: any) => {
        if (field.defaultValue !== undefined && field.defaultValue !== "") {
          form.setValue(field.fieldName, field.defaultValue);
        }
      });
    }
  }, [isOpen, form, fields]);

  const onSubmit = (values: any) => {
    const convertedValues = { ...values };

    fields.forEach((field: any) => {
      const value = convertedValues[field.fieldName];
      if (field.fieldType === "number") {
        convertedValues[field.fieldName] = Number(value);
      } else if (field.fieldType === "boolean") {
        convertedValues[field.fieldName] =
          String(value).toLowerCase() === "true";
      } else if (field.fieldType === "date" || field.fieldType === "datetime") {
        // Ensure date is in ISO format if needed, or just pass as string if API expects it
        // The MuiDateTimePicker returns formatted string (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
        // Adjust if API needs specific format
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

          toast.success("Evaluation run successfully");
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to run evaluation"
          );
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-50">
        <DialogHeader>
          <DialogTitle>Test Rule: {triggeredEvent}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Input Fields</h3>
              {isLoadingFields && (
                <span className="text-sm text-muted-foreground">
                  Loading fields...
                </span>
              )}
            </div>

            <FormProvider {...form}>
              <form
                id="evaluate-rule-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {fields.map((field: any) => (
                  <div key={field.fieldName} className="flex flex-col gap-1">
                    {field.fieldType === "date" ||
                    field.fieldType === "datetime" ? (
                      <Controller
                        control={form.control}
                        name={field.fieldName}
                        render={({
                          field: formField,
                        }: {
                          field: ControllerRenderProps<any, string>;
                        }) => (
                          <MuiDateTimePicker
                            label={`${field.fieldName} (${field.fieldType})`}
                            value={
                              formField.value ? new Date(formField.value) : null
                            }
                            onChange={(date) =>
                              formField.onChange(date ? date.toISOString() : "")
                            }
                            type={
                              field.fieldType === "date" ? "date" : "datetime"
                            }
                          />
                        )}
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
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Result</h3>
            <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Points Calculated</Label>
                  <div className="text-2xl font-bold">
                    {evaluateResult?.points ?? "-"}
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <Label>Match Status</Label>
                  <div className="flex items-center justify-end gap-2">
                    {evaluateResult ? (
                      evaluateResult.isMatch ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-green-500 font-medium">
                            Matched
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="text-red-500 font-medium">
                            Not Matched
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
                    <Label>Messages</Label>
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
            Close
          </Button>
          <Button
            type="submit"
            form="evaluate-rule-form"
            disabled={isEvaluating || isLoadingFields}
          >
            {isEvaluating ? "Running..." : "Run"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
