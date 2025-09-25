"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboardIcon,
  Package2Icon,
  KeyRoundIcon,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ChildItem = { name: string; href: string };
type MenuItem = {
  key: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
  children?: ChildItem[];
};

const MENU: MenuItem[] = [
  {
    key: "dashboard",
    name: "Dashboard",
    icon: LayoutDashboardIcon,
    href: "/admin/dashboard",
    children: [{ name: "Overview", href: "/admin/dashboard/overview" }],
  },
  {
    key: "products",
    name: "Products",
    icon: Package2Icon,
    href: "/admin/products",
    children: [
      { name: "All Products", href: "/admin/products" },
      { name: "Add New", href: "/admin/products/new" },
      { name: "Categories", href: "/admin/products/categories" },
      { name: "Tags", href: "/admin/products/tags" },
    ]
  },
  {
    key: "api-keys",
    name: "API Keys",
    icon: KeyRoundIcon,
    href: "/admin/api-keys",
    children: [{ name: "All Keys", href: "/admin/api-keys" }],
  },
];

type Props = {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
};
export function Sidebar({ expanded, setExpanded }: Props) {
  const pathname = usePathname();
  const [openParents, setOpenParents] = useState<Record<string, boolean>>({});

  const activeParents = useMemo(() => {
    const actives: Record<string, boolean> = {};
    for (const m of MENU) {
      const selfActive =
        (m.href &&
          (pathname === m.href || pathname.startsWith(m.href + "/"))) ||
        false;
      const childActive =
        m.children?.some(
          (c) => pathname === c.href || pathname.startsWith(c.href + "/")
        ) ?? false;
      if (childActive) actives[m.key] = true;
      else if (selfActive && m.children?.length)
        actives[m.key] = openParents[m.key] ?? false;
    }
    return actives;
  }, [pathname, openParents]);

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
    setOpenParents((s) => ({ ...s, [key]: !s[key] }));

  return (
    <>
      {/* Sidebar (animate width) */}
      <motion.aside
        initial={false}
        animate={{ width: expanded ? 256 : 80 }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 32,
          mass: 0.8,
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-3 border-b">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white shadow overflow-hidden flex-shrink-0">
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
              const parentOpen = expanded
                ? openParents[m.key] ?? activeParents[m.key] ?? false
                : false;

              const ParentButton = (
                <button
                  type="button"
                  onClick={() => {
                    if (!expanded) {
                      setExpanded(true);
                      if (m.children?.length)
                        setOpenParents((s) => ({ ...s, [m.key]: true }));
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
                        {m.name}
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
                  aria-label={m.name}
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
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              className={cn(
                                "flex items-center justify-between rounded-lg px-2 py-2 text-sm",
                                childActive
                                  ? "bg-accent text-foreground shadow"
                                  : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                              )}
                            >
                              <span className="truncate">{c.name}</span>
                              <ChevronRight className="h-4 w-4 opacity-60" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </motion.aside>

      {/* ปุ่มกลมจับขอบ (animate ตำแหน่งซ้าย) */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        title={expanded ? "Collapse" : "Expand"}
        initial={false}
        animate={{ left: expanded ? 256 : 80 }} // ตรงขอบ sidebar พอดี: 256px (expanded) หรือ 80px (collapsed)
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className={cn(
          "fixed top-28 z-50 h-8 w-8 rounded-full border bg-background text-muted-foreground shadow-md",
          "flex items-center justify-center hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        )}
        style={{
          pointerEvents: "auto",
          transform: "translateX(-50%)", // จัดกลางตรงเส้นขอบ
        }}
      >
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      </motion.button>
    </>
  );
}
