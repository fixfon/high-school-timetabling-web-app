import Image from "next/image";
import Link from "next/link";

export default function CTA() {
  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center bg-background-dark py-12 text-secondary">
      <h1 className="mb-6 text-5xl font-extrabold">FOCUS ON YOUR CREATIVITY</h1>
      <h3 className="mb-10 text-2xl font-bold">
        Let{" "}
        <span className="bg-gradient-to-r from-primary via-secondary to-complementary bg-clip-text text-transparent">
          TimetablePro
        </span>{" "}
        Handle Your Optimization
      </h3>
      <Image
        className="mb-12"
        src="/placeholder4.png"
        alt="Logo Placeholder"
        width={433}
        height={105}
      />
      <h2 className="mb-6 text-4xl font-extrabold">JOIN US TODAY</h2>
      <Link href="/register">
        <button className="rounded-lg bg-secondary px-6 py-4 text-2xl font-bold text-primary shadow-glow transition-all hover:brightness-125">
          Get Started
        </button>
      </Link>
    </div>
  );
}
