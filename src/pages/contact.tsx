import type { NextPage } from "next";
import Head from "next/head";
import CTA from "~/components/home/Cta";
import Layout from "~/components/home/Layout";

const Contact: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Contact | TimetablePro</title>
        <meta
          name="description"
          content="TimetablePro | High school timetable application that offers the best optimized schedule for your entire semester."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="container py-12">
          <h1 className="text-center text-5xl font-extrabold text-primary">
            Contact
          </h1>
          <div className="mx-auto mt-12 flex w-4/5 flex-col items-center justify-center space-y-8">
            <p>Contact form</p>
          </div>
        </div>
        <CTA />
      </Layout>
    </>
  );
};

export default Contact;
