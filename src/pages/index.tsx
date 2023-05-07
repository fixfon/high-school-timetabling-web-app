import { type NextPage } from "next";
import Head from "next/head";
import Hero from "~/components/home/Hero";
import Layout from "~/components/home/Layout";
import SocialProof from "~/components/home/SocialProof";

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
        <Hero />
        <SocialProof />
      </Layout>
    </>
  );
};

export default Home;
