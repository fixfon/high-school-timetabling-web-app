import { type NextPage } from "next";
import Head from "next/head";

const AdminHome: NextPage = (props) => {
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
          
        </div>
      </main>
    </>
  );
};

export default AdminHome;