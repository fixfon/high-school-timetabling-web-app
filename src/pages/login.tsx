import { type NextPage } from "next";
import Head from "next/head";
import loginSchema, { type LoginInput } from "~/schemas/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { BiShow, BiHide } from "react-icons/bi";
import { useCallback, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Oval } from "react-loader-spinner";
import FullPageLoader from "~/components/loaders/FullPage";
import { cn } from "~/utils/cn";
import { fontSans } from "~/utils/fonts";

const Login: NextPage = (props) => {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = useCallback(
    async (data: LoginInput) => {
      try {
        const res = await signIn("credentials", {
          callbackUrl: "/dashboard",
          redirect: false,
          ...data,
        });

        if (!res?.ok) {
          if (res?.error === "User not found") setError("User not found");
          else if (res?.error === "Invalid password")
            setError("Invalid password");
          else setError("Something went wrong");
        }

        if (res?.ok && res?.url) {
          router.push(res.url);
        }
      } catch (e) {
        setError("Something went wrong");
      }
    },
    [router]
  );

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

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
      {status === "loading" && <FullPageLoader />}
      <div
        className={cn(
          "flex h-screen w-full items-center font-sans text-lg text-foreground/70",
          fontSans.variable
        )}
      >
        <div className="flex min-h-full w-full flex-col px-4 py-12 lg:w-3/5 lg:px-8">
          <Image
            className="mt-8 md:mt-0"
            src="/placeholder4.png"
            alt="Logo Placeholder"
            width={300}
            height={70}
          />
          <div className="my-auto flex h-full max-w-[80%] flex-col self-center">
            <div className="mt-4 pb-12 md:mt-0 md:pb-32">
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
                className="mx-auto flex flex-col items-center justify-center text-base md:w-3/5"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="mb-4 flex w-full flex-col">
                  <label>Email</label>
                  <input
                    disabled={isSubmitting}
                    className={`rounded-lg border bg-background px-3 py-0.5 placeholder:select-none placeholder:italic ${
                      errors.email?.message
                        ? "border-red-500 outline-red-500"
                        : "outline-background-dark/70 border-border"
                    }`}
                    placeholder="test@test.com"
                    type="email"
                    {...register("email")}
                  />
                  {errors.email?.message && (
                    <span className="text-sm font-medium text-red-500">
                      Invalid email
                    </span>
                  )}
                </div>
                <div className="relative flex w-full flex-col">
                  <label>Password</label>
                  <input
                    disabled={isSubmitting}
                    placeholder="your very secret password"
                    className={`rounded-lg border bg-background px-3 py-0.5 placeholder:select-none placeholder:italic ${
                      errors.password?.message
                        ? "border-red-500 outline-red-500"
                        : "outline-background-dark/70 border-border"
                    }`}
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                  {showPassword ? (
                    <BiHide
                      onClick={togglePassword}
                      className="absolute bottom-1 right-3 cursor-pointer text-xl transition-all hover:text-foreground/40"
                    />
                  ) : (
                    <BiShow
                      onClick={togglePassword}
                      className="absolute bottom-1 right-3 cursor-pointer text-xl transition-all hover:text-foreground/40"
                    />
                  )}
                </div>
                {errors.password?.message && (
                  <span className="self-start text-sm font-medium text-red-500">
                    Password must contain at least 6 characters
                  </span>
                )}
                <Link
                  className="mt-4 self-end text-primary transition-colors hover:text-primary/80"
                  href="#"
                >
                  Reset Password
                </Link>

                {error && (
                  <span className="mt-4 font-medium text-red-500">{error}</span>
                )}

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className={`flex w-4/5 items-center justify-center gap-2 rounded-lg bg-primary py-1 text-lg font-medium text-secondary transition-all hover:bg-primary/80 disabled:bg-primary/50 ${
                    error ? "mt-4 md:mt-8" : "mt-8 md:mt-14"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Oval
                        height={20}
                        width={20}
                        strokeWidth={4}
                        strokeWidthSecondary={3}
                        color="#5090FF"
                        secondaryColor="#FFFFFF"
                      />
                      <span>Login</span>
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
              <h4 className="mt-4 text-center text-base font-medium">
                Don&lsquo;t you have an account yet?{" "}
                <Link
                  href="/register"
                  className="text-primary hover:text-primary/80"
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
