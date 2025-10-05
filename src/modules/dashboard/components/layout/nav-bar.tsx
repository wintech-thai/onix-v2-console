"use client";

import { OrgSwitcher } from "@/components/ui/org-switcher";
import { SwitchLanguage } from "@/components/ui/switch-language";
import { UserButton } from "@/components/ui/user-button";
import { RouteConfig } from "@/config/route.config";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  isExpand: boolean;
  layout?: "nav" | "dashbaord";
  showIcon?: boolean;
  showOrg?: boolean;
  isMobile?: boolean;
  onMenuClick?: () => void;
};
export const Navbar = ({
  isExpand,
  layout = "dashbaord",
  showIcon = false,
  showOrg = true,
  isMobile = false,
  onMenuClick,
}: Props) => {
  const router = useRouter();
  return (
    <div
      style={{
        paddingLeft: layout === "nav" ? 0 : isMobile ? 0 : isExpand ? 256 : 75,
        transition: "padding-left 0.2s",
      }}
      className="h-16 border-b fixed top-0 left-0 bg-background w-full z-30"
    >
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {isMobile && layout === "dashbaord" && (
            <Button
              variant="outline"
              size="icon"
              onClick={onMenuClick}
              aria-label="Open menu"
              className="h-12"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {showOrg ? (
            <OrgSwitcher
              onOrgChange={(orgId) => router.push(RouteConfig.DASHBOARD.OVERVIEW(orgId))}
            />
          ) : null}
          {showIcon ? (
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
          ) : null}
        </div>

        <div className="h-full w-full flex items-center justify-end gap-4">
          <SwitchLanguage />
          <UserButton />
        </div>
      </div>
    </div>
  );
};
