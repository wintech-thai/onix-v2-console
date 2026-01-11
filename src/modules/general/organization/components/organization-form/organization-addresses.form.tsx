"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrganizationSchemaType } from "../../schema/organization.schema";
import { useParams } from "next/navigation";
import { NoPermissionsPage } from "@/components/ui/no-permissions";
import { getAllowAddressTypeNamesApi } from "../../api/get-allow-address-type-names.api";

type AddressItem = {
  name: string;
  value: string;
};

interface OrganizationAddressesFormProps {
  isViewMode: boolean;
}

export const OrganizationAddressesForm = ({
  isViewMode,
}: OrganizationAddressesFormProps) => {
  const { t } = useTranslation("organization");
  const params = useParams<{ orgId: string }>();
  const form = useFormContext<OrganizationSchemaType>();
  const isSubmitting = form.formState.isSubmitting;

  const { addresses } = form.watch();

  const [availableAddresses, setAvailableAddresses] = useState<AddressItem[]>(
    []
  );
  const [selectedAddresses, setSelectedAddresses] = useState<AddressItem[]>([]);
  const [leftChecked, setLeftChecked] = useState<Set<string>>(new Set());
  const [rightChecked, setRightChecked] = useState<Set<string>>(new Set());

  const fetchAddressTypesQuery =
    getAllowAddressTypeNamesApi.useGetAllowAddressTypesName(params);

  // Initialize available and selected addresses from API
  useEffect(() => {
    if (fetchAddressTypesQuery.data?.data) {
      const allAddresses = fetchAddressTypesQuery.data.data;
      const formAddresses = addresses || {};

      const selected: AddressItem[] = [];
      const available: AddressItem[] = [];

      allAddresses.forEach((addr) => {
        if (
          formAddresses[addr.name] !== undefined &&
          formAddresses[addr.name] !== null &&
          formAddresses[addr.name] !== ""
        ) {
          selected.push(addr);
        } else {
          available.push(addr);
        }
      });

      selected.sort((a, b) => a.name.localeCompare(b.name));
      available.sort((a, b) => a.name.localeCompare(b.name));

      setSelectedAddresses(selected);
      setAvailableAddresses(available);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAddressTypesQuery.data]);

  const handleMoveToSelected = () => {
    const addressesToMove = availableAddresses.filter((addr) =>
      leftChecked.has(addr.name)
    );

    const newSelected = [...selectedAddresses, ...addressesToMove].sort(
      (a, b) => a.name.localeCompare(b.name)
    );

    setSelectedAddresses(newSelected);
    setAvailableAddresses(
      availableAddresses.filter((addr) => !leftChecked.has(addr.name))
    );
    setLeftChecked(new Set());
  };

  const handleMoveToAvailable = () => {
    const addressesToMove = selectedAddresses.filter((addr) =>
      rightChecked.has(addr.name)
    );

    const resetAddresses = addressesToMove.map((addr) => ({
      ...addr,
      value:
        fetchAddressTypesQuery.data?.data.find(
          (a: AddressItem) => a.name === addr.name
        )?.value || "",
    }));

    const newAvailable = [...availableAddresses, ...resetAddresses].sort(
      (a, b) => a.name.localeCompare(b.name)
    );

    setAvailableAddresses(newAvailable);
    setSelectedAddresses(
      selectedAddresses.filter((addr) => !rightChecked.has(addr.name))
    );

    const updatedAddresses = { ...addresses };
    addressesToMove.forEach((addr) => {
      delete updatedAddresses[addr.name];
    });
    form.setValue("addresses", updatedAddresses, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setRightChecked(new Set());
  };

  const handleLeftCheckboxChange = (name: string, checked: boolean) => {
    const newChecked = new Set(leftChecked);
    if (checked) {
      newChecked.add(name);
    } else {
      newChecked.delete(name);
    }
    setLeftChecked(newChecked);
  };

  const handleRightCheckboxChange = (name: string, checked: boolean) => {
    const newChecked = new Set(rightChecked);
    if (checked) {
      newChecked.add(name);
    } else {
      newChecked.delete(name);
    }
    setRightChecked(newChecked);
  };

  const handleAddressValueChange = (name: string, value: string) => {
    const updatedAddresses = { ...addresses };
    updatedAddresses[name] = value || null;
    form.setValue("addresses", updatedAddresses, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSelectAllLeft = (checked: boolean) => {
    if (checked) {
      setLeftChecked(new Set(availableAddresses.map((addr) => addr.name)));
    } else {
      setLeftChecked(new Set());
    }
  };

  const handleSelectAllRight = (checked: boolean) => {
    if (checked) {
      setRightChecked(new Set(selectedAddresses.map((addr) => addr.name)));
    } else {
      setRightChecked(new Set());
    }
  };

  if (fetchAddressTypesQuery.isLoading) {
    return (
      <div className="p-4 md:p-6 border rounded-lg">
        <header className="text-lg font-bold">{t("addresses.title")}</header>
        <div className="mt-4 text-center text-muted-foreground">
          {t("addresses.loading")}
        </div>
      </div>
    );
  }

  if (fetchAddressTypesQuery.isError) {
    if (fetchAddressTypesQuery.error.response?.status === 403) {
      return <NoPermissionsPage errors={fetchAddressTypesQuery.error} />;
    }

    throw new Error(fetchAddressTypesQuery.error.message);
  }

  return (
    <div className="p-4 md:p-6 border rounded-lg">
      <header className="text-lg font-bold">{t("addresses.title")}</header>

      <div className="flex flex-col lg:flex-row w-full gap-4 mt-4">
        {/* Left Panel - Available Addresses */}
        <div className="w-full md:w-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      availableAddresses.length > 0 &&
                      leftChecked.size === availableAddresses.length
                    }
                    onCheckedChange={(checked) =>
                      handleSelectAllLeft(checked as boolean)
                    }
                    disabled={isViewMode || isSubmitting}
                  />
                </TableHead>
                <TableHead>{t("addresses.available")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableAddresses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground"
                  >
                    {t("addresses.noAvailable")}
                  </TableCell>
                </TableRow>
              ) : (
                availableAddresses.map((addr) => (
                  <TableRow key={addr.name}>
                    <TableCell>
                      <Checkbox
                        checked={leftChecked.has(addr.name)}
                        onCheckedChange={(checked) =>
                          handleLeftCheckboxChange(
                            addr.name,
                            checked as boolean
                          )
                        }
                        disabled={isViewMode || isSubmitting}
                      />
                    </TableCell>
                    <TableCell>{addr.name}</TableCell>
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
            disabled={rightChecked.size === 0 || isViewMode || isSubmitting}
            className="lg:rotate-0 rotate-90"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            size="icon"
            type="button"
            onClick={handleMoveToSelected}
            disabled={leftChecked.size === 0 || isViewMode || isSubmitting}
            className="lg:rotate-0 rotate-90"
          >
            <ChevronRightIcon />
          </Button>
        </div>

        {/* Right Panel - Selected Addresses */}
        <div className="flex-1 min-w-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedAddresses.length > 0 &&
                      rightChecked.size === selectedAddresses.length
                    }
                    onCheckedChange={(checked) =>
                      handleSelectAllRight(checked as boolean)
                    }
                    disabled={isViewMode || isSubmitting}
                  />
                </TableHead>
                <TableHead>{t("addresses.addressType")}</TableHead>
                <TableHead>{t("addresses.value")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedAddresses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    {t("addresses.noSelected")}
                  </TableCell>
                </TableRow>
              ) : (
                selectedAddresses.map((addr) => (
                  <TableRow key={addr.name}>
                    <TableCell>
                      <Checkbox
                        checked={rightChecked.has(addr.name)}
                        onCheckedChange={(checked) =>
                          handleRightCheckboxChange(
                            addr.name,
                            checked as boolean
                          )
                        }
                        disabled={isViewMode || isSubmitting}
                      />
                    </TableCell>
                    <TableCell>{addr.name}</TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        placeholder={addr.value}
                        value={addresses?.[addr.name] ?? ""}
                        onChange={(e) =>
                          handleAddressValueChange(addr.name, e.target.value)
                        }
                        required
                        isRequired
                        disabled={isViewMode || isSubmitting}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
