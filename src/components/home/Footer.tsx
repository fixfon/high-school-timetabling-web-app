import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="container mx-auto mt-12 flex w-full flex-col">
      <div className="mx-auto flex flex-col items-center justify-between gap-8 text-xl font-medium md:w-4/5 md:flex-row md:gap-0">
        <ul className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-16">
          <li>
            <Link
              href="/about-us"
              className="transition-colors hover:text-primary"
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </li>
        </ul>
        <ul className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-16">
          <li>
            <Link
              href="/login"
              className="transition-colors hover:text-primary"
            >
              Login
            </Link>
          </li>
          <li>
            <Link
              href="/register"
              className="transition-colors hover:text-primary"
            >
              Register
            </Link>
          </li>
        </ul>
      </div>
      <hr className="my-4 border-border" />
      <div className="flex flex-col items-center gap-12 py-4 lg:flex-row lg:gap-0">
        <div className="flex items-center justify-center gap-6 lg:w-1/3 lg:gap-4">
          <Link href="#" className="transition-all hover:scale-110">
            <Image
              className="select-none"
              src="/facebook.svg"
              alt="Facebook"
              width={35}
              height={35}
            />
          </Link>
          <Link href="#" className="transition-all hover:scale-110">
            <Image
              src="/instagram.svg"
              alt="Instagram"
              width={35}
              height={35}
            />
          </Link>
          <Link href="#" className="transition-all hover:scale-110">
            <Image src="/youtube.svg" alt="Youtube" width={40} height={40} />
          </Link>
          <Link href="#" className="transition-all hover:scale-110">
            <Image src="/twitter.svg" alt="Twitter" width={40} height={40} />
          </Link>
        </div>
        <div className="flex items-center justify-center lg:w-1/3">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image
              src="/icon-light.svg"
              alt="TimetablePRO Icon Light"
              width={150}
              height={150}
            />
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 lg:w-1/3">
          <input
            className="w-60 rounded-3xl border-2 border-border px-3 py-1 text-base"
            type="email"
            placeholder="Email Address"
          />
          <button className="rounded-lg bg-primary px-3 py-2 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/80">
            Subscribe to Newsletter
          </button>
        </div>
      </div>
      <div className="mt-4 self-center">
        <p>
          2023 © -{" "}
          <Link
            href="/privacy"
            className="transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
