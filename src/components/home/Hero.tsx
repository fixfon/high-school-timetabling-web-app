import Image from "next/image";
import Link from "next/link";
import { AiOutlineArrowRight } from "react-icons/ai";

export default function Hero() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // first prevent the default behavior
    e.preventDefault();
    // get the href and remove everything before the hash (#)
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*\#/, "");
    // get the element by id and use scrollIntoView
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({
      behavior: "smooth",
    });
  };
  return (
    <div className="mx-auto flex w-full max-w-[1440px] gap-2 py-8">
      <div className="flex w-1/2 flex-col items-center justify-center gap-12">
        <h1 className="text-center text-5xl font-extrabold">
          Transform the way you schedule high school classes with{" "}
          <span className="bg-gradient-to-r from-background-dark via-primary to-complementary bg-clip-text text-transparent">
            TimetablePro
          </span>
        </h1>
        <h3 className="text-xl">
          Smart, simple, and effective scheduling for a better education. Say
          goodbye to the headache of juggling teacher schedules and classroom
          assignments.
        </h3>
        <div>
          <ul className="flex items-center justify-center gap-24">
            <li>
              <Link href="/register">
                <button className="rounded-lg bg-primary px-4 py-2 text-2xl font-bold text-text-light transition-colors hover:bg-button-hover-primary">
                  Get Started
                </button>
              </Link>
            </li>
            <li>
              <Link
                href="#features"
                onClick={handleScroll}
                className="flex items-center justify-center gap-2 text-2xl font-bold transition-colors hover:text-primary"
              >
                <p>Learn More</p> <AiOutlineArrowRight />
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-1/2">
        <Image src="/hero_1.svg" priority alt="Hero" width={566} height={400} />
      </div>
    </div>
  );
}
