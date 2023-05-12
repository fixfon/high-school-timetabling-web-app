import { type NextPage } from "next";
import Head from "next/head";
import Layout from "~/components/dashboard/Layout";

const DashboardHome: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Dashboard | TimetablePro</title>
        <meta name="description" content="TimetablePro Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div>selam</div>
      </Layout>
    </>
  );
};

export default DashboardHome;
