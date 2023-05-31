import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Layout from "~/components/dashboard/Layout";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";
import { cn } from "~/utils/cn";

const StatCardLoading = () => {
  return (
    <Skeleton className="m-8 h-max w-80 rounded-lg border bg-background p-8 shadow-sm" />
  );
};

const StatCard = ({
  className,
  title,
  content,
}: {
  className?: string | undefined;
  title: string;
  content: string | number;
}) => {
  return (
    <div
      className={cn(
        "m-8 h-[190px] w-80 rounded-lg border bg-background p-8 text-card-foreground shadow-sm",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <h1 className="w-full break-keep border-b pb-2 text-center text-2xl font-bold">
          {title}
        </h1>
        <p className="text-4xl">{content}</p>
      </div>
    </div>
  );
};

const AdminHome: NextPage = (props) => {
  const { data: session, status } = useSession();
  const { data: adminStatsData, isLoading: isAdminStatsLoading } =
    api.organization.getAdminStats.useQuery(undefined, {
      staleTime: Infinity,
      enabled: status === "authenticated" && session.user.role === "SUPERADMIN",
    });

  return (
    <>
      <Head>
        <title>Admin Dashboard | TimetablePro</title>
        <meta name="description" content="TimetablePro Admin Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="w-full py-8 px-2 lg:px-0">
          <h1 className="text-center text-2xl font-bold">
            Welcome Back,{" "}
            <span className="font-medium italic">
              {session?.user.name} {session?.user.surname}
            </span>
          </h1>
          {session?.user.role === "SUPERADMIN" && adminStatsData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title={"Organization Count"}
                  content={adminStatsData.organizationCount || 0}
                />
                <StatCard
                  title={"User Count"}
                  content={adminStatsData.userCount || 0}
                />
                <StatCard
                  title={"Teacher Count"}
                  content={adminStatsData.teacherCount || 0}
                />
                <StatCard
                  title={"Lesson Count"}
                  content={adminStatsData.lessonCount || 0}
                />
                <StatCard
                  title={"Department Count"}
                  content={adminStatsData.departmentCount || 0}
                />
              </div>
            </>
          )}
          {status === "loading" ||
            (isAdminStatsLoading && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <StatCardLoading />
                  <StatCardLoading />
                  <StatCardLoading />
                </div>
              </>
            ))}
        </div>
      </Layout>
    </>
  );
};

export default AdminHome;
