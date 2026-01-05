import { createQueryHook } from "@/lib/hooks-factory";
import {
    getCustomRoles,
    getCustomRoleCount,
} from "../api/role-permissions.service";

export const useGetCustomRoles = createQueryHook(getCustomRoles);

export const useGetCustomRoleCount = createQueryHook(getCustomRoleCount);
