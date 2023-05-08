import { type NextPage } from "next";
import Head from "next/head";
import Features from "~/components/home/Features";
import Hero from "~/components/home/Hero";
import Layout from "~/components/home/Layout";
import SocialProof from "~/components/home/SocialProof";

// import { api } from "~/utils/api";

const Home: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>TimetablePro</title>
        <meta
          name="description"
          content="TimetablePro | High school timetable application that offers the best optimized schedule for your entire semester."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Hero />
        <SocialProof />
        <Features />
      </Layout>
    </>
  );
};

export default Home;
