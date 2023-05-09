import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiMenu } from "react-icons/hi";
import { IoClose } from "react-icons/io5";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className={`relative z-10 h-20 w-full shadow-xl ${
        isOpen
          ? "before:fixed before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-[rgba(0,0,0,0.5)] before:content-['']"
          : ""
      }`}
    >
      <div className="container mx-auto flex h-full w-full items-center justify-between px-4 py-4 lg:px-0">
        <div>
          <h1 className="text-4xl">TimetablePRO</h1>
        </div>
        {isOpen ? (
          <button
            className="z-20 focus:outline-none lg:hidden"
            aria-expanded="true"
            aria-controls="navbar-def"
            onClick={() => setIsOpen(false)}
          >
            <IoClose className="h-10 w-10 text-text-dark transition-all hover:text-primary" />
          </button>
        ) : (
          <button
            className="focus:outline-none lg:hidden"
            aria-expanded="false"
            aria-controls="navbar-def"
            onClick={() => setIsOpen(true)}
          >
            <HiMenu className="h-10 w-10 text-text-dark transition-all hover:text-primary" />
          </button>
        )}

        <div
          id="navbar-def"
          className={`w-full lg:flex lg:flex-row lg:items-center lg:justify-between ${
            isOpen
              ? "absolute right-0 top-20 flex w-2/3 flex-col-reverse gap-12 rounded-b-2xl bg-background-light py-6 shadow-2xl"
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
                  className="rounded-lg bg-primary px-4 py-2 text-text-light transition-colors hover:bg-button-hover-primary
                  "
                >
                  Register
                </button>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
