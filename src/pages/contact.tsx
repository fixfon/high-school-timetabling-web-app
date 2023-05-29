import { zodResolver } from "@hookform/resolvers/zod";
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Oval } from "react-loader-spinner";
import CTA from "~/components/home/Cta";
import Layout from "~/components/home/Layout";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import contactSchema, { type ContactInput } from "~/schemas/contact";

const ContactForm = () => {
  const [success, setSuccess] = useState(false);
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactInput) => {
    console.log(data);
    form.reset();
    setSuccess(true);
  };

  return (
    <Form {...form}>
      <form
        className="mt-8 flex w-full flex-col space-y-3 px-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="John"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="surname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Surname</FormLabel>
              <FormControl>
                <Input
                  placeholder="Doe"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="john@doe.com"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="5345672525"
                  disabled={form.formState.isSubmitting}
                  type="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  disabled={form.formState.isSubmitting}
                  placeholder="Enter your message"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="w-1/2 self-center"
          disabled={form.formState.isSubmitting}
          type="submit"
        >
          {form.formState.isSubmitting ? (
            <>
              <Oval
                height={20}
                width={20}
                strokeWidth={4}
                strokeWidthSecondary={3}
                color="#5090FF"
                secondaryColor="#FFFFFF"
              />
              <span>Submit</span>
            </>
          ) : (
            "Submit"
          )}
        </Button>

        {success && (
          <div className="flex w-full flex-col items-center justify-center pt-4">
            <h2 className="text-center text-xl font-bold text-green-500">
              Thank you for contacting us!
            </h2>
            <p className="text-center text-green-500">
              We will get back to you as soon as possible.
            </p>
          </div>
        )}
      </form>
    </Form>
  );
};

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
          <div className="mx-auto flex w-3/5 flex-col items-center justify-center">
            <ContactForm />
          </div>
        </div>
        <CTA />
      </Layout>
    </>
  );
};

export default Contact;
