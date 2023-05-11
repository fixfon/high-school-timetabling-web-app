import { fontSans } from "~/utils/fonts";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { cn } from "~/utils/cn";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={cn("h-full w-full font-sans text-lg", fontSans.variable)}>
      <Header />
      <div className="container flex flex-row">
        <Sidebar />
        {children}
      </div>
    </div>
  );
}
