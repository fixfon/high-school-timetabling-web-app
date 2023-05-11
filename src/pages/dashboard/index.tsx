import { type NextPage } from "next";
import Head from "next/head";
import Layout from "~/components/dashboard/Layout";

const DashboardHome: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>High School Timetabler</title>
        <meta name="description" content="High School Timetabler" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div>selam</div>
      </Layout>
    </>
  );
};

export default DashboardHome;
