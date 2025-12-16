import { Controller, useForm } from "react-hook-form";
import { userSchema, UserSchemaType } from "../../schema/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader,
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
import { errorMessageAsLangKey } from "@/lib/utils";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

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
      return <NoPermissionsPage apiName="GetRoles" />
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
          </div>

          <div className="mt-4">
            <Controller
              control={form.control}
              name="tags"
              render={({ field }) => (
                <InputTags
                  label={t("form.userInformation.tags")}
                  placeholder={t("form.userInformation.tagsPlaceholder")}
                  errorMessage={errorMessageAsLangKey(
                    errors.tags?.message,
                    t
                  )}
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
