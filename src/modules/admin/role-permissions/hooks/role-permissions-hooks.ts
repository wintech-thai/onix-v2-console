import { createQueryHook, createMutationHook } from "@/lib/hooks-factory";
import {
  getCustomRoles,
  getCustomRoleCount,
  addCustomRole,
  updateCustomRole,
  getInitialUserRolePermissions,
  getCustomRoleById,
  deleteCustomRoleById,
} from "../api/role-permissions.service";

export const useGetCustomRoles = createQueryHook(getCustomRoles);

export const useGetCustomRoleCount = createQueryHook(getCustomRoleCount);

export const useGetInitialCustomRole = createQueryHook(getInitialUserRolePermissions);

export const useGetCustomRoleById = createQueryHook(getCustomRoleById);

export const useAddCustomRole = createMutationHook(addCustomRole, {
  invalidates: [{ queryKey: getCustomRoles.key }],
});

export const useUpdateCustomRole = createMutationHook(updateCustomRole, {
  invalidates: [{ queryKey: getCustomRoles.key }, { queryKey: getCustomRoleById.key }],
});

export const useDeleteCustomRoleById = createMutationHook(deleteCustomRoleById);
