import Footer from "./Footer";
import Navbar from "./Navbar";
import { Inter } from "next/font/google";

type LayoutProps = {
  children: React.ReactNode;
};

const inter = Inter({ subsets: ["latin"] });

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={inter.className}>
      <div className="mx-auto h-full w-full bg-background-light text-lg text-text-dark">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}