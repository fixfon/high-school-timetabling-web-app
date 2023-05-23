import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import CTA from "~/components/home/Cta";
import Layout from "~/components/home/Layout";

const AboutUs: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>About Us | TimetablePro</title>
        <meta
          name="description"
          content="TimetablePro | High school timetable application that offers the best optimized schedule for your entire semester."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="container py-12">
          <h1 className="text-center text-5xl font-extrabold text-primary">
            About Us
          </h1>
          <div className="mx-auto mt-12 flex w-4/5 flex-col items-center justify-center space-y-8">
            <p className="self-start text-sm italic">Updated on 05.03.2023</p>
            <Image
              src="/aboutus-placeholder.png"
              width={1296}
              height={912}
              alt="About us"
              className="rounded-lg"
            />
            <p>
              Hello, We are a team working on creating a high school class
              schedule management system. Our aim is to help students and
              teachers manage their class schedules more easily and efficiently.
            </p>
            <p>
              When creating our project, we took into account the issues
              encountered in existing systems and developed many innovative
              solutions to solve them. We designed a user-friendly system to
              make it easier for users to access their schedules and make
              changes to them more quickly.
            </p>
            <p>
              Our system provides users with all the necessary tools to manage
              their class schedules. Users can easily edit their schedules, make
              changes quickly, and view all of their schedules in one place.
              Additionally, our system is continuously updated and improved, so
              we can always meet our users&apos; needs.
            </p>
            <p>
              For us, the most important thing is our users&apos; satisfaction.
              Therefore, we constantly test the system and listen to your
              feedback. We work tirelessly to improve our users&apos;
              experiences even further. We would be delighted to have you as
              part of our community!
            </p>
          </div>
        </div>
        <CTA />
      </Layout>
    </>
  );
};

export default AboutUs;
