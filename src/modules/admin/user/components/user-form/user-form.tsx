import { Controller, useForm } from "react-hook-form";
import { userSchema, UserSchemaType } from "../../schema/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  Check,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDown,
  Loader,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { InputTags } from "@/components/ui/input-tags";
import { fetchUserRoleApi, IUserRole } from "../../api/fetch-user-role.api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import { Hint } from "@/components/ui/hint";
import { useConfirm } from "@/hooks/use-confirm";
import { useFormNavigationBlocker } from "@/hooks/use-form-navigation-blocker";
import { useTranslation } from "react-i18next";
import { cn, errorMessageAsLangKey } from "@/lib/utils";
import { NoPermissionsPage } from "@/components/ui/no-permissions";
import { IRolePermissions } from "@/modules/admin/role-permissions/api/role-permissions.service";
import { useGetCustomRoles } from "@/modules/admin/role-permissions/hooks/role-permissions-hooks";
import { useDebounceValue } from "usehooks-ts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface UserFormProps {
  onSubmit: (values: UserSchemaType) => Promise<void>;
  initialValue: UserSchemaType;
  isUpdate: boolean;
}

export const UserForm = ({
  onSubmit,
  initialValue,
  isUpdate,
}: UserFormProps) => {
  const { t } = useTranslation("user");
  const params = useParams<{ orgId: string; userId: string }>();
  const router = useRouter();
  const form = useForm<UserSchemaType>({
    resolver: zodResolver(userSchema),
    defaultValues: initialValue,
  });
  const { setFormDirty } = useFormNavigationBlocker();

  const [ConfirmBack, confirmBack] = useConfirm({
    message: t("form.unsavedChanges"),
    title: t("form.leavePage"),
    variant: "destructive",
  });

  const { roles } = form.watch();
  const isSubmitting = form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;
  const errors = form.formState.errors;

  const [availableRoles, setAvailableRoles] = useState<IUserRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<IUserRole[]>([]);
  const [leftChecked, setLeftChecked] = useState<Set<string>>(new Set());
  const [rightChecked, setRightChecked] = useState<Set<string>>(new Set());

  const dateRange = useMemo(
    () => ({
      fromDate: dayjs().subtract(1, "day").toISOString(),
      toDate: dayjs().toISOString(),
    }),
    []
  ); // Empty dependency array means dates are calculated only once

  const userRole = fetchUserRoleApi.useQuery({
    orgId: params.orgId,
    values: {
      limit: 25,
      offset: 0,
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      fullTextSearch: "",
    },
  });

  const [customRoleSearch, setCustomRoleSearch] = useState("");
  const [debouncedCustomRoleSearch] = useDebounceValue(customRoleSearch, 500);
  const [customRoleOpen, setCustomRoleOpen] = useState(false);

  const customRoles = useGetCustomRoles(
    { orgId: params.orgId },
    {
      offset: 0,
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      limit: 100,
      fullTextSearch: debouncedCustomRoleSearch,
      level: "",
    }
  );

  // Sync form dirty state with navigation blocker
  useEffect(() => {
    setFormDirty(isDirty);
  }, [isDirty, setFormDirty]);

  // Initialize available and selected roles from API
  useEffect(() => {
    if (userRole.data?.data) {
      const allRoles = userRole.data.data;
      const formRoles = roles || [];

      // Separate roles into selected and available
      const selected: IUserRole[] = [];
      const available: IUserRole[] = [];

      allRoles.forEach((role) => {
        if (formRoles.includes(role.roleName)) {
          selected.push(role);
        } else {
          available.push(role);
        }
      });

      // Sort both arrays alphabetically by roleName
      selected.sort((a, b) => a.roleName.localeCompare(b.roleName));
      available.sort((a, b) => a.roleName.localeCompare(b.roleName));

      setSelectedRoles(selected);
      setAvailableRoles(available);
    }
  }, [userRole.data, roles]);

  if (userRole.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  if (userRole.isError) {
    if (userRole.error.response?.status === 403) {
      return <NoPermissionsPage apiName="GetRoles" />;
    }
    throw new Error(userRole.error.message);
  }

  const handleSubmit = async (values: UserSchemaType) => {
    if (!isDirty) {
      return router.back();
    }
    await onSubmit(values);

    form.reset();
    setFormDirty(false);
  };

  const handleCancel = async () => {
    if (!isDirty) {
      setFormDirty(false);
      return router.back();
    }

    const ok = await confirmBack();

    if (ok) {
      form.reset();
      form.clearErrors();
      setFormDirty(false);
      router.back();
    }
  };

  // Handle moving roles from left to right
  const handleMoveToSelected = () => {
    const rolesToMove = availableRoles.filter((role) =>
      leftChecked.has(role.roleName)
    );

    const newSelected = [...selectedRoles, ...rolesToMove].sort((a, b) =>
      a.roleName.localeCompare(b.roleName)
    );

    setSelectedRoles(newSelected);
    setAvailableRoles(
      availableRoles.filter((role) => !leftChecked.has(role.roleName))
    );

    // Update form roles
    const updatedRoles = newSelected.map((role) => role.roleName);
    form.setValue("roles", updatedRoles, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setLeftChecked(new Set());
  };

  // Handle moving roles from right to left
  const handleMoveToAvailable = () => {
    const rolesToMove = selectedRoles.filter((role) =>
      rightChecked.has(role.roleName)
    );

    const newAvailable = [...availableRoles, ...rolesToMove].sort((a, b) =>
      a.roleName.localeCompare(b.roleName)
    );

    setAvailableRoles(newAvailable);
    setSelectedRoles(
      selectedRoles.filter((role) => !rightChecked.has(role.roleName))
    );

    // Update form roles
    const updatedRoles = selectedRoles
      .filter((role) => !rightChecked.has(role.roleName))
      .map((role) => role.roleName);
    form.setValue("roles", updatedRoles, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setRightChecked(new Set());
  };

  // Handle checkbox toggle for left panel
  const handleLeftCheckboxChange = (roleId: string, checked: boolean) => {
    const newChecked = new Set(leftChecked);
    if (checked) {
      newChecked.add(roleId);
    } else {
      newChecked.delete(roleId);
    }
    setLeftChecked(newChecked);
  };

  // Handle checkbox toggle for right panel
  const handleRightCheckboxChange = (roleId: string, checked: boolean) => {
    const newChecked = new Set(rightChecked);
    if (checked) {
      newChecked.add(roleId);
    } else {
      newChecked.delete(roleId);
    }
    setRightChecked(newChecked);
  };

  // Handle select all for left panel
  const handleSelectAllLeft = (checked: boolean) => {
    if (checked) {
      setLeftChecked(new Set(availableRoles.map((role) => role.roleName)));
    } else {
      setLeftChecked(new Set());
    }
  };

  // Handle select all for right panel
  const handleSelectAllRight = (checked: boolean) => {
    if (checked) {
      setRightChecked(new Set(selectedRoles.map((role) => role.roleName)));
    } else {
      setRightChecked(new Set());
    }
  };

  // Handle custom role selection
  const handleCustomRoleSelect = (role: IRolePermissions) => {
    form.setValue("customRoleId", role.roleId, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("customRoleName", role.roleName, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("customRoleDesc", role.roleDescription, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setCustomRoleOpen(false);
  };

  // Handle custom role clear
  const handleCustomRoleClear = () => {
    form.setValue("customRoleId", null, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("customRoleName", null, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("customRoleDesc", null, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Handle custom role search
  const handleCustomRoleSearch = (value: string) => {
    setCustomRoleSearch(value);
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="h-full flex flex-col"
    >
      <ConfirmBack />

      <header className="p-4 border border-b">
        <h1 className="text-lg font-bold">
          <ArrowLeftIcon
            onClick={handleCancel}
            className="inline cursor-pointer"
          />{" "}
          {isUpdate ? t("form.updateTitle") : t("form.createTitle")}
        </h1>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="p-4 md:p-6 border rounded-lg">
          <header className="text-lg font-bold">
            {t("form.userInformation.title")}
          </header>
          <div className="grid md:grid-cols-2 gap-2 mt-4">
            <Controller
              control={form.control}
              name="userName"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.userInformation.userName")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.userName?.message,
                      t
                    )}
                    minLength={4}
                    maxLength={20}
                    disabled={isSubmitting || isUpdate}
                  />
                );
              }}
            />

            <Controller
              control={form.control}
              name="tmpUserEmail"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.userInformation.userEmail")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.tmpUserEmail?.message,
                      t
                    )}
                    maxLength={80}
                    disabled={isSubmitting || isUpdate}
                  />
                );
              }}
            />
            <Controller
              control={form.control}
              name="tags"
              render={({ field }) => (
                <InputTags
                  label={t("form.userInformation.tags")}
                  placeholder={t("form.userInformation.tagsPlaceholder")}
                  errorMessage={errorMessageAsLangKey(errors.tags?.message, t)}
                  maxLength={30}
                  disabled={isSubmitting}
                  isRequired
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    form.trigger("tags");
                  }}
                  onValidate={() => form.trigger("tags")}
                />
              )}
            />
          </div>

          <div className="mt-4 w-1/2">
            <Controller
              control={form.control}
              name="customRoleId"
              render={({ field }) => {
                const selectedCustomRole = customRoles.data?.data?.find(
                  (role: IRolePermissions) => role.roleId === field.value
                );

                return (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("form.customRole.selectRole")}
                    </label>
                    <div className="relative">
                      <Popover
                        open={customRoleOpen}
                        onOpenChange={setCustomRoleOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={customRoleOpen}
                            className="w-full justify-between"
                            disabled={isSubmitting}
                          >
                            <span
                              className={cn(
                                !selectedCustomRole && "text-muted-foreground"
                              )}
                            >
                              {selectedCustomRole
                                ? selectedCustomRole.roleName
                                : t("form.customRole.placeholder")}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder={t("form.customRole.search")}
                              onValueChange={handleCustomRoleSearch}
                            />
                            <CommandList>
                              {customRoles.isLoading ||
                              customRoles.isFetching ? (
                                <div className="flex items-center justify-center py-6">
                                  <Loader className="h-4 w-4 animate-spin" />
                                </div>
                              ) : (
                                <>
                                  <CommandEmpty>
                                    {t("form.customRole.noResults")}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {customRoles.data?.data?.map(
                                      (role: IRolePermissions) => (
                                        <CommandItem
                                          key={role.roleId}
                                          value={role.roleName}
                                          onSelect={() =>
                                            handleCustomRoleSelect(role)
                                          }
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === role.roleId
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          <div>
                                            <div className="font-medium">
                                              {role.roleName}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              {role.roleDescription}
                                            </div>
                                          </div>
                                        </CommandItem>
                                      )
                                    )}
                                  </CommandGroup>
                                </>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {selectedCustomRole && (
                        <button
                          type="button"
                          className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 hover:opacity-100 disabled:opacity-25"
                          disabled={isSubmitting}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCustomRoleClear();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* User Roles Section */}
        <div className="p-4 md:p-6 border rounded-lg">
          <header className="text-lg font-bold">
            {t("form.userRoles.title")}
          </header>

          <div className="flex flex-col lg:flex-row w-full gap-4 mt-4">
            {/* Left Panel - Available Roles */}
            <div className="w-full md:w-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          availableRoles.length > 0 &&
                          leftChecked.size === availableRoles.length
                        }
                        onCheckedChange={(checked) =>
                          handleSelectAllLeft(checked as boolean)
                        }
                        disabled={isSubmitting}
                      />
                    </TableHead>
                    <TableHead>{t("form.userRoles.availableRoles")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableRoles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-muted-foreground"
                      >
                        {t("form.userRoles.noAvailable")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    availableRoles.map((role) => (
                      <TableRow key={role.roleName}>
                        <TableCell>
                          <Checkbox
                            checked={leftChecked.has(role.roleName)}
                            onCheckedChange={(checked) =>
                              handleLeftCheckboxChange(
                                role.roleName,
                                checked as boolean
                              )
                            }
                            disabled={isSubmitting}
                          />
                        </TableCell>
                        <TableCell>
                          <Hint message={role.roleDefinition}>
                            <div>
                              <div className="font-medium">{role.roleName}</div>
                              <div className="text-sm text-muted-foreground">
                                {role.roleDescription}
                              </div>
                            </div>
                          </Hint>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Control Buttons */}
            <div className="flex lg:flex-col flex-row justify-center items-center gap-2">
              <Button
                size="icon"
                type="button"
                onClick={handleMoveToAvailable}
                disabled={rightChecked.size === 0 || isSubmitting}
                className="lg:rotate-0 rotate-90"
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                size="icon"
                type="button"
                onClick={handleMoveToSelected}
                disabled={leftChecked.size === 0 || isSubmitting}
                className="lg:rotate-0 rotate-90"
              >
                <ChevronRightIcon />
              </Button>
            </div>

            {/* Right Panel - Selected Roles */}
            <div className="flex-1 min-w-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedRoles.length > 0 &&
                          rightChecked.size === selectedRoles.length
                        }
                        onCheckedChange={(checked) =>
                          handleSelectAllRight(checked as boolean)
                        }
                        disabled={isSubmitting}
                      />
                    </TableHead>
                    <TableHead>{t("form.userRoles.selectedRoles")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRoles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-muted-foreground"
                      >
                        {t("form.userRoles.noSelected")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedRoles.map((role) => (
                      <TableRow key={role.roleName}>
                        <TableCell>
                          <Checkbox
                            checked={rightChecked.has(role.roleName)}
                            onCheckedChange={(checked) =>
                              handleRightCheckboxChange(
                                role.roleName,
                                checked as boolean
                              )
                            }
                            disabled={isSubmitting}
                          />
                        </TableCell>
                        <TableCell>
                          <Hint message={role.roleDefinition}>
                            <div>
                              <div className="font-medium">{role.roleName}</div>
                              <div className="text-sm text-muted-foreground">
                                {role.roleDescription}
                              </div>
                            </div>
                          </Hint>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {errors.roles?.message ? (
            <span className="text-sm text-destructive text-center inline-block w-full">
              {errorMessageAsLangKey(errors.roles.message, t)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="p-4 border-t flex justify-end gap-2">
        <Button
          type="button"
          variant="destructive"
          disabled={isSubmitting}
          onClick={handleCancel}
        >
          {t("form.actions.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {t("form.actions.save")}
        </Button>
      </footer>
    </form>
  );
};
