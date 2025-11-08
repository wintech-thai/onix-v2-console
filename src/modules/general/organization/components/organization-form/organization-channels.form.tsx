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
import { getAllowChannelNamesApi } from "../../api/get-allow-channel-names.api";

type ChannelItem = {
  name: string;
  value: string;
};

interface OrganizationChannelsFormProps {
  isViewMode: boolean;
}

export const OrganizationChannelsForm = ({ isViewMode }: OrganizationChannelsFormProps) => {
  const { t } = useTranslation("organization");
  const params = useParams<{ orgId: string }>();
  const form = useFormContext<OrganizationSchemaType>();
  const isSubmitting = form.formState.isSubmitting;

  const { channels } = form.watch();

  const [availableChannels, setAvailableChannels] = useState<ChannelItem[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<ChannelItem[]>([]);
  const [leftChecked, setLeftChecked] = useState<Set<string>>(new Set());
  const [rightChecked, setRightChecked] = useState<Set<string>>(new Set());

  const fetchChannelNamesQuery = getAllowChannelNamesApi.useGetAllowChannelNames(params);

  // Initialize available and selected channels from API
  useEffect(() => {
    if (fetchChannelNamesQuery.data?.data) {
      const allChannels = fetchChannelNamesQuery.data.data;
      const formChannels = channels || {};

      const selected: ChannelItem[] = [];
      const available: ChannelItem[] = [];

      allChannels.forEach((channel) => {
        if (
          formChannels[channel.name] !== undefined &&
          formChannels[channel.name] !== null &&
          formChannels[channel.name] !== ""
        ) {
          selected.push(channel);
        } else {
          available.push(channel);
        }
      });

      selected.sort((a, b) => a.name.localeCompare(b.name));
      available.sort((a, b) => a.name.localeCompare(b.name));

      setSelectedChannels(selected);
      setAvailableChannels(available);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchChannelNamesQuery.data]);

  const handleMoveToSelected = () => {
    const channelsToMove = availableChannels.filter((channel) =>
      leftChecked.has(channel.name)
    );

    const newSelected = [...selectedChannels, ...channelsToMove].sort(
      (a, b) => a.name.localeCompare(b.name)
    );

    setSelectedChannels(newSelected);
    setAvailableChannels(
      availableChannels.filter((channel) => !leftChecked.has(channel.name))
    );
    setLeftChecked(new Set());
  };

  const handleMoveToAvailable = () => {
    const channelsToMove = selectedChannels.filter((channel) =>
      rightChecked.has(channel.name)
    );

    const resetChannels = channelsToMove.map((channel) => ({
      ...channel,
      value:
        fetchChannelNamesQuery.data?.data.find(
          (c: ChannelItem) => c.name === channel.name
        )?.value || "",
    }));

    const newAvailable = [...availableChannels, ...resetChannels].sort(
      (a, b) => a.name.localeCompare(b.name)
    );

    setAvailableChannels(newAvailable);
    setSelectedChannels(
      selectedChannels.filter((channel) => !rightChecked.has(channel.name))
    );

    const updatedChannels = { ...channels };
    channelsToMove.forEach((channel) => {
      delete updatedChannels[channel.name];
    });
    form.setValue("channels", updatedChannels, {
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

  const handleChannelValueChange = (name: string, value: string) => {
    const updatedChannels = { ...channels };
    updatedChannels[name] = value || null;
    form.setValue("channels", updatedChannels, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSelectAllLeft = (checked: boolean) => {
    if (checked) {
      setLeftChecked(new Set(availableChannels.map((channel) => channel.name)));
    } else {
      setLeftChecked(new Set());
    }
  };

  const handleSelectAllRight = (checked: boolean) => {
    if (checked) {
      setRightChecked(new Set(selectedChannels.map((channel) => channel.name)));
    } else {
      setRightChecked(new Set());
    }
  };

  if (fetchChannelNamesQuery.isLoading) {
    return (
      <div className="p-4 md:p-6 border rounded-lg">
        <header className="text-lg font-bold">
          {t("channels.title")}
        </header>
        <div className="mt-4 text-center text-muted-foreground">
          {t("channels.loading")}
        </div>
      </div>
    );
  }

  if (fetchChannelNamesQuery.isError) {
    if (fetchChannelNamesQuery.error.response?.status === 403) {
      return <NoPermissionsPage apiName="GetAllowChannelNames" />;
    }

    throw new Error(fetchChannelNamesQuery.error.message);
  }

  return (
    <div className="p-4 md:p-6 border rounded-lg">
      <header className="text-lg font-bold">
        {t("channels.title")}
      </header>

      <div className="flex flex-col lg:flex-row w-full gap-4 mt-4">
        {/* Left Panel - Available Channels */}
        <div className="w-full md:w-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      availableChannels.length > 0 &&
                      leftChecked.size === availableChannels.length
                    }
                    onCheckedChange={(checked) =>
                      handleSelectAllLeft(checked as boolean)
                    }
                    disabled={isViewMode || isSubmitting}
                  />
                </TableHead>
                <TableHead>{t("channels.available")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableChannels.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground"
                  >
                    {t("channels.noAvailable")}
                  </TableCell>
                </TableRow>
              ) : (
                availableChannels.map((channel) => (
                  <TableRow key={channel.name}>
                    <TableCell>
                      <Checkbox
                        checked={leftChecked.has(channel.name)}
                        onCheckedChange={(checked) =>
                          handleLeftCheckboxChange(channel.name, checked as boolean)
                        }
                        disabled={isViewMode || isSubmitting}
                      />
                    </TableCell>
                    <TableCell>{channel.name}</TableCell>
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

        {/* Right Panel - Selected Channels */}
        <div className="flex-1 min-w-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedChannels.length > 0 &&
                      rightChecked.size === selectedChannels.length
                    }
                    onCheckedChange={(checked) =>
                      handleSelectAllRight(checked as boolean)
                    }
                    disabled={isViewMode || isSubmitting}
                  />
                </TableHead>
                <TableHead>{t("channels.channelType")}</TableHead>
                <TableHead>{t("channels.value")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedChannels.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    {t("channels.noSelected")}
                  </TableCell>
                </TableRow>
              ) : (
                selectedChannels.map((channel) => (
                  <TableRow key={channel.name}>
                    <TableCell>
                      <Checkbox
                        checked={rightChecked.has(channel.name)}
                        onCheckedChange={(checked) =>
                          handleRightCheckboxChange(channel.name, checked as boolean)
                        }
                        disabled={isViewMode || isSubmitting}
                      />
                    </TableCell>
                    <TableCell>{channel.name}</TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        placeholder={channel.value}
                        value={channels?.[channel.name] ?? ""}
                        onChange={(e) =>
                          handleChannelValueChange(channel.name, e.target.value)
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
