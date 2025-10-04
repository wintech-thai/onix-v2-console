"use client";

import { OrgSwitcher } from "@/components/ui/org-switcher";
import { SwitchLanguage } from "@/components/ui/switch-language";
import { UserButton } from "@/components/ui/user-button";
import { RouteConfig } from "@/config/route.config";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  isExpand: boolean;
  layout?: "nav" | "dashbaord";
  showIcon?: boolean;
  showOrg?: boolean;
};
export const Navbar = ({
  isExpand,
  layout = "dashbaord",
  showIcon = false,
  showOrg = true,
}: Props) => {
  const router = useRouter();
  return (
    <div
      style={{
        paddingLeft: layout === "nav" ? 0 : isExpand ? 256 : 60,
        transition: "padding-left 0.2s",
      }}
      className="h-16 border-b fixed top-0 left-0 bg-background w-full"
    >
      <div className="h-full flex items-center justify-between px-4">
        {showOrg ? (
          <OrgSwitcher
            onOrgChange={(orgId) => router.push(RouteConfig.DASHBOARD.OVERVIEW(orgId))}
          />
        ) : null}
        {showIcon ? (
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
        ) : null}
        <div className="h-full w-full flex items-center justify-end gap-4">
          <SwitchLanguage />
          <UserButton />
        </div>
      </div>
    </div>
  );
};
