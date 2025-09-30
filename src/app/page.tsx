"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  LayoutDashboardIcon,
  Package2Icon,
  UserCogIcon,
  KeyRoundIcon,
} from "lucide-react";

import { Navbar } from "@/modules/dashboard/components/layout/nav-bar";
import { cn } from "@/lib/utils";
import { OrgSwitcher } from "@/components/ui/org-switcher";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { RouteConfig } from "@/config/route.config";

type CardDef = {
  key: string;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const CARD_DEFS: CardDef[] = [
    {
      key: "feature",
      title: t("sidebar.admin.label"),
      icon: LayoutDashboardIcon,
    },
    {
      key: "banner",
      title: t("sidebar.general.label"),
      icon: Package2Icon,
    },
    {
      key: "category",
      title: t("sidebar.admin.label"),
      icon: UserCogIcon,
    },
    {
      key: "content",
      title: t("sidebar.admin.sub.1"),
      icon: KeyRoundIcon,
    },
  ];
  const reduceMotion = useReducedMotion();
  const cards = useMemo(() => CARD_DEFS, [CARD_DEFS]);
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  if (!client) return null;

  const containerVar: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.06 } },
  };

  const itemVar: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 320, damping: 24 },
    },
  };

  const userName = Cookies.get("user_name") || "User";

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="max-w-[1200px] w-full mx-auto flex-1 flex flex-col">
        <Navbar isExpand={false} showIcon showOrg={false} layout="nav" />

        {/* Header: ชื่อหน้า + OrgSwitcher */}
        <header className="mx-auto w-full max-w-6xl pt-4 md:pt-20 pb-3 px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {t("common.welcome")}{" "}
                <span className="text-primary">{userName}</span>
              </h1>
            </div>
            <div className="shrink-0">
              <OrgSwitcher
                withFull
                onOrgChange={(orgId) =>
                  router.push(RouteConfig.DASHBOARD(orgId))
                }
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4">
          <motion.div
            variants={containerVar}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-2 md:gap-6 sm:grid-cols-2"
          >
            {cards.map(({ key, title, icon: Icon }) => (
              <motion.article
                key={key}
                role="article"
                aria-label={title}
                variants={itemVar}
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
                className={cn(
                  "group relative h-[100px] md:h-[200px] overflow-hidden rounded-2xl border p-6 shadow-sm",
                  "border-slate-200/70 bg-white/80 backdrop-blur-sm",
                  "dark:border-slate-800 dark:bg-slate-900/50"
                )}
              >
                <div className="md:pr-24">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </h3>
                </div>

                {/* ไอคอน + glow มุมขวาล่าง */}
                <div className="pointer-events-none absolute -right-4 bottom-0">
                  <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-full bg-blue-500/10 blur-xl transition-transform duration-300 group-hover:translate-x-5 group-hover:translate-y-5" />
                  <Icon className="h-24 w-24 text-blue-500/85 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
                </div>
              </motion.article>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
