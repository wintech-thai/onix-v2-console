"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Label({
  className,
  isRequired,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { isRequired?: boolean }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-foreground text-sm leading-4 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        isRequired && "after:content-['*'] after:ml-1 after:text-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Label }
