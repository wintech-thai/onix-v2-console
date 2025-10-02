// src/types/DeepKeyOf.ts
export type DeepKeyOf<TObj extends object> = {
  [K in keyof TObj & (string)]: TObj[K] extends object
    ? `${K}` | `${K}.${DeepKeyOf<TObj[K]>}`
    : `${K}`;
}[keyof TObj & string];

import type Resources from "../../@types/resources";

export type TranslationKey = DeepKeyOf<Resources['common']>;

export function tk<T extends TranslationKey>(key: T): T {
  return key;
}

