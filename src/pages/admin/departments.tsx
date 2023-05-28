import type { NextPage } from "next";
import Head from "next/head";
import Layout from "~/components/dashboard/Layout";

const Departments: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Departments | TimetablePro</title>
        <meta name="description" content="TimetablePro Admin Departments" />
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

export default Departments;
