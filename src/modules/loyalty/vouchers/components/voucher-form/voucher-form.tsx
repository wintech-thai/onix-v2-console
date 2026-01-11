"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VoucherSchemaType, voucherSchema } from "../../schema/vouchers.schema";
import { useTranslation } from "react-i18next";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, Search } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { useFormNavigationBlocker } from "@/hooks/use-form-navigation-blocker";
import { useEffect, useState, useMemo } from "react";
import { errorMessageAsLangKey } from "@/lib/utils";
import { useDebounceValue } from "usehooks-ts";
import {
  fetchCustomerApi,
  ICustomer,
} from "@/modules/general/customer/api/fetch-customer.api";
import {
  fetchPrivilegesApi,
  IPrivileges,
} from "@/modules/loyalty/privileges/api/fetch-privileges.api";
import { NoPermissionsPage } from "@/components/ui/no-permissions";
import dayjs from "dayjs";
import JsonView from "@uiw/react-json-view";
import { MuiDateTimePicker } from "@/components/ui/mui-date-time-picker";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQueryState } from "nuqs";

interface VoucherFormProps {
  onSubmit: (values: VoucherSchemaType) => Promise<void>;
  initialValue: VoucherSchemaType;
  isUpdate: boolean;
}

export const VoucherForm = ({
  onSubmit,
  initialValue,
  isUpdate,
}: VoucherFormProps) => {
  const { t } = useTranslation(["voucher", "common"]);
  const [privielgeId] = useQueryState("privilegeId");
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const form = useForm<VoucherSchemaType>({
    resolver: zodResolver(voucherSchema),
    defaultValues: initialValue,
  });
  const { setFormDirty } = useFormNavigationBlocker();

  const [ConfirmBack, confirmBack] = useConfirm({
    message: t("common:form.unsavedChanges"),
    title: t("common:form.leavePage"),
    variant: "destructive",
  });

  const isSubmitting = form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;
  const errors = form.formState.errors;

  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchValue, setCustomerSearchValue] = useState("");
  const [privilegeSearchOpen, setPrivilegeSearchOpen] = useState(false);
  const [privilegeSearchValue, setPrivilegeSearchValue] = useState("");

  // Debounce search values
  const [debouncedCustomerSearch] = useDebounceValue(customerSearchValue, 500);
  const [debouncedPrivilegeSearch] = useDebounceValue(
    privilegeSearchValue,
    500
  );

  const dateRange = useMemo(
    () => ({
      fromDate: dayjs().subtract(1, "day").toISOString(),
      toDate: dayjs().toISOString(),
    }),
    []
  ); // Empty dependency array means dates are calculated only once

  // Fetch customers
  const customerQuery = fetchCustomerApi.useFetchCustomer({
    orgId: params.orgId,
    params: {
      limit: 50,
      offset: 0,
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      fullTextSearch: isUpdate
        ? initialValue.customerId
        : debouncedCustomerSearch,
    },
  });

  // Fetch privileges
  const privilegeQuery = fetchPrivilegesApi.useFetchRedeemablePrivileges({
    orgId: params.orgId,
    params: {
      limit: 10,
      offset: 0,
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      privilegeId: privielgeId
        ? privielgeId
        : isUpdate
        ? initialValue.privilegeId
        : "",
      fullTextSearch: debouncedPrivilegeSearch,
      itemType: 0,
    },
  });

  // Sync form dirty state
  useEffect(() => {
    setFormDirty(isDirty);
  }, [isDirty, setFormDirty]);

  // Validate privilege when searching with privielgeId
  useEffect(() => {
    if (privielgeId && !privilegeQuery.isLoading && privilegeQuery.data?.data) {
      const privilege = privilegeQuery.data.data.find(
        (p) => p.id === privielgeId
      );

      if (!privilege) {
        // Set form error for privilegeId
        form.setError("privilegeId", {
          type: "manual",
          message: "form.validation.privilegeNotFound",
        });
      } else if (!form.getValues("privilegeName")) {
        // Clear any previous errors and auto-fill
        form.clearErrors("privilegeId");
        form.setValue("privilegeId", privilege.id, { shouldDirty: false });
        form.setValue("privilegeCode", privilege.code, { shouldDirty: false });
        form.setValue("privilegeName", privilege.description ?? null, {
          shouldDirty: false,
        });
        form.setValue("startDate", privilege.effectiveDate ?? null, {
          shouldDirty: false,
        });
        form.setValue("endDate", privilege.expireDate ?? null, {
          shouldDirty: false,
        });
        form.setValue("redeemPrice", privilege.pointRedeem || null, {
          shouldDirty: false,
        });
        form.setValue("voucherParams", privilege.content || "{}", {
          shouldDirty: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privielgeId, privilegeQuery.data, privilegeQuery.isLoading]);

  if (customerQuery.isError) {
    if (customerQuery.error.response?.status === 403) {
      return <NoPermissionsPage errors={customerQuery.error} />;
    }
    throw new Error(customerQuery.error.message);
  }

  if (privilegeQuery.isError) {
    if (privilegeQuery.error.response?.status === 403) {
      return <NoPermissionsPage errors={privilegeQuery.error} />;
    }
    throw new Error(privilegeQuery.error.message);
  }

  const handleSubmit = async (values: VoucherSchemaType) => {
    if (!isDirty && isUpdate) {
      return router.back();
    }
    await onSubmit(values);
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

  const handleCustomerSelect = (customer: ICustomer) => {
    form.setValue("customerId", customer.id, { shouldDirty: true });
    form.setValue("customerCode", customer.code, { shouldDirty: true });
    form.setValue("customerName", customer.name, { shouldDirty: true });
    form.setValue("customerEmail", customer.primaryEmail, {
      shouldDirty: true,
    });
    setCustomerSearchOpen(false);
  };

  const handlePrivilegeSelect = (privilege: IPrivileges) => {
    form.setValue("privilegeId", privilege.id, { shouldDirty: true });
    form.setValue("privilegeCode", privilege.code, { shouldDirty: true });
    form.setValue("privilegeName", privilege.description, {
      shouldDirty: true,
    });
    form.setValue("startDate", privilege.effectiveDate, { shouldDirty: true });
    form.setValue("endDate", privilege.expireDate, { shouldDirty: true });
    form.setValue("redeemPrice", privilege.pointRedeem || 0, {
      shouldDirty: true,
    });
    form.setValue("voucherParams", privilege.content || "{}", {
      shouldDirty: true,
    });
    setPrivilegeSearchOpen(false);
  };

  const customers = customerQuery.data?.data || [];
  const privileges = privilegeQuery.data?.data || [];
  const selectedCustomerName = form.watch("customerName");
  const selectedPrivilegeName = form.watch("privilegeName");
  const voucherParams = form.watch("voucherParams");

  // Check if search is loading (debounced value doesn't match input value)
  const isCustomerSearching =
    customerSearchValue !== debouncedCustomerSearch || customerQuery.isLoading;
  const isPrivilegeSearching =
    privilegeSearchValue !== debouncedPrivilegeSearch ||
    privilegeQuery.isLoading;

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
          {isUpdate ? t("form.viewTitle") : t("form.createTitle")}
        </h1>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Main Form Section */}
        <div className="p-4 md:p-6 border rounded-lg space-y-6">
          {/* Customer Section */}
          <div>
            <header className="text-lg font-bold mb-4">
              {t("form.customer.title")}
            </header>
            {isUpdate ? (
              <Input
                label={t("form.customer.customerName")}
                value={selectedCustomerName ?? "-"}
                disabled
              />
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("form.customer.selectCustomer")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Popover
                  open={customerSearchOpen}
                  onOpenChange={setCustomerSearchOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      disabled={isSubmitting}
                    >
                      {selectedCustomerName ||
                        t("form.customer.searchPlaceholder")}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[400px] p-0">
                    <Command>
                      <CommandInput
                        placeholder={t("form.customer.searchPlaceholder")}
                        value={customerSearchValue}
                        onValueChange={setCustomerSearchValue}
                      />
                      <CommandList>
                        {isCustomerSearching ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            {t("common:common.loading")}
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>
                              {t("common:common.noResults")}
                            </CommandEmpty>
                            <CommandGroup>
                              {customers.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={customer.id}
                                  keywords={[
                                    customer.name,
                                    customer.code,
                                    customer.primaryEmail,
                                  ]}
                                  onSelect={() =>
                                    handleCustomerSelect(customer)
                                  }
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {customer.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {customer.code} • {customer.primaryEmail}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.customerId && (
                  <span className="text-sm text-destructive">
                    {errorMessageAsLangKey(errors.customerId.message, t)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Privilege Section */}
          <div>
            <header className="text-lg font-bold mb-4">
              {t("form.privilege.title")}
            </header>
            {isUpdate ? (
              <Input
                label={t("form.privilege.privilegeName")}
                value={selectedPrivilegeName ?? "-"}
                disabled
              />
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("form.privilege.selectPrivilege")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Popover
                  open={privilegeSearchOpen}
                  onOpenChange={setPrivilegeSearchOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      disabled={isSubmitting || Boolean(privielgeId)}
                    >
                      {selectedPrivilegeName ||
                        t("form.privilege.searchPlaceholder")}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[400px] p-0">
                    <Command>
                      <CommandInput
                        placeholder={t("form.privilege.searchPlaceholder")}
                        value={privilegeSearchValue}
                        onValueChange={setPrivilegeSearchValue}
                      />
                      <CommandList>
                        {isPrivilegeSearching ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            {t("common:common.loading")}
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>
                              {t("common:common.noResults")}
                            </CommandEmpty>
                            <CommandGroup>
                              {privileges.map((privilege) => (
                                <CommandItem
                                  key={privilege.id}
                                  value={privilege.id}
                                  keywords={[
                                    privilege.code,
                                    privilege.description,
                                  ]}
                                  onSelect={() =>
                                    handlePrivilegeSelect(privilege)
                                  }
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {privilege.description}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {privilege.code} • {privilege.pointRedeem}{" "}
                                      points
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.privilegeId && (
                  <span className="text-sm text-destructive">
                    {errorMessageAsLangKey(errors.privilegeId.message, t)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Start Date and End Date Section - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <MuiDateTimePicker
                  label={t("form.dates.startDate")}
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date?.toISOString() || null)
                  }
                  type="date"
                  disabled
                  errorMessage={errors.startDate?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <MuiDateTimePicker
                  label={t("form.dates.endDate")}
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date?.toISOString() || null)
                  }
                  type="date"
                  disabled
                  errorMessage={errors.endDate?.message}
                />
              )}
            />
          </div>

          {/* Redeem Point Section */}
          <div>
            <Controller
              control={form.control}
              name="redeemPrice"
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  label={t("form.privilege.redeemPoints")}
                  disabled
                  value={field.value?.toString() || ""}
                />
              )}
            />
          </div>
        </div>

        {/* Voucher Parameters Section */}
        {voucherParams && (
          <div className="p-4 md:p-6 border rounded-lg">
            <header className="text-lg font-bold">
              {t("form.params.title")}
            </header>
            <div className="mt-4 min-h-[300px]">
              <JsonView
                value={JSON.parse(voucherParams || "{}")}
                displayDataTypes={false}
                style={{
                  backgroundColor: "hsl(var(--muted))",
                  borderRadius: "0.375rem",
                  padding: "1rem",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {!isUpdate && (
        <footer className="p-4 border-t flex justify-end gap-2">
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            onClick={handleCancel}
          >
            {t("common:form.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {t("form.actions.save")}
          </Button>
        </footer>
      )}
    </form>
  );
};
