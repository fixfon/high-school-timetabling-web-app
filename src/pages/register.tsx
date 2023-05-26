import { type NextPage } from "next";
import Head from "next/head";
import registerSchema, { type RegisterInput } from "~/schemas/register";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { BiShow, BiHide } from "react-icons/bi";
import { useCallback, useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { api } from "~/utils/api";
import FullPageLoader from "~/components/loaders/FullPage";
import { Oval } from "react-loader-spinner";
import type { LoginInput } from "~/schemas/login";
import { cn } from "~/utils/cn";
import { fontSans } from "~/utils/fonts";

const inter = Inter({ subsets: ["latin"] });

const Register: NextPage = (props) => {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const { mutateAsync, isLoading: isRegistering } =
    api.register.register.useMutation({
      onSuccess: async (res) => {
        if (res.status === "ok") {
          const creds: LoginInput = {
            email: res.email,
            password: res.password,
          };
          const signedIn = await signIn("credentials", {
            callbackUrl: "/dashboard",
            redirect: false,
            ...creds,
          });

          if (!signedIn?.ok) router.push("/login");
        }
      },
      onError: (err) => {
        setError(err.message);
      },
    });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = useCallback(
    async (data: RegisterInput) => {
      try {
        await mutateAsync(data);
      } catch (err) {}
    },
    [mutateAsync]
  );

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <>
      <Head>
        <title>Register | TimetablePro</title>
        <meta
          name="description"
          content="TimetablePro | High school timetable application that offers the best optimized schedule for your entire semester."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {status === "loading" && <FullPageLoader />}
      <div
        className={cn(
          "flex h-full min-h-screen w-full items-center font-sans text-lg text-foreground/70 md:h-screen",
          fontSans.variable
        )}
      >
        <div className="flex min-h-full w-full flex-col px-4 py-12 lg:w-3/5 lg:px-8">
          <Link href="/" className="transition-opacity hover:opacity-70">
            <Image src="/logo-light.svg" alt="Logo" width={300} height={70} />
          </Link>
          <div className="my-auto flex h-full flex-col self-center xl:max-w-[80%]">
            <div className="mt-4 pb-4 md:mt-0 md:pb-12">
              <h1 className="text-5xl font-extrabold text-primary">Register</h1>
            </div>
            <div className="flex flex-col gap-4 pb-4 md:pb-12">
              <h3 className="text-xl font-medium text-primary">
                School managers register now
              </h3>
              <p className="text-base">
                Fill up your personal information and start creating your
                organization
              </p>
              <hr />
            </div>
            <div>
              <form
                noValidate
                className="mx-auto flex w-full flex-col items-center justify-center text-base"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="flex w-3/5 flex-col items-center md:w-full md:flex-row md:gap-6">
                  <div className="mb-4 flex w-full flex-col self-start">
                    <label>Name</label>
                    <input
                      disabled={isSubmitting || isRegistering}
                      className={`rounded-lg border bg-background px-3 py-0.5 placeholder:select-none placeholder:italic focus:outline disabled:opacity-60 ${
                        errors.name?.message
                          ? "border-red-500 outline-red-500"
                          : "outline-background-dark/70 border-border"
                      }`}
                      type="text"
                      {...register("name")}
                    />
                    {errors.name?.message && (
                      <span className="text-sm font-medium text-red-500">
                        Invalid name
                      </span>
                    )}
                  </div>
                  <div className="mb-4 flex w-full flex-col self-start">
                    <label>Surname</label>
                    <input
                      disabled={isSubmitting || isRegistering}
                      className={`rounded-lg border bg-background px-3 py-0.5 placeholder:select-none placeholder:italic disabled:opacity-60 ${
                        errors.surname?.message
                          ? "border-red-500 outline-red-500"
                          : "outline-background-dark/70 border-border"
                      }`}
                      type="text"
                      {...register("surname")}
                    />
                    {errors.surname?.message && (
                      <span className="text-sm font-medium text-red-500">
                        Invalid surname
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex w-3/5 flex-col items-center md:w-full md:flex-row md:gap-6">
                  <div className="mb-4 flex w-full flex-col self-start md:w-1/2">
                    <label>Email</label>
                    <input
                      disabled={isSubmitting || isRegistering}
                      className={`rounded-lg border bg-background px-3 py-0.5 placeholder:select-none placeholder:italic disabled:opacity-60 ${
                        errors.email?.message
                          ? "border-red-500 outline-red-500"
                          : "outline-background-dark/70 border-border"
                      }`}
                      type="email"
                      {...register("email")}
                    />
                    {errors.email?.message && (
                      <span className="text-sm font-medium text-red-500">
                        Invalid email
                      </span>
                    )}
                  </div>
                  <div className="mb-4 flex w-full flex-col self-start md:w-1/2">
                    <label>Phone</label>
                    <div
                      className={`flex w-full rounded-lg border bg-background  py-0.5 ${
                        errors.phone?.message
                          ? "border-red-500"
                          : "border-border"
                      }`}
                    >
                      <span className="select-none border-r border-border px-1">
                        +90
                      </span>
                      <input
                        disabled={isSubmitting || isRegistering}
                        maxLength={10}
                        className="w-full rounded-lg border-none bg-background px-1 placeholder:select-none placeholder:italic focus:border-none focus:outline-none disabled:opacity-60"
                        type="tel"
                        {...register("phone")}
                      />
                    </div>
                    {errors.phone?.message && (
                      <span className="text-sm font-medium text-red-500">
                        Invalid phone number
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-4 flex w-3/5 flex-col items-center md:w-full md:flex-row md:gap-6">
                  <div className="mb-4 flex w-full flex-col self-start">
                    <div className="relative flex w-full flex-col">
                      <label>Password</label>
                      <input
                        disabled={isSubmitting || isRegistering}
                        className={`rounded-lg border bg-background px-3 py-0.5 placeholder:select-none placeholder:italic disabled:opacity-60 ${
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
                      <span className="text-sm font-medium text-red-500">
                        Password must contain 6 or more characters
                      </span>
                    )}
                  </div>
                  <div className="flex w-full flex-col self-start">
                    <div className="relative flex w-full flex-col">
                      <label>Confirm Password</label>
                      <input
                        disabled={isSubmitting || isRegistering}
                        className={`rounded-lg border bg-background px-3 py-0.5 placeholder:select-none placeholder:italic disabled:opacity-60 ${
                          errors.confirmPassword?.message
                            ? "border-red-500 outline-red-500"
                            : "outline-background-dark/70 border-border"
                        }`}
                        type={showConfirmPassword ? "text" : "password"}
                        {...register("confirmPassword")}
                      />
                      {showConfirmPassword ? (
                        <BiHide
                          onClick={toggleConfirmPassword}
                          className="absolute bottom-1 right-3 cursor-pointer text-xl transition-all hover:text-foreground/40"
                        />
                      ) : (
                        <BiShow
                          onClick={toggleConfirmPassword}
                          className="absolute bottom-1 right-3 cursor-pointer text-xl transition-all hover:text-foreground/40"
                        />
                      )}
                    </div>
                    {errors.confirmPassword?.message && (
                      <span className="text-sm font-medium text-red-500">
                        Passwords must match
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex w-3/5 flex-col">
                  <label>Organization Name</label>
                  <input
                    disabled={isSubmitting || isRegistering}
                    className={`rounded-lg border bg-background px-3 py-0.5 placeholder:select-none placeholder:italic disabled:opacity-60 ${
                      errors.organization?.message
                        ? "border-red-500 outline-red-500"
                        : "outline-background-dark/70 border-border"
                    }`}
                    type="text"
                    {...register("organization")}
                  />
                  {errors.organization?.message && (
                    <span className="text-sm font-medium text-red-500">
                      Invalid organization name
                    </span>
                  )}
                </div>
                <div className="self-start">
                  <label className="mt-6 flex items-center gap-2">
                    <input
                      disabled={isSubmitting || isRegistering}
                      className="h-4 w-4 rounded-lg border border-border bg-background px-3 py-0.5 disabled:opacity-60"
                      type="checkbox"
                      {...register("terms")}
                    />
                    <span className="text-base font-medium">
                      I accept the{" "}
                      <Link
                        href="/privacy"
                        className="text-primary hover:text-primary/80"
                      >
                        Terms, Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.terms && (
                    <span className="text-sm font-medium text-red-500">
                      You must accept the terms of service and privacy policy
                    </span>
                  )}
                </div>
                <div className="self-start">
                  <label className="mt-1 flex items-center gap-2">
                    <input
                      disabled={isSubmitting || isRegistering}
                      className="h-4 w-4 rounded-lg border border-border bg-background px-3 py-0.5 disabled:opacity-60"
                      type="checkbox"
                      {...register("marketing")}
                    />
                    <span className="text-base">
                      Yes, I want to receive{" "}
                      <span className="font-medium">TimetablePro</span> emails
                    </span>
                  </label>
                </div>

                {error && (
                  <span className="mt-4 font-medium text-red-500">{error}</span>
                )}

                <button
                  disabled={isSubmitting || isRegistering}
                  type="submit"
                  className={`flex w-3/5 items-center justify-center gap-2 rounded-lg bg-primary py-1 text-lg font-medium text-primary-foreground transition-all hover:bg-primary/80 disabled:bg-primary/50 ${
                    error ? "mt-4" : "mt-8 "
                  }`}
                >
                  {isSubmitting || isRegistering ? (
                    <>
                      <Oval
                        height={20}
                        width={20}
                        strokeWidth={4}
                        strokeWidthSecondary={3}
                        color="#5090FF"
                        secondaryColor="#FFFFFF"
                      />
                      <span>Register</span>
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>
              <h4 className="mt-4 text-center text-base font-medium">
                Are you a teacher? Do you have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80"
                >
                  Login TimetablePro
                </Link>
              </h4>
            </div>
          </div>
        </div>
        <div className="hidden h-full w-2/5 lg:block ">
          <Image
            className="h-full w-full object-cover object-center"
            src="/cover2.png"
            alt="Register Cover Image"
            width={2048}
            height={2048}
          />
        </div>
      </div>
    </>
  );
};

export default Register;
