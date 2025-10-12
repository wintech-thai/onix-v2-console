import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { ProductSchemaType } from "../../schema/product.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinusIcon, PlusIcon } from "lucide-react";

export const ProductNarrativesForm = () => {
  const form = useFormContext<ProductSchemaType>();

  const narrative = useFieldArray({
    control: form.control,
    name: "narratives",
  });

  return (
         <div className="p-4 md:p-6 border rounded-lg">
            <header className="text-lg font-bold">Narratives</header>

            <div className="w-full md:w-1/2 mt-4">
              {narrative.fields.map((field, index) => (
                <div key={field.id} className="mb-2 w-full">
                  <Controller
                    control={form.control}
                    name={`narratives.${index}.text`}
                    render={({ field, fieldState }) => (
                      <div className="flex items-start w-full gap-x-4">
                        <Input
                          {...field}
                          label={`Narrative ${index + 1}`}
                          isRequired
                          className="w-full"
                          errorMessage={fieldState.error?.message}
                        />

                        <div className="mt-9 flex-shrink-0 flex gap-x-2">
                          <Button
                            type="button"
                            size="icon"
                            className="bg-primary text-white"
                            disabled={narrative.fields.length === 1}
                            onClick={() => narrative.remove(index)}
                          >
                            <MinusIcon />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            className="bg-primary text-white"
                            onClick={() => narrative.append({ text: "" })}
                          >
                            <PlusIcon />
                          </Button>
                        </div>
                      </div>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
  )
}
