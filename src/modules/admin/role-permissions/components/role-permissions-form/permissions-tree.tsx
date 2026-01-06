"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { IUserRolePermissions } from "../../api/role-permissions.service";
import type { CheckedState } from "@radix-ui/react-checkbox";

interface PermissionsTreeProps {
  permissions: IUserRolePermissions[];
  onChange: (permissions: IUserRolePermissions[]) => void;
  searchQuery: string;
  disabled?: boolean;
}

export const PermissionsTree = ({
  permissions,
  onChange,
  searchQuery,
  disabled = false,
}: PermissionsTreeProps) => {
  // Filter permissions based on search query
  const filteredPermissions = permissions
    .map((controller) => {
      if (!searchQuery) return controller;

      const matchesController = controller.controllerName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const filteredApis = controller.apiPermissions.filter((api) =>
        api.apiName.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (matchesController || filteredApis.length > 0) {
        return {
          ...controller,
          apiPermissions: matchesController
            ? controller.apiPermissions
            : filteredApis,
        };
      }

      return null;
    })
    .filter((c) => c !== null) as IUserRolePermissions[];

  const handleControllerChange = (
    controllerIndex: number,
    checked: CheckedState
  ) => {
    const newPermissions = [...permissions];
    newPermissions[controllerIndex] = {
      ...newPermissions[controllerIndex],
      apiPermissions: newPermissions[controllerIndex].apiPermissions.map(
        (api) => ({
          ...api,
          isAllowed: checked === true,
        })
      ),
    };
    onChange(newPermissions);
  };

  const handleApiChange = (
    controllerIndex: number,
    apiIndex: number,
    checked: CheckedState
  ) => {
    const newPermissions = [...permissions];
    const updatedApis = [...newPermissions[controllerIndex].apiPermissions];
    updatedApis[apiIndex] = {
      ...updatedApis[apiIndex],
      isAllowed: checked === true,
    };
    newPermissions[controllerIndex] = {
      ...newPermissions[controllerIndex],
      apiPermissions: updatedApis,
    };
    onChange(newPermissions);
  };

  const getControllerCheckState = (
    controller: IUserRolePermissions
  ): CheckedState => {
    const allowedCount = controller.apiPermissions.filter(
      (api) => api.isAllowed
    ).length;
    const totalCount = controller.apiPermissions.length;

    if (allowedCount === 0) return false;
    if (allowedCount === totalCount) return true;
    return "indeterminate";
  };

  if (filteredPermissions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">No permissions found</div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto border rounded-lg p-4 relative">
      {filteredPermissions.map((controller, filteredIndex) => {
        // Find the original index in the permissions array
        const originalIndex = permissions.findIndex(
          (p) => p.controllerName === controller.controllerName
        );
        const checkState = getControllerCheckState(controller);

        return (
          <div
            key={`controller-${controller.controllerName}-${filteredIndex}`}
            className="space-y-2"
          >
            {/* Controller Checkbox with Name */}
            <div className="flex items-center gap-2">
              <Checkbox
                id={`controller-${controller.controllerName}-${filteredIndex}`}
                checked={checkState}
                onCheckedChange={(checked) =>
                  handleControllerChange(originalIndex, checked)
                }
                disabled={disabled}
              />
              <label
                className="cursor-pointer"
                htmlFor={`controller-${controller.controllerName}-${filteredIndex}`}
              >
                <span className="font-semibold text-base">
                  {controller.controllerName}
                </span>
              </label>
            </div>

            {/* API List - Always Visible, Indented */}
            <div className="ml-8 space-y-2">
              {controller.apiPermissions.map((api, apiFilteredIndex) => {
                // Find the original API index
                const originalApiIndex = permissions[
                  originalIndex
                ].apiPermissions.findIndex(
                  (a) =>
                    a.apiName === api.apiName &&
                    a.controllerName === api.controllerName
                );

                return (
                  <div
                    key={`api-${controller.controllerName}-${api.apiName}-${apiFilteredIndex}`}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      id={`api-${controller.controllerName}-${api.apiName}-${apiFilteredIndex}`}
                      checked={api.isAllowed}
                      onCheckedChange={(checked) =>
                        handleApiChange(
                          originalIndex,
                          originalApiIndex,
                          checked
                        )
                      }
                      disabled={disabled}
                    />
                    <label
                      className="cursor-pointer"
                      htmlFor={`api-${controller.controllerName}-${api.apiName}-${apiFilteredIndex}`}
                    >
                      <span className="text-sm">{api.apiName}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
