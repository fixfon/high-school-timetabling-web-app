import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";

const Home: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>High School Timetabler</title>
        <meta name="description" content="High School Timetabler" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white">
            Dummy App for High School Timetabling
          </h1>
          <div className="flex flex-col items-center justify-center gap-4 md:gap-8">
            <h3 className="text-xl font-bold text-white">
              This is main landing page for signed in and not signed in users.
            </h3>

            <div className="font-bold text-white">
              <h3 className="text-xl">Other Pages:</h3>
              <ul className="uppercase">
                <li>
                  <Link href="/dashboard/classrooms">
                    <p>Classrooms</p>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/teachers">
                    <p>Teachers</p>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/subjects">
                    <p>Subjects</p>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/terms">
                    <p>Terms</p>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/timetables">
                    <p>Timetables</p>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            {/* <CreateSuperAdmin /> */}
            <AuthShowcase />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();
  // const { data: secretMessage } = api.example.getSecretMessage.useQuery(
  //   undefined, // no input
  //   { enabled: sessionData?.user !== undefined }
  // );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.id}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={
          sessionData ? () => void signOut() : () => void signIn("credentials")
        }
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
