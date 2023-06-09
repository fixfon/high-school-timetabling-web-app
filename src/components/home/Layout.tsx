import { cn } from "~/utils/cn";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { fontSans } from "~/utils/fonts";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={cn("h-full w-full font-sans text-lg", fontSans.variable)}>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
