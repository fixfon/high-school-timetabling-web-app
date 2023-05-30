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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/components/ui/use-toast";
import organizationSchema from "~/schemas/organization";
import { type OrganizationInput } from "~/schemas/organization";
import userSchema, { type UserInput } from "~/schemas/user";
import { api } from "~/utils/api";
import { signOut } from "next-auth/react";
import { Separator } from "~/components/ui/separator";

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
          className="w-3/5 self-center"
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
  const { update } = useSession();
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

  return (
    <div className="flex w-full flex-col items-center justify-start pt-12 lg:w-1/2">
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

type EditOrganizationFormProps = {
  defaultValue?: OrganizationInput;
  onSubmit: (data: OrganizationInput) => Promise<void>;
  isMutating?: boolean;
};

const EditOrganizationForm = ({
  defaultValue,
  onSubmit,
  isMutating,
}: EditOrganizationFormProps) => {
  const defaultValues = useMemo(() => {
    return {
      id: defaultValue?.id ?? undefined,
      name: defaultValue?.name ?? "",
      description: defaultValue?.description ?? "",
      contact: defaultValue?.contact ?? "",
      startHour: defaultValue?.startHour ?? "09:00",
      breakMinute: defaultValue?.breakMinute ?? 10,
      lunchMinute: defaultValue?.lunchMinute ?? 40,
    };
  }, [defaultValue]);

  const form = useForm<OrganizationInput>({
    resolver: zodResolver(organizationSchema),
    mode: "onChange",
    defaultValues: defaultValues,
  });

  const formSubmit = async (data: OrganizationInput) => {
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
              <FormDescription>Name of the organization</FormDescription>
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
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact</FormLabel>
              <FormDescription>
                Contact number for the organization
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormDescription>
                Description for the organization
              </FormDescription>
              <FormControl>
                <Textarea
                  disabled={form.formState.isSubmitting || !!isMutating}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Hour</FormLabel>
              <FormDescription>
                Set the lesson start hour for the organization
              </FormDescription>
              <FormControl>
                <Input
                  type="time"
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
          name="breakMinute"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Break Time</FormLabel>
              <FormDescription>
                Set the break time between lessons for the organization (in
                minutes)
              </FormDescription>
              <FormControl>
                <Input
                  type="number"
                  disabled={form.formState.isSubmitting || !!isMutating}
                  inputMode="numeric"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lunchMinute"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lunch Time</FormLabel>
              <FormDescription>
                Set the lunch time for the organization (in minutes)
              </FormDescription>
              <FormControl>
                <Input
                  type="number"
                  disabled={form.formState.isSubmitting || !!isMutating}
                  inputMode="numeric"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="w-3/5 self-center"
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

const DeleteOrganization = ({ organizationId }: { organizationId: string }) => {
  const { toast } = useToast();

  const { mutateAsync, isLoading } =
    api.organization.deleteOrganization.useMutation({
      onSuccess: async () => {
        toast({
          title: "Edit",
          description: "Organization deleted successfully",
        });

        await signOut({ callbackUrl: "/" });
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error deleting organization",
          description: err.message,
        });
      },
    });

  const handleDelete = async () => {
    toast({
      title: "Delete",
      description: "Deleting organization...",
    });
    try {
      await mutateAsync({
        organizationId: organizationId,
      });
    } catch (err) {}
  };
  2;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="mt-10 w-2/5"
          variant="destructive"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Oval
                height={20}
                width={20}
                strokeWidth={4}
                strokeWidthSecondary={3}
                color="#5090FF"
                secondaryColor="#FFFFFF"
              />
              <span>Delete Organization</span>
            </>
          ) : (
            "Delete Organization"
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your organization, teachers, classrooms,
            timetables from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="font-semibold" onClick={handleDelete}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const OrganizationView = ({ userSession }: { userSession: User }) => {
  const { toast } = useToast();
  const [defaultValue, setDefaultValue] = useState<OrganizationInput>();

  const {
    data: organizationData,
    isLoading,
    isRefetching,
  } = api.organization.getOrganization.useQuery(undefined, {
    enabled: !!userSession.orgId,
    staleTime: Infinity,
  });

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading: isEditing } =
    api.organization.updateOrganization.useMutation({
      onSuccess: async () => {
        toast({
          title: "Edit",
          description: "Organization edited successfully",
        });

        await trpcContext.organization.getOrganization.invalidate();
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error editing organization",
          description: err.message,
        });
      },
    });

  const onSubmit = async (data: OrganizationInput) => {
    toast({
      title: "Edit",
      description: "Editing organization...",
    });
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  const setDefaultValues = useCallback(() => {
    if (!organizationData?.organization) return;

    setDefaultValue({
      id: organizationData?.organization.id,
      name: organizationData?.organization.name,
      contact: organizationData?.organization.contact ?? "",
      description: organizationData?.organization.description ?? "",
      startHour:
        organizationData?.organization.OrganizationClassHour?.startHour ??
        "09:00",
      breakMinute:
        organizationData?.organization.OrganizationClassHour?.breakMinute ?? 10,
      lunchMinute:
        organizationData?.organization.OrganizationClassHour?.lunchMinute ?? 40,
    });
  }, [organizationData?.organization]);

  useEffect(() => {
    if (!isLoading && organizationData?.organization) {
      setDefaultValues();
    }
  }, [isLoading, setDefaultValues, organizationData?.organization]);

  return (
    <div className="flex w-full flex-col items-center justify-start pt-12 lg:w-1/2">
      <h1 className="text-2xl font-bold">Edit Organization</h1>
      {!isLoading && !isRefetching && defaultValue ? (
        <>
          <EditOrganizationForm
            onSubmit={onSubmit}
            isMutating={isEditing}
            defaultValue={defaultValue}
          />
          {userSession.orgId && (
            <DeleteOrganization organizationId={userSession.orgId} />
          )}
        </>
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
              {session.data.user.memberRole !== "TEACHER" && (
                <>
                  <Separator
                    orientation="vertical"
                    className="my-auto h-[90%]"
                  />
                  <OrganizationView userSession={session.data.user} />
                </>
              )}
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
