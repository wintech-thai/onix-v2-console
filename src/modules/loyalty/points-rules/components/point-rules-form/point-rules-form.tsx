import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  pointRulesSchema,
  PointRulesSchemaType,
} from "../../schema/point-rules.schema";
import { ArrowLeftIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, KeyboardEvent, useEffect } from "react";
import { RuleInputFieldsModal } from "./rule-input-fields-modal";
import { TestRuleModal } from "./test-rule-modal";
import { useRouter } from "next/navigation";
import { JsonEditor } from "json-edit-react";
import dayjs from "dayjs";
import { useConfirm } from "@/hooks/use-confirm";
import { useFormNavigationBlocker } from "@/hooks/use-form-navigation-blocker";
import { Label } from "@/components/ui/label";

interface PointRulesFormProps {
  onSubmit: (values: PointRulesSchemaType) => Promise<void>;
  defaultValues?: PointRulesSchemaType;
  isUpdate: boolean;
}

export const PointRulesForm = ({
  onSubmit,
  defaultValues,
  isUpdate,
}: PointRulesFormProps) => {
  const router = useRouter();
  const [isFieldsModalOpen, setIsFieldsModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const { setFormDirty } = useFormNavigationBlocker();
  const [ConfirmBack, confirmBack] = useConfirm({
    message: "You have unsaved changes. Are you sure you want to leave?",
    title: "Unsaved Changes",
    variant: "destructive",
  });

  // Default triggeredEvent to "CustomerRegistered" if not provided
  const initialValues = {
    ...defaultValues,
    triggeredEvent: defaultValues?.triggeredEvent || "CustomerRegistered",
    priority: defaultValues?.priority ?? 0,
    startDate: defaultValues?.startDate
      ? dayjs(defaultValues.startDate).format("YYYY-MM-DDTHH:mm")
      : "",
    endDate: defaultValues?.endDate
      ? dayjs(defaultValues.endDate).format("YYYY-MM-DDTHH:mm")
      : "",
  };

  console.log({ initialValues });

  const form = useForm<PointRulesSchemaType>({
    defaultValues: initialValues,
    resolver: zodResolver(pointRulesSchema),
  });

  const errors = form.formState.errors;
  const isSubmitting = form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;
  const triggeredEvent = form.watch("triggeredEvent");
  const ruleDefinition = form.watch("ruleDefinition");
  const { tags } = form.watch();
  const [tagInput, setTagInput] = useState("");

  const tagsArray = tags
    ? tags.split(",").filter((tag) => tag.trim() !== "")
    : [];

  useEffect(() => {
    setFormDirty(isDirty);
  }, [isDirty, setFormDirty]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedTag = tagInput.trim();

      if (trimmedTag && !tagsArray.includes(trimmedTag)) {
        const newTags = [...tagsArray, trimmedTag];
        form.setValue("tags", newTags.join(","), {
          shouldDirty: true,
          shouldValidate: true,
        });
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tagsArray.filter((tag) => tag !== tagToRemove);
    form.setValue("tags", newTags.join(","), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmitHandler = async (values: PointRulesSchemaType) => {
    if (!isDirty) {
      return router.back();
    }
    const payload = {
      ...values,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
    };
    await onSubmit(payload);
    setFormDirty(false);
  };

  const handleCancel = async () => {
    if (!isDirty) {
      setFormDirty(false);
      return router.back();
    }

    const ok = await confirmBack();

    if (ok) {
      form.reset();
      setFormDirty(false);
      router.back();
    }
  };

  return (
    <FormProvider {...form}>
      <form
        className="h-full flex flex-col"
        onSubmit={form.handleSubmit(onSubmitHandler)}
      >
        <ConfirmBack />
        <header className="p-4 border-b flex items-center gap-2">
          <ArrowLeftIcon
            onClick={handleCancel}
            className="cursor-pointer h-5 w-5"
          />
          <h1 className="text-lg font-bold">
            {isUpdate ? "Update Point Rules" : "Create Point Rules"}
          </h1>
        </header>

        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="ruleName"
              render={({ field }) => (
                <Input
                  {...field}
                  label="Name"
                  isRequired
                  disabled={isSubmitting}
                  errorMessage={errors.ruleName?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="triggeredEvent"
              render={({ field }) => (
                <Input
                  {...field}
                  label="Triggered Event"
                  isRequired
                  disabled={true}
                  errorMessage={errors.triggeredEvent?.message}
                />
              )}
            />

            <div className="col-span-2">
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Input
                    {...field}
                    isRequired
                    label="Description"
                    disabled={isSubmitting}
                    errorMessage={errors.description?.message}
                  />
                )}
              />
            </div>

            <div className="col-span-2">
              <Label isRequired>Tags</Label>
              <div className="mt-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type and press Enter to add tag"
                  errorMessage={errors.tags?.message}
                  disabled={isSubmitting}
                />
              </div>
              {tagsArray.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tagsArray.map((tag, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-2 md:col-span-1">
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    value={
                      isNaN(field.value) || field.value === 0 ? "" : field.value
                    }
                    onChange={(e) => {
                      if (e.target.value === "") {
                        field.onChange(0);
                      } else {
                        field.onChange(Number(e.target.value));
                      }
                    }}
                    label="Priority (1-100)"
                    min={1}
                    max={100}
                    isRequired
                    disabled={isSubmitting}
                    errorMessage={errors.priority?.message}
                  />
                )}
              />
            </div>

            <div className="col-span-2 grid md:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <div className="flex flex-col gap-1 relative">
                    <Input
                      readOnly
                      label="Start Date"
                      isRequired
                      value={
                        field.value
                          ? dayjs(field.value).format(
                              "DD MMM YYYY HH:mm [GMT] Z"
                            )
                          : ""
                      }
                      disabled={isSubmitting}
                      errorMessage={errors.startDate?.message}
                    />
                    <input
                      {...field}
                      type="datetime-local"
                      className="absolute inset-0 w-full h-full z-10 opacity-0"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <div className="flex flex-col gap-1 relative">
                    <Input
                      readOnly
                      label="End Date"
                      isRequired
                      value={
                        field.value
                          ? dayjs(field.value).format(
                              "DD MMM YYYY HH:mm [GMT] Z"
                            )
                          : ""
                      }
                      disabled={isSubmitting}
                      errorMessage={errors.endDate?.message}
                      onChange={() => {}}
                    />
                    <input
                      {...field}
                      type="datetime-local"
                      className="absolute inset-0 w-full h-full z-10 opacity-0"
                      disabled={isSubmitting}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </div>
                )}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Rule Definition (JSON)
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFieldsModalOpen(true)}
                >
                  Input Fields
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTestModalOpen(true)}
                >
                  Test
                </Button>
              </div>
            </div>

            <Controller
              control={form.control}
              name="ruleDefinition"
              render={({ field }) => {
                let jsonValue = {};
                try {
                  jsonValue = field.value ? JSON.parse(field.value) : {};
                } catch {
                  // If parse fails, default to empty object or handle gracefully
                }

                return (
                  <div className="border rounded-md overflow-hidden w-full">
                    <JsonEditor
                      data={jsonValue}
                      setData={(newData: unknown) => {
                        field.onChange(JSON.stringify(newData, null, 2));
                      }}
                      minWidth="100%"
                    />
                  </div>
                );
              }}
            />
            {errors.ruleDefinition && (
              <span className="text-xs text-red-500">
                {errors.ruleDefinition.message}
              </span>
            )}
          </div>
        </div>

        <div className="border-t py-4 px-4 shrink-0 flex items-center justify-end gap-x-2">
          <Button
            onClick={handleCancel}
            disabled={isSubmitting}
            variant="destructive"
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit" isPending={isSubmitting}>
            Save
          </Button>
        </div>
      </form>

      <RuleInputFieldsModal
        isOpen={isFieldsModalOpen}
        onClose={() => setIsFieldsModalOpen(false)}
        triggeredEvent={triggeredEvent}
      />

      <TestRuleModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        ruleDefinition={ruleDefinition}
      />
    </FormProvider>
  );
};
