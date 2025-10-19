/* eslint-disable  @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function errorMessageAsLangKey(message: string | undefined, t: any): string | undefined {
  if (!message) return undefined;

  return t(message as any);
}
