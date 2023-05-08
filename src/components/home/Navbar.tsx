import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="h-20 w-full shadow-xl">
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between py-4">
        <div>
          <h1 className="text-4xl">TimetablePRO</h1>
        </div>
        <div>
          <ul className="flex items-center justify-center gap-8 text-xl font-semibold">
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
        </div>
        <div>
          <ul className="flex items-center justify-center gap-8 text-xl font-semibold ">
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
