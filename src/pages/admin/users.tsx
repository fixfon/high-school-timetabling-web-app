import { zodResolver } from "@hookform/resolvers/zod";
import type { Organization, Teacher, User } from "@prisma/client";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useReducer, useState } from "react";
import { useForm } from "react-hook-form";
import { Oval } from "react-loader-spinner";
import Layout from "~/components/dashboard/Layout";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { useToast } from "~/components/ui/use-toast";
import userSchema, { type UserInput } from "~/schemas/user";
import { api } from "~/utils/api";

const roleMap = {
  MANAGER: "Organization Manager",
  TEACHER: "Teacher",
  SUPERADMIN: "Super Admin",
};

const userTableColumns: ColumnDef<
  User & {
    Teacher: Teacher | null;
    OrganizationMember: Organization | null;
    OrganizationManager: Organization | null;
  }
>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Full Name",
    cell: ({ row }) => {
      const { name, surname } = row.original;
      return (
        <>
          {name} {surname}
        </>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "OrganizationMember",
    header: "Organization",
    cell: ({ row }) => {
      const { OrganizationMember } = row.original;
      return <>{OrganizationMember?.name ?? "None"}</>;
    },
  },
  {
    accessorKey: "globalRole",
    header: "Role",
    cell: ({ row }) => {
      const { globalRole, memberRole } = row.original;

      if (memberRole) {
        return <>{roleMap[memberRole]}</>;
      }

      if (globalRole === "SUPERADMIN") {
        return <>{roleMap[globalRole]}</>;
      }
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const { createdAt } = row.original;
      return (
        <>
          {new Date(createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </>
      );
    },
  },
  {
    accessorKey: "edit",
    header: "",
    cell: ({ row }) => {
      return <EditUser row={row} />;
    },
  },
  {
    accessorKey: "delete",
    header: "",
    cell: ({ row }) => {
      const { id } = row.original;
      return <DeleteUserButton id={id} />;
    },
  },
];

const DeleteUserButton = ({ id }: { id: string }) => {
  const { toast } = useToast();
  const trpcContext = api.useContext();

  const { mutateAsync, isLoading } = api.organization.deleteUser.useMutation({
    onSuccess: async () => {
      toast({
        title: "Delete",
        description: "User deleted successfully",
      });

      // validate data
      await trpcContext.organization.getUsers.invalidate();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Delete",
        description: "Error deleting user",
      });
    },
  });

  const handleDelete = async () => {
    toast({
      title: "Delete",
      description: "Deleting user...",
    });
    await mutateAsync({ userId: id });
  };

  return (
    <Button disabled={isLoading} variant="destructive" onClick={handleDelete}>
      <Trash2 className="h-5 w-5" />
    </Button>
  );
};

const UserTableView = () => {
  const { data: userData, isLoading } = api.organization.getUsers.useQuery();

  return (
    <div className="w-full px-2 pt-6 lg:w-4/5 lg:px-0">
      <DataTable
        columns={userTableColumns}
        data={userData?.users ?? []}
        isLoading={isLoading}
      />
    </div>
  );
};

type UserFormProps = {
  defaultValue?: UserInput;
  onSubmit: (data: UserInput) => Promise<void>;
  isMutating?: boolean;
};

const UserForm = ({ defaultValue, onSubmit, isMutating }: UserFormProps) => {
  const form = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: {
      id: defaultValue?.id ?? undefined,
      name: defaultValue?.name ?? "",
      surname: defaultValue?.surname ?? "",
      email: defaultValue?.email ?? "",
      password: "",
    },
  });

  const formSubmit = async (data: UserInput) => {
    await onSubmit(data);
    form.reset();
  };

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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type EditUserProps = {
  row: Row<
    User & {
      Teacher: Teacher | null;
      OrganizationMember: Organization | null;
      OrganizationManager: Organization | null;
    }
  >;
};

const EditUser = ({ row }: EditUserProps) => {
  const { toast } = useToast();
  const rerender = useReducer(() => ({}), {})[1];
  const [windowSize, setWindowSize] = useState([1440, 1070]);
  const [openSheet, setOpenSheet] = useState(false);
  const [defaultValue, setDefaultValue] = useState<UserInput>();

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading: isEditing } =
    api.organization.updateUser.useMutation({
      onSuccess: async () => {
        toast({
          title: "Edit",
          description: "User edited successfully",
        });

        // invalidate teacher table
        await trpcContext.organization.getUsers.invalidate();
        rerender();
        // close the sheet
        void wait(1000).then(() => setOpenSheet(false));
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error editing user",
          description: err.message,
        });
      },
    });

  const onSubmit = async (data: UserInput) => {
    toast({
      title: "Edit",
      description: "Editing user...",
    });
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  const setDefaultValues = useCallback(() => {
    const { id, email, password, name, surname } = row.original;

    setDefaultValue({
      id,
      email,
      password,
      name,
      surname,
    });
  }, [row.original]);

  useEffect(() => {
    if (openSheet) {
      setDefaultValues();
    }
  }, [openSheet, setDefaultValues]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  useEffect(() => {
    setWindowSize([window.innerWidth, window.innerHeight]);
  }, []);

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetTrigger asChild>
        <Button variant="default">Edit</Button>
      </SheetTrigger>

      <SheetContent
        className="overflow-y-auto"
        size={windowSize.at(0)! <= 1024 ? "full" : "default"}
      >
        <SheetHeader>
          <SheetTitle>
            Edit User {row.original.name} {row.original.surname}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-start pt-6">
          {defaultValue ? (
            <UserForm
              onSubmit={onSubmit}
              isMutating={isEditing}
              defaultValue={defaultValue}
            />
          ) : (
            <Oval
              height={80}
              width={80}
              strokeWidth={4}
              strokeWidthSecondary={3}
              color="#5090FF"
              secondaryColor="#FFFFFF"
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Users: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Manage Users | TimetablePro</title>
        <meta name="description" content="TimetablePro Admin Manage Users" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex w-full flex-col items-center">
          <h1 className="pt-6 text-center text-2xl font-bold">User List</h1>
          <p className="w-full px-2 pt-2 text-sm text-muted-foreground lg:w-4/5 lg:px-0">
            You can edit or delete the organization manager, teacher or super
            admin accounts. If you delete an organization manager account, the
            entire organization records are deleted.
          </p>
          <UserTableView />
        </div>
      </Layout>
    </>
  );
};

export default Users;
