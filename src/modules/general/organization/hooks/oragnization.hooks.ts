import { createQueryHook } from "@/lib/hooks-factory";
import { getUserAllowedMenu } from "../api/organization.api";

export const useGetUserAllowedMenuQuery = createQueryHook(getUserAllowedMenu)
