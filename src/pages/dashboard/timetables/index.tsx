import type { NextPage } from "next";
import Head from "next/head";
import Layout from "~/components/dashboard/Layout";

const TimetableView: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>TimetableView | TimetablePro</title>
        <meta name="description" content="TimetablePro TimetableView" />
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

export default TimetableView;
