import { fontSans } from "~/utils/fonts";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { cn } from "~/utils/cn";
import { useState } from "react";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn("h-full w-full font-sans text-lg relative", fontSans.variable)}>
      <Header setIsCollapsed={setIsCollapsed} />
      <div className="container flex flex-row relative">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        {children}
      </div>
    </div>
  );
}
