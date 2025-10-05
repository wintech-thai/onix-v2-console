"use client";

import { Navbar } from "@/modules/dashboard/components/layout/nav-bar";
import { Sidebar } from "@/modules/dashboard/components/layout/side-bar";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useIsClient, useMediaQuery } from "usehooks-ts";

type Props = {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isClient = useIsClient();

  // รอให้ client-side hydrate ก่อน
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin size-4" />
      </div>
    );
  }

  return (
    <div className="h-full">
      <Navbar
        isExpand={isMobile ? false : expanded}
        isMobile={isMobile}
        onMenuClick={() => setExpanded(!expanded)}
      />
      <Sidebar expanded={expanded} setExpanded={setExpanded} isMobile={isMobile} />
      <div style={{
        paddingLeft: isMobile ? 0 : (expanded ? 256 : 75), // mobile ไม่มี padding, desktop มี padding ตาม sidebar
        paddingTop: 64,
        transition: "padding-left 0.2s",
      }} className="h-full w-full">
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
