/* eslint-disable  @typescript-eslint/no-explicit-any */

import { clsx, type ClassValue } from "clsx";
import { TFunction } from "i18next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function errorMessageAsLangKey(message: string | undefined, t: TFunction<"common", undefined>): string | undefined {
  if (!message) return undefined;

  return t(message as any);
}
