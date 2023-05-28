import type { Organization, User } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import Layout from "~/components/dashboard/Layout";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";

const organizationTableColumns: ColumnDef<
  Organization & {
    OrganizationManager: User;
  }
>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "contact",
    header: "Contact",
  },
  {
    accessorKey: "OrganizationManager",
    header: "Manager",
    cell: ({ row }) => {
      const { OrganizationManager } = row.original;
      return (
        <>
          {OrganizationManager.name} {OrganizationManager.surname}
        </>
      );
    },
  },
  {
    accessorKey: "OrganizationManager_email",
    header: "Manager Email",
    cell: ({ row }) => {
      const { OrganizationManager } = row.original;
      return <>{OrganizationManager.email}</>;
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
    accessorKey: "delete",
    header: "",
    cell: ({ row }) => {
      const { id } = row.original;
      return <DeleteOrganizationButton id={id} />;
    },
  },
];

const DeleteOrganizationButton = ({ id }: { id: string }) => {
  const { toast } = useToast();
  const trpcContext = api.useContext();

  const { mutateAsync, isLoading } =
    api.organization.deleteOrganization.useMutation({
      onSuccess: async () => {
        toast({
          title: "Delete",
          description: "Organization deleted successfully",
        });

        // validate data
        await trpcContext.organization.getOrganizations.invalidate();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Delete",
          description: "Error deleting organization",
        });
      },
    });

  const handleDelete = async () => {
    toast({
      title: "Delete",
      description: "Deleting organization...",
    });
    await mutateAsync({ organizationId: id });
  };

  return (
    <Button disabled={isLoading} variant="destructive" onClick={handleDelete}>
      <Trash2 className="h-5 w-5" />
    </Button>
  );
};

const OrganizationTableView = () => {
  const { data: organizationData, isLoading } =
    api.organization.getOrganizations.useQuery();

  return (
    <div className="w-full pt-8 lg:w-4/5">
      <DataTable
        columns={organizationTableColumns}
        data={organizationData?.organizations ?? []}
        isLoading={isLoading}
      />
    </div>
  );
};

const Organizations: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Manage Organizations | TimetablePro</title>
        <meta
          name="description"
          content="TimetablePro Admin Manage Organizations"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex w-full flex-col items-center">
          <h1 className="pt-12 text-center text-2xl font-bold">
            Organization List
          </h1>
          <OrganizationTableView />
        </div>
      </Layout>
    </>
  );
};

export default Organizations;
