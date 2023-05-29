import { zodResolver } from "@hookform/resolvers/zod";
import type { NextPage } from "next";
import { type User } from "next-auth";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Oval } from "react-loader-spinner";
import Layout from "~/components/dashboard/Layout";
import FullPageLoader from "~/components/loaders/FullPage";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";
import userSchema, { type UserInput } from "~/schemas/user";
import { api } from "~/utils/api";

type EditUserFormProps = {
  defaultValue?: UserInput;
  onSubmit: (data: UserInput) => Promise<void>;
  isMutating?: boolean;
};

const EditUserForm = ({
  defaultValue,
  onSubmit,
  isMutating,
}: EditUserFormProps) => {
  const defaultValues = useMemo(() => {
    return {
      id: defaultValue?.id ?? undefined,
      name: defaultValue?.name ?? "",
      surname: defaultValue?.surname ?? "",
      email: defaultValue?.email ?? "",
      password: "",
      imageUrl: defaultValue?.imageUrl ?? "",
    };
  }, [defaultValue]);

  const form = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: defaultValues,
  });

  const formSubmit = async (data: UserInput) => {
    await onSubmit(data);
  };

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form
        className="mt-8 flex w-full flex-col space-y-3 px-8"
        onSubmit={form.handleSubmit(formSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormDescription>Name of the user</FormDescription>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting || !!isMutating}
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
              <FormDescription>Surname of the user</FormDescription>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting || !!isMutating}
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
              <FormDescription>Email of the user</FormDescription>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting || !!isMutating}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormDescription>Password of the user</FormDescription>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting || !!isMutating}
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image URL</FormLabel>
              <FormDescription>
                You can enter the image url for the user profile
              </FormDescription>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting || !!isMutating}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={form.formState.isSubmitting || !!isMutating}
          type="submit"
        >
          {form.formState.isSubmitting || !!isMutating ? (
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
      </form>
    </Form>
  );
};

const ProfileView = ({ userSession }: { userSession: User }) => {
  const { toast } = useToast();
  const { update, data } = useSession();
  const [defaultValue, setDefaultValue] = useState<UserInput>();

  const {
    data: userData,
    isLoading,
    isRefetching,
  } = api.organization.getUser.useQuery(
    { userId: userSession.id },
    {
      enabled: !!userSession.id,
      staleTime: Infinity,
    }
  );

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading: isEditing } =
    api.organization.updateUser.useMutation({
      onSuccess: async ({ updatedUser }) => {
        toast({
          title: "Edit",
          description: "Profile edited successfully",
        });

        await update({
          user: {
            name: updatedUser.name,
            surname: updatedUser.surname,
            image: updatedUser.image,
          },
        });

        await trpcContext.organization.getUser.invalidate({
          userId: userSession.id,
        });
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error editing profile",
          description: err.message,
        });
      },
    });

  const onSubmit = async (data: UserInput) => {
    toast({
      title: "Edit",
      description: "Editing profile...",
    });
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  const setDefaultValues = useCallback(() => {
    if (!userData?.user) return;

    setDefaultValue({
      id: userData.user.id,
      name: userData.user.name,
      surname: userData.user.surname,
      email: userData.user.email,
      imageUrl: userData.user.image ?? undefined,
    });
  }, [userData?.user]);

  useEffect(() => {
    if (!isLoading && userData?.user) {
      setDefaultValues();
    }
  }, [isLoading, setDefaultValues, userData?.user]);

  useEffect(() => {
    console.log("usersess", data?.user);
  }, [data?.user]);

  return (
    <div className="flex w-3/4 flex-col items-center justify-start pt-12 lg:w-2/5">
      <h1 className="text-2xl font-bold">Edit Profile</h1>
      {!isLoading && !isRefetching && defaultValue ? (
        <EditUserForm
          onSubmit={onSubmit}
          isMutating={isEditing}
          defaultValue={defaultValue}
        />
      ) : (
        <div className="flex w-full items-center justify-center pt-20">
          <Oval
            height={50}
            width={50}
            strokeWidth={5}
            strokeWidthSecondary={3}
            color="#F8FAFC"
            secondaryColor="#0F1729"
          />
        </div>
      )}
    </div>
  );
};

// const OrganizationView = ({ userSession }: { userSession: User }) => {
//   return <div></div>;
// };

const Organization: NextPage = (props) => {
  const session = useSession();

  return (
    <>
      <Head>
        <title>Organization | TimetablePro</title>
        <meta name="description" content="TimetablePro Organization" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex w-full flex-col md:flex-row">
          {session.status === "authenticated" ? (
            <>
              <ProfileView userSession={session.data.user} />
              {/* <OrganizationView userSession={session.data.user} /> */}
            </>
          ) : (
            <FullPageLoader />
          )}
        </div>
      </Layout>
    </>
  );
};

export default Organization;
