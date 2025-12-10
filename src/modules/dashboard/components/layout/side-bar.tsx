/* eslint-disable  @typescript-eslint/no-explicit-any */

"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboardIcon,
  Package2Icon,
  UserCogIcon,
  ChevronRight,
  ChevronDown,
  GiftIcon, QrCodeIcon
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { RouteConfig } from "@/config/route.config";
import { Hint } from "@/components/ui/hint";
import { env } from "next-runtime-env";
import { useFormNavigationBlocker } from "@/hooks/use-form-navigation-blocker";

// Type-safe i18n keys
type SidebarKeys =
  | "sidebar.dashboard.label"
  | "sidebar.dashboard.sub.1"
  | "sidebar.general.label"
  | "sidebar.general.sub.1"
  | "sidebar.general.sub.2"
  | "sidebar.general.sub.3"
  | "sidebar.general.sub.4"
  | "sidebar.general.sub.5"
  | "sidebar.scanItems.label"
  | "sidebar.scanItems.sub.1"
  | "sidebar.scanItems.sub.2"
  | "sidebar.scanItems.sub.3"
  | "sidebar.scanItems.sub.4"
  | "sidebar.scanItems.sub.5"
  | "sidebar.loyalty.label"
  | "sidebar.loyalty.sub.1"
  | "sidebar.loyalty.sub.2"
  | "sidebar.loyalty.sub.3"
  | "sidebar.loyalty.sub.4"
  | "sidebar.loyalty.sub.5"
  | "sidebar.admin.label"
  | "sidebar.admin.sub.1"
  | "sidebar.admin.sub.2"
  | "sidebar.admin.sub.3";

type ChildItem = {
  labelKey: SidebarKeys;
  href: string;
};

type MenuItem = {
  key: string;
  labelKey: SidebarKeys;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
  children?: ChildItem[];
};

type Props = {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  isMobile?: boolean;
};

export function Sidebar({ expanded, setExpanded, isMobile = false }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const params = useParams<{ orgId: string }>();
  const [openParents, setOpenParents] = useState<Record<string, boolean>>({});
  const { handleNavigation } = useFormNavigationBlocker();

  const MENU: MenuItem[] = useMemo(() => {
    return [
      {
        key: "dashboard",
        labelKey: "sidebar.dashboard.label",
        icon: LayoutDashboardIcon,
        children: [
          {
            labelKey: "sidebar.dashboard.sub.1",
            href: RouteConfig.DASHBOARD.OVERVIEW(params.orgId),
          },
        ],
      },
      {
        key: "general",
        labelKey: "sidebar.general.label",
        icon: Package2Icon,
        children: [
          {
            labelKey: "sidebar.general.sub.1",
            href: RouteConfig.GENERAL.ORG.VIEW(params.orgId),
          },
          {
            labelKey: "sidebar.general.sub.2",
            href: RouteConfig.GENERAL.PRODUCT.LIST(params.orgId),
          },
          {
            labelKey: "sidebar.general.sub.3",
            href: RouteConfig.GENERAL.CUSTOMER.LIST(params.orgId),
          },
          {
            labelKey: "sidebar.general.sub.4",
            href: RouteConfig.GENERAL.JOB.LIST(params.orgId),
          },
        ],
      },
      {
        key: "scanItem",
        labelKey: "sidebar.scanItems.label",
        icon: QrCodeIcon,
        children: [
          {
            labelKey: "sidebar.scanItems.sub.1",
            href: RouteConfig.SCAN_ITEMS.ACTION.LIST(params.orgId)
          },
          {
            labelKey: "sidebar.scanItems.sub.2",
            href: RouteConfig.SCAN_ITEMS.TEMPLATE.LIST(params.orgId)
          },
          {
            labelKey: "sidebar.scanItems.sub.3",
            href: RouteConfig.SCAN_ITEMS.FOLDER.LIST(params.orgId)
          },
          {
            labelKey: "sidebar.scanItems.sub.4",
            href: RouteConfig.SCAN_ITEMS.ITEM.LIST(params.orgId)
          },
          {
            labelKey: "sidebar.scanItems.sub.5",
            href: RouteConfig.SCAN_ITEMS.HISTORY.LIST(params.orgId)
          },
        ]
      },
      {
        key: "loyalty",
        labelKey: "sidebar.loyalty.label",
        icon: GiftIcon,
        children: [
          {
            labelKey: "sidebar.loyalty.sub.1",
            href: RouteConfig.LOYALTY.POINTS_WALLETS.LIST(params.orgId),
          },
          {
            labelKey: "sidebar.loyalty.sub.2",
            href: RouteConfig.LOYALTY.POINT_RULE.LIST(params.orgId),
          },
          {
            labelKey: "sidebar.loyalty.sub.3",
            href: RouteConfig.LOYALTY.POINT_TRIGGER.LIST(params.orgId),
          },
          {
            labelKey: "sidebar.loyalty.sub.4",
            href: RouteConfig.LOYALTY.PRIVILEGES.LIST(params.orgId),
          },
          {
            labelKey: "sidebar.loyalty.sub.5",
            href: RouteConfig.LOYALTY.VOUCHERS.LIST(params.orgId),
          },
        ],
      },
      {
        key: "admin",
        labelKey: "sidebar.admin.label",
        icon: UserCogIcon,
        children: [
          {
            labelKey: "sidebar.admin.sub.1",
            href: RouteConfig.ADMIN.APIKEY.LIST(params.orgId),
          },
          {
            labelKey: "sidebar.admin.sub.2",
            href: RouteConfig.ADMIN.USER.LIST(params.orgId),
          },
          {
            labelKey: "sidebar.admin.sub.3",
            href: RouteConfig.ADMIN.AUDIT_LOG.LIST(params.orgId),
          },
        ],
      },
    ];
  }, [params.orgId]);

  const activeParents = useMemo(() => {
    const actives: Record<string, boolean> = {};
    for (const m of MENU) {
      const childActive =
        m.children?.some(
          (c) => pathname === c.href || pathname.startsWith(c.href + "/")
        ) ?? false;
      if (childActive) actives[m.key] = true;
    }
    return actives;
  }, [pathname, MENU]);

  const isParentActive = (m: MenuItem) => {
    const selfActive =
      (m.href && (pathname === m.href || pathname.startsWith(m.href + "/"))) ||
      false;
    const childActive =
      m.children?.some(
        (c) => pathname === c.href || pathname.startsWith(c.href + "/")
      ) || false;
    return selfActive || childActive;
  };

  const toggleParent = (key: string) =>
    setOpenParents((s) => {
      const isCurrentlyOpen = s[key];
      // If currently open, close it. Otherwise, close all others and open this one.
      return isCurrentlyOpen ? { [key]: false } : { [key]: true };
    });

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setExpanded(false)}
          className="fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? 256 : expanded ? 256 : 75,
          x: isMobile ? (expanded ? 0 : -256) : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 32,
          mass: 0.8,
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm",
          isMobile && "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-3">
          <div className="grid size-6 md:size-10 place-items-center rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white shadow overflow-hidden flex-shrink-0">
            <Image src="/logo.png" alt="Logo" width={20} height={20} />
          </div>

          {expanded && (
            <div className="min-w-0 overflow-hidden">
              <div className="truncate text-sm font-semibold whitespace-nowrap">
                Please Scan
              </div>
              <div className="truncate text-xs text-muted-foreground whitespace-nowrap">
                Control Panel
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="h-[calc(100%-3rem)] overflow-y-auto py-2">
          <ul className="px-2">
            {MENU.map((m) => {
              const Icon = m.icon;
              const active = isParentActive(m);
              // Only use openParents state, and auto-open if child is active and nothing is manually opened
              const hasManuallyOpenedMenu = Object.values(openParents).some(v => v === true);
              const parentOpen = expanded
                ? (openParents[m.key] ?? (!hasManuallyOpenedMenu && activeParents[m.key]))
                : false;

              const ParentButton = (
                <button
                  type="button"
                  onClick={() => {
                    if (!expanded) {
                      setExpanded(true);
                      if (m.children?.length)
                        setOpenParents({ [m.key]: true });
                      return;
                    }
                    if (m.children?.length) toggleParent(m.key);
                  }}
                  className={cn(
                    "group relative flex w-full items-center rounded-xl px-2 py-2 text-sm",
                    active
                      ? "bg-accent text-foreground shadow"
                      : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                  )}
                  aria-expanded={parentOpen}
                >
                  <span
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-lg",
                      active
                        ? "bg-background/60"
                        : "bg-muted/40 group-hover:bg-background/60"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  {/* label + chevron เฉพาะตอน expanded */}
                  {expanded && (
                    <div className="ml-3 flex-1 flex items-center justify-between overflow-hidden min-w-0">
                      <span className="truncate text-left whitespace-nowrap">
                        {t(m.labelKey as any)}
                      </span>
                      {m.children?.length && (
                        <span
                          className={cn(
                            "shrink-0 ml-2 transition-transform duration-200",
                            parentOpen && "rotate-180"
                          )}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );

              const ParentLink = m.href ? (
                <Link
                  href={m.href}
                  className="absolute inset-0"
                  aria-label={t(m.labelKey as any)}
                  onClick={(e) => {
                    if (expanded && m.children?.length) {
                      e.preventDefault();
                      toggleParent(m.key);
                    }
                  }}
                />
              ) : null;

              return (
                <li key={m.key} className="relative">
                  <div className="relative">
                    {ParentButton}
                    {ParentLink}
                  </div>

                  {/* Children (accordion) */}
                  {expanded && m.children?.length && parentOpen && (
                    <ul className="pl-12 pr-2 py-1 space-y-1">
                      {m.children.map((c) => {
                        const childActive =
                          pathname === c.href ||
                          pathname.startsWith(c.href + "/");
                        return (
                          <Hint message={t(c.labelKey as any)} key={c.href}>
                            <li key={c.href}>
                              <button
                                type="button"
                                onClick={() => handleNavigation(c.href)}
                                className={cn(
                                  "w-full flex items-center justify-between rounded-lg px-2 py-2 text-sm",
                                  childActive
                                    ? "bg-accent text-foreground shadow"
                                    : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                                )}
                              >
                                <span className="truncate">
                                  {t(c.labelKey as any)}
                                </span>
                                <ChevronRight className="h-4 w-4 opacity-60" />
                              </button>
                            </li>
                          </Hint>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {expanded && (
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 w-full p-4 text-xs text-center text-muted-foreground border-t"
          >
            <div className="text-base">
              versions: {env("NEXT_PUBLIC_APP_VERSION")}
            </div>
            <Link
              target="_blank"
              href={env("NEXT_PUBLIC_PROVIDER_URL") ?? ""}
              className="text-sm hover:underline"
            >
              &copy; {new Date().getFullYear()} Dev Hub Co., Ltd. <br /> All
              rights reserved.
            </Link>
          </motion.footer>
        )}
      </motion.aside>

      {/* ปุ่มกลมจับขอบ (desktop only) */}
      {!isMobile && (
        <motion.button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          title={expanded ? "Collapse" : "Expand"}
          initial={false}
          animate={{ left: expanded ? 256 : 75 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className={cn(
            "fixed top-28 z-50 h-8 w-8 rounded-full border bg-background text-muted-foreground shadow-md",
            "flex items-center justify-center hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          )}
          style={{
            pointerEvents: "auto",
            transform: "translateX(-50%)",
          }}
        >
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        </motion.button>
      )}
    </>
  );
}
