import { type NextPage } from "next";
import Head from "next/head";
import Layout from "~/components/dashboard/Layout";

const AdminHome: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Admin Dashboard | TimetablePro</title>
        <meta name="description" content="TimetablePro Admin Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex w-full justify-center">
          <h1 className="mt-12 text-2xl font-bold">
            Admin Management Dashboard
          </h1>
        </div>
      </Layout>
    </>
  );
};

export default AdminHome;
