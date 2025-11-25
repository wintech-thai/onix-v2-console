import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  pointRulesSchema,
  PointRulesSchemaType,
} from "../../schema/point-rules.schema";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const form = useForm<PointRulesSchemaType>({
    defaultValues,
    resolver: zodResolver(pointRulesSchema),
  });

  const errors = form.formState.errors;
  const isSubmitting = form.formState.isSubmitting;

  const onSubmitHandler = async (values: PointRulesSchemaType) => {
    await onSubmit(values);
  };

  console.log(isUpdate);

  return (
    <FormProvider {...form}>
      <form
        className="h-full flex flex-col"
        onSubmit={form.handleSubmit(onSubmitHandler)}
      >
        <header className="p-4 border border-b">
          <h1 className="text-lg font-bold">
            <ArrowLeftIcon
              // onClick={handleCancel}
              className="inline cursor-pointer"
            />{" "}
            {isUpdate ? "Update Point Rules" : "Create Point Rules"}
          </h1>
        </header>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="ruleName"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label="Rule Name"
                    isRequired
                    disabled={isSubmitting}
                    errorMessage={errors.ruleName?.message}
                  />
                );
              }}
            />

            <Controller
              control={form.control}
              name="triggeredEvent"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label="Triggered Event"
                    isRequired
                    disabled={isSubmitting}
                    errorMessage={errors.triggeredEvent?.message}
                  />
                );
              }}
            />

            <div className="col-span-2">
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => {
                  return (
                    <Input
                      {...field}
                      label="Description"
                      isRequired
                      disabled={isSubmitting}
                      errorMessage={errors.description?.message}
                    />
                  );
                }}
              />
            </div>

            <div className="col-span-2">
              <Controller
                control={form.control}
                name="tags"
                render={({ field }) => {
                  return (
                    <Input
                      {...field}
                      label="Tags"
                      isRequired
                      disabled={isSubmitting}
                      errorMessage={errors.tags?.message}
                    />
                  );
                }}
              />
            </div>

            <div className="col-span-2 w-[200px]">
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => {
                  return (
                    <Input
                      {...field}
                      label="Priority"
                      type="number"
                      isRequired
                      disabled={isSubmitting}
                      errorMessage={errors.priority?.message}
                      className=""
                    />
                  );
                }}
              />
            </div>

            <Controller
              control={form.control}
              name="startDate"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label="Start Date"
                    isRequired
                    disabled={isSubmitting}
                    errorMessage={errors.startDate?.message}
                  />
                );
              }}
            />

            <Controller
              control={form.control}
              name="endDate"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label="End Date"
                    isRequired
                    disabled={isSubmitting}
                    errorMessage={errors.endDate?.message}
                  />
                );
              }}
            />
          </div>

          <div className="border rounded-lg">Json Data Text</div>
        </div>

        <div className="border-t py-2 px-4 shrink-0 flex items-center justify-end gap-x-2">
          <Button
            // onClick={handleCancel}
            // disabled={isSubmitting}
            variant="destructive"
            type="button"
          >
            {/* {t("actions.cancel")} */}
            cancel
          </Button>
          <Button isPending={false}>
            {/* {t("actions.save")} */}
            save
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
