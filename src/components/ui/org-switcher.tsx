"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

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

export function OrgSwitcher() {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(params.orgId);

  const organization = useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const r = await api.get(
        "/api/Organization/org/temp/action/GetUserAllowedOrg"
      );
      return r.data;
    },
  });

  const org = organization.data ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {organization.isLoading ? (
          <Button variant="outline" className="w-[200px] justify-between">
            Loading...
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        ) : (
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value
              ? org.find((org: any) => org.orgCustomId === value)?.orgCustomId
              : "Select framework..."}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {org.map((org: any, i: number) => (
                <CommandItem
                  key={org.orgCustomId}
                  value={org.orgCustomId}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === org.orgCustomId ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {org.orgName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
