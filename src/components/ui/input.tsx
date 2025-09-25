import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

function Input({
  className,
  type,
  label,
  error,
  helperText,
  ...props
}: React.ComponentProps<"input"> & {
  label: string;
  error?: string;
  helperText?: string;
}) {
  const id = React.useId();

  return (
    <div className="*:not-first:mt-2">

      {label && <Label htmlFor={id}>{label}</Label>}

      <input
        id={id}
        type={type}
        data-slot="input"
        className={cn(
          "peer file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-12 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />

      {error && (
        <p
          className="peer-aria-invalid:text-destructive mt-2 text-xs"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {helperText && !error && (
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
