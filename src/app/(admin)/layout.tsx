"use client";

import { Navbar } from "@/modules/dashboard/components/layout/nav-bar";
import { Sidebar } from "@/modules/dashboard/components/layout/side-bar";
import { useState } from "react";
import { useIsClient, useMediaQuery } from "usehooks-ts";

type Props = {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return (
    <div className="h-full">
      <Navbar isExpand={isMobile ? false : expanded} />
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <div style={{
        marginLeft: isMobile ? 80 : (expanded ? 256 : 80), // mobile ไม่มี margin
        transition: "margin-left 0.2s",
      }} className="p-4">
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
