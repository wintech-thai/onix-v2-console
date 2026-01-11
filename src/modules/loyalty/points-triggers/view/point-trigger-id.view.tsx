"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import JsonView from "@uiw/react-json-view";
import { ArrowLeftIcon, Loader } from "lucide-react";
import { RouteConfig } from "@/config/route.config";
import { getPointTriggerApi } from "../api/get-point-triggers.api";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const PointTriggerIdViewPage = () => {
  const params = useParams<{ orgId: string; pointTriggerId: string }>();
  const router = useRouter();
  const { t } = useTranslation(["point-trigger", "common"]);

  const getPointTrigger = getPointTriggerApi.useGetPointTrigger({
    orgId: params.orgId,
    pointTriggerId: params.pointTriggerId,
  });

  if (getPointTrigger.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="animate-spin size-4" />
      </div>
    );
  }

  if (getPointTrigger.isError) {
    if (getPointTrigger.error.response?.status === 403) {
      return <NoPermissionsPage errors={getPointTrigger.error} />;
    }
    throw new Error(getPointTrigger.error.message);
  }

  const trigger = getPointTrigger.data?.data.pointTrigger;

  if (!trigger) {
    throw new Error("Point trigger not found");
  }

  let parsedParams = {};
  try {
    parsedParams = JSON.parse(trigger.triggerParams || "{}");
  } catch {
    parsedParams = { error: "Invalid JSON", raw: trigger.triggerParams };
  }

  const handleBack = () => {
    router.push(RouteConfig.LOYALTY.POINT_TRIGGER.LIST(params.orgId));
  };

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 border-b">
        <h1 className="text-lg font-bold">
          <ArrowLeftIcon
            className="inline cursor-pointer hover:text-primary"
            onClick={handleBack}
          />{" "}
          {t("detail.title")}
        </h1>
      </header>

      <div className="p-4 space-y-4 flex-1 overflow-scroll">
        <div className="border rounded-lg shadow-sm bg-white">
          <div className="p-6 space-y-4">
            <div className="grid gap-2">
              <Label>{t("table.triggerName")}</Label>
              <Input value={trigger.triggerName} readOnly />
            </div>

            <div className="grid gap-2">
              <Label>{t("table.description")}</Label>
              <Input value={trigger.description} readOnly />
            </div>

            <div className="grid gap-2">
              <Label>{t("table.tags")}</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                {trigger.tags ? (
                  trigger.tags.split(",").map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      {tag.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>{t("table.walletId")}</Label>
              <Input value={trigger.walletId} readOnly />
            </div>
          </div>
        </div>
        <div className="border rounded-lg shadow-sm bg-white">
          <div className="p-6">
            <div className="border rounded-md p-4 bg-slate-50 overflow-auto min-h-[400px]">
              <JsonView
                shortenTextAfterLength={10000}
                value={parsedParams}
                displayDataTypes={false}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end p-4 border-t">
        <Button
          onClick={() =>
            router.push(RouteConfig.LOYALTY.POINT_TRIGGER.LIST(params.orgId))
          }
        >
          {t("common:common.ok")}
        </Button>
      </div>
    </div>
  );
};

export default PointTriggerIdViewPage;
