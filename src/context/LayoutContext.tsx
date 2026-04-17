"use client";
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";

interface LayoutContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isCollapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  // Close sidebar automatically on mobile when route changes
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  const value = useMemo(() => ({
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    isCollapsed,
    setCollapsed
  }), [isSidebarOpen, toggleSidebar, closeSidebar, isCollapsed]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
