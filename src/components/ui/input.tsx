import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

function Input({
  className,
  type,
  label,
  errorMessage,
  helperText,
  isRequired,
  ...props
}: React.ComponentProps<"input"> & {
  isRequired?: boolean;
  label?: string;
  errorMessage?: string;
  helperText?: string;
}) {
  const id = React.useId();

  return (
    <div className="*:not-first:mt-2 w-full">
      {label && (
        <Label isRequired={isRequired} htmlFor={id}>
          {label}
        </Label>
      )}

      <input
        id={id}
        type={type}
        data-slot="input"
        className={cn(
          "peer file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-12 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          errorMessage && "border-destructive",
          className
        )}
        onWheel={(e) => {
          if (type === "number") e.currentTarget.blur();
        }}
        {...props}
      />

      {errorMessage && (
        <p
          className="peer-aria-invalid:text-destructive mt-2 text-xs text-destructive"
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </p>
      )}

      {helperText && !errorMessage && (
        <p
          className="peer-aria-invalid:text-destructive mt-2 text-xs"
          role="alert"
          aria-live="polite"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

export { Input };
