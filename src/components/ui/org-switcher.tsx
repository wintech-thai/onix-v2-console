/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";

import { CheckIcon, ChevronsUpDownIcon, BuildingIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

interface OrgSwitcherProps {
  withFull?: boolean;
  className?: string;
  onOrgChange?: (orgId: string) => void;
}

export function OrgSwitcher({
  className,
  withFull,
  onOrgChange,
}: OrgSwitcherProps) {
  const params = useParams();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(params.orgId);

  const organization = useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const r = await api.get(
        "/api/OnlyUser/org/temp/action/GetUserAllowedOrg"
      );
      return r.data;
    },
  });

  const org = organization.data ?? [];
  const selectedOrg = org.find((o: any) => o.orgCustomId === value);

  const handleSelect = (currentValue: string) => {
    setValue(currentValue);
    setOpen(false);
    onOrgChange?.(currentValue);
  };

  // Loading State
  if (organization.isLoading) {
    return (
      <div
        className={cn(
          "w-[200px]",
          withFull && "w-full",
          className
        )}
      >
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  // Error State
  if (organization.isError) {
    return (
      <Button
        variant="outline"
        disabled
        className={cn(
          "w-[200px] justify-between text-destructive",
          withFull && "w-full",
          className
        )}
      >
        <span className="truncate">{t("common.noData")}</span>
        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  // Empty State
  if (org.length === 0) {
    return (
      <Button
        variant="outline"
        disabled
        className={cn(
          "w-[200px] justify-between",
          withFull && "w-full",
          className
        )}
      >
        <span className="truncate">{t("organization.notFound")}</span>
        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[200px] justify-between gap-2",
            withFull && "w-full",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <BuildingIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {selectedOrg ? selectedOrg.orgName : t("organization.selectOrganization")}
            </span>
          </div>
          <ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={t("organization.selectOrganization")}
          />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <BuildingIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t("organization.notFound")}
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {org.map((org: any) => {
                const isSelected = value === org.orgCustomId;
                return (
                  <CommandItem
                    key={org.orgCustomId}
                    value={org.orgCustomId}
                    onSelect={handleSelect}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <CheckIcon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSelected ? "opacity-100 text-primary" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium text-sm truncate">
                          {org.orgName}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {org.orgCustomId}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
