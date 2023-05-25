import Image from "next/image";
import Link from "next/link";

export default function CTA() {
  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center bg-foreground px-8 py-12 text-center text-secondary lg:px-0">
      <h1 className="mb-6 text-3xl font-extrabold md:text-4xl lg:text-5xl">
        FOCUS ON YOUR CREATIVITY
      </h1>
      <h3 className="mb-10 text-xl font-bold lg:text-2xl">
        Let{" "}
        <span className="bg-gradient-to-r from-primary via-secondary to-complementary bg-clip-text text-transparent">
          TimetablePro
        </span>{" "}
        Handle Your Optimization
      </h3>
      <Image
        className="mb-12"
        src="/logo-dark.svg"
        alt="Logo Placeholder"
        width={433}
        height={105}
      />
      <h2 className="mb-6 text-3xl font-extrabold lg:text-4xl">
        JOIN US TODAY
      </h2>
      <Link href="/register">
        <button className="rounded-lg bg-secondary px-6 py-4 text-xl font-bold text-primary shadow-glow transition-all hover:brightness-125 lg:text-2xl">
          Get Started
        </button>
      </Link>
    </div>
  );
}
