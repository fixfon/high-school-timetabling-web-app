import { type NextPage } from "next";
import Head from "next/head";
import loginSchema, { type LoginInput } from "~/schemas/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { BiShow, BiHide } from "react-icons/bi";
import { useState } from "react";

const Login: NextPage = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    return console.log(data);
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
      <Head>
        <title>Login | TimetablePro</title>
        <meta
          name="description"
          content="TimetablePro | High school timetable application that offers the best optimized schedule for your entire semester."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen w-full items-center bg-background-light text-lg text-text-dark/70">
        <div className="flex min-h-full w-full flex-col px-4 py-12 lg:w-3/5 lg:px-8">
          <Image
            className="md:mt-0 mt-8"
            src="/placeholder4.png"
            alt="Logo Placeholder"
            width={300}
            height={70}
          />
          <div className="my-auto flex h-full max-w-[80%] flex-col self-center">
            <div className="mt-4 md:mt-0 pb-12 md:pb-32">
              <h1 className="text-5xl font-extrabold text-primary">Login</h1>
            </div>
            <div className="flex flex-col gap-4 pb-8 md:pb-16">
              <h3 className="text-xl font-medium text-primary">
                Teachers & managers login to your dashboard
              </h3>
              <p className="text-base">
                To access your personal timetable calendar and manage your
                organization login with your account
              </p>
              <hr />
            </div>
            <div>
              <form
                noValidate
                className="mx-auto flex md:w-3/5 flex-col items-center justify-center text-base"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="mb-4 flex w-full flex-col">
                  <label>Email</label>
                  <input
                    className="rounded-lg border border-text-dark/40 bg-background-light px-3 py-0.5 placeholder:select-none placeholder:italic"
                    placeholder="test@test.com"
                    type="email"
                    {...register("email")}
                  />
                  {errors.email?.message && (
                    <span className="font-medium text-red-500">
                      Invalid email
                    </span>
                  )}
                </div>
                <div className="relative flex w-full flex-col">
                  <label>Password</label>
                  <input
                    placeholder="your very secret password"
                    className="rounded-lg border border-text-dark/40 bg-background-light px-3 py-0.5 placeholder:select-none placeholder:italic"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                  {showPassword ? (
                    <BiHide
                      onClick={togglePassword}
                      className="absolute bottom-1 right-3 cursor-pointer text-xl transition-all hover:text-text-dark/40"
                    />
                  ) : (
                    <BiShow
                      onClick={togglePassword}
                      className="absolute bottom-1 right-3 cursor-pointer text-xl transition-all hover:text-text-dark/40"
                    />
                  )}
                </div>
                {errors.password?.message && (
                  <span className="self-start font-medium text-red-500">
                    Password must contain at least 6 characters
                  </span>
                )}
                <Link
                  className="mt-4 self-end text-primary transition-colors hover:text-button-hover-primary"
                  href="#"
                >
                  Reset Password
                </Link>

                <button
                  type="submit"
                  className="mt-8 md:mt-16 w-4/5 rounded-lg bg-primary py-1 text-lg font-medium text-secondary transition-all hover:bg-button-hover-primary"
                >
                  Login
                </button>
              </form>
              <h4 className="mt-4 text-center text-base font-medium">
                Don&lsquo;t you have an account yet?{" "}
                <Link
                  href="/register"
                  className="text-primary hover:text-button-hover-primary"
                >
                  Join TimetablePro
                </Link>{" "}
                now
              </h4>
            </div>
          </div>
        </div>
        <div className="hidden h-full w-2/5 lg:block ">
          <Image
            className="h-full w-full object-cover object-left"
            src="/cover1.png"
            alt="Login Cover Image"
            width={2048}
            height={2048}
          />
        </div>
      </div>
    </>
  );
};

export default Login;
