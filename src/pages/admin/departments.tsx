import { zodResolver } from "@hookform/resolvers/zod";
import { type Department } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
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
import { useToast } from "~/components/ui/use-toast";
import departmentSchema, { type DepartmentInput } from "~/schemas/department";
import { api } from "~/utils/api";

type DepartmentFormProps = {
  onSubmit: (data: DepartmentInput) => Promise<void>;
  isMutating?: boolean;
};

const DepartmentForm = ({ onSubmit, isMutating }: DepartmentFormProps) => {
  const form = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  const formSubmit = async (data: DepartmentInput) => {
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
              <FormDescription>
                Enter the name of the department
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

const CreateDepartment = () => {
  const { toast } = useToast();

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading } = api.department.createDepartment.useMutation({
    onSuccess: () => {
      toast({
        title: "Create",
        description: "Department created successfully",
      });
      // invalidate department table
      void trpcContext.department.getDepartments.invalidate();
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error creating department",
        description: err.message,
      });
    },
  });

  const onSubmit = async (data: DepartmentInput) => {
    toast({
      title: "Create",
      description: "Creating department...",
    });
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  return (
    <div className="flex w-3/4 flex-col items-center justify-start pt-12 lg:w-2/5">
      <h1 className="text-2xl font-bold">Create Department</h1>
      <DepartmentForm onSubmit={onSubmit} isMutating={isLoading} />
    </div>
  );
};

const departmentTableColumns: ColumnDef<Department>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
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
    accessorKey: "delete",
    header: "",
    cell: ({ row }) => {
      const { id } = row.original;
      return <DeleteDepartmentButton id={id} />;
    },
  },
];

const DeleteDepartmentButton = ({ id }: { id: string }) => {
  const { toast } = useToast();
  const trpcContext = api.useContext();

  const { mutateAsync, isLoading } =
    api.department.deleteDepartment.useMutation({
      onSuccess: async () => {
        toast({
          title: "Delete",
          description: "Department deleted successfully",
        });

        // validate data
        await trpcContext.department.getDepartments.invalidate();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Delete",
          description: "Error deleting department",
        });
      },
    });

  const handleDelete = async () => {
    toast({
      title: "Delete",
      description: "Deleting department...",
    });
    await mutateAsync({ departmentId: id });
  };

  return (
    <Button disabled={isLoading} variant="destructive" onClick={handleDelete}>
      <Trash2 className="h-5 w-5" />
    </Button>
  );
};

const DepartmentTableView = () => {
  const { data: departmentData, isLoading } =
    api.department.getDepartments.useQuery();

  return (
    <div className="w-full pt-12 lg:w-3/5">
      <DataTable
        columns={departmentTableColumns}
        data={departmentData?.departments ?? []}
        isLoading={isLoading}
      />
    </div>
  );
};

const Departments: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Manage Departments | TimetablePro</title>
        <meta
          name="description"
          content="TimetablePro Admin Manage Departments"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex w-full flex-col md:flex-row">
          <CreateDepartment />
          <DepartmentTableView />
        </div>
      </Layout>
    </>
  );
};

export default Departments;
