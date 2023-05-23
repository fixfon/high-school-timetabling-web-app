import type { NextPage } from "next";
import Head from "next/head";
import Layout from "~/components/dashboard/Layout";

const Lessons: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Lessons | TimetablePro</title>
        <meta name="description" content="TimetablePro Admin Lessons" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex w-full flex-col md:flex-row">
          <p>empty</p>
        </div>
      </Layout>
    </>
  );
};

export default Lessons;
