import { type NextPage } from "next";
import Head from "next/head";
import Layout from "~/components/home/Layout";
import Link from "next/link";
import Image from "next/image";

// import { api } from "~/utils/api";

const Home: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>High School Timetabler</title>
        <meta name="description" content="High School Timetabler" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="mx-auto flex w-full max-w-[1440px] gap-2 py-8">
          <div className="flex w-1/2 flex-col items-center justify-center gap-12">
            <h1 className="text-center text-5xl font-extrabold">
              Transform the way you schedule high school classes with{" "}
              <span className="bg-gradient-to-r from-background-dark via-primary to-complementary bg-clip-text text-transparent">
                TimetablePro
              </span>
            </h1>
            <h3>
              Smart, simple, and effective scheduling for a better education.
              Say goodbye to the headache of juggling teacher schedules and
              classroom assignments.
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
                    href="/features"
                    className="text-2xl font-bold transition-colors hover:text-primary"
                  >
                    Learn More --
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="w-1/2">
            <Image src="/hero.svg" alt="Hero" width={566} height={400} />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Home;
