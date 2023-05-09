import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="container mx-auto mt-12 flex w-full flex-col">
      <div className="mx-auto flex gap-8 md:gap-0 md:w-4/5 flex-col items-center justify-between text-xl font-medium md:flex-row">
        <ul className="flex flex-col items-center justify-center gap-4 md:gap-16 md:flex-row">
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
        <ul className="flex flex-col items-center justify-center gap-4 md:gap-16 md:flex-row">
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
      <hr className="my-4 border-text-dark" />
      <div className="flex items-center lg:flex-row flex-col lg:gap-0 gap-12 py-4">
        <div className="flex lg:w-1/3 items-center justify-center gap-6 lg:gap-4">
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
        <div className="flex lg:w-1/3 items-center justify-center">
          <Image
            src="/placeholder5.png"
            alt="Placeholder 5"
            width={150}
            height={150}
          />
        </div>
        <div className="flex lg:w-1/3 flex-col items-center justify-center gap-4">
          <input
            className="w-60 rounded-3xl border-2 border-background-dark/50 px-3 py-1 text-base"
            type="email"
            placeholder="Email Address"
          />
          <button className="rounded-lg bg-primary px-3 py-2 text-base font-medium text-text-light transition-colors hover:bg-button-hover-primary">
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
