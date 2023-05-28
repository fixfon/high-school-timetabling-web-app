import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiMenu } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Oval } from "react-loader-spinner";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <nav
      className={`z-10 h-20 w-full bg-background shadow-xl ${
        isOpen
          ? "relative before:fixed before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-[rgba(0,0,0,0.5)] before:content-['']"
          : "sticky top-0"
      }`}
    >
      <div className="container mx-auto flex h-full w-full items-center justify-between px-4 py-4 lg:px-0">
        <div>
          <Link href="/">
            <Image
              src="/logo-light.svg"
              height={80}
              width={320}
              alt="TimetablePRO Logo Light"
              className="w-60 md:w-[264px]"
            />
          </Link>
        </div>
        {isOpen ? (
          <button
            className="z-20 focus:outline-none lg:hidden"
            aria-expanded="true"
            aria-controls="navbar-def"
            onClick={() => setIsOpen(false)}
          >
            <IoClose className="h-10 w-10 text-foreground transition-all hover:text-primary" />
          </button>
        ) : (
          <button
            className="focus:outline-none lg:hidden"
            aria-expanded="false"
            aria-controls="navbar-def"
            onClick={() => setIsOpen(true)}
          >
            <HiMenu className="h-10 w-10 text-foreground transition-all hover:text-primary" />
          </button>
        )}

        <div
          id="navbar-def"
          className={`w-full lg:flex lg:flex-row lg:items-center lg:justify-between ${
            isOpen
              ? "absolute right-0 top-20 flex w-2/3 flex-col-reverse gap-12 rounded-b-2xl bg-background py-6 shadow-2xl"
              : "hidden"
          }`}
        >
          <ul className="flex flex-col items-center justify-center gap-8 text-2xl font-semibold lg:mx-auto lg:flex-row lg:text-xl">
            <li>
              <Link
                href="/about-us"
                className={
                  router.pathname == "/about-us"
                    ? "text-primary"
                    : "transition-colors hover:text-primary"
                }
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className={
                  router.pathname == "/contact"
                    ? "text-primary"
                    : "transition-colors hover:text-primary"
                }
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className={
                  router.pathname == "/privacy"
                    ? "text-primary"
                    : "transition-colors hover:text-primary"
                }
              >
                Privacy
              </Link>
            </li>
          </ul>

          <ul className="flex flex-col items-center justify-center gap-8 text-2xl font-semibold lg:flex-row lg:text-xl ">
            {session?.user && status === "authenticated" ? (
              <>
                <li>
                  <button
                    onClick={() => signOut({ redirect: false })}
                    className="transition-colors hover:text-primary"
                  >
                    Logout
                  </button>
                </li>
                <li>
                  <Link
                    href={
                      session.user.role === "SUPERADMIN"
                        ? "/admin"
                        : "/dashboard"
                    }
                  >
                    <button
                      type="button"
                      className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/80
                  "
                    >
                      Dashboard
                    </button>
                  </Link>
                </li>
              </>
            ) : status === "loading" ? (
              <li className="text-primary-foreground">
                <Oval
                  height={40}
                  width={40}
                  strokeWidth={5}
                  strokeWidthSecondary={5}
                  color="#0F1729"
                  secondaryColor="#FFFFFF"
                />
              </li>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="transition-colors hover:text-primary"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register">
                    <button
                      type="button"
                      className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/80
                  "
                    >
                      Register
                    </button>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
