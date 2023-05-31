import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Layout from "~/components/dashboard/Layout";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
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

const DashboardHome: NextPage = (props) => {
  const { data: session, status } = useSession();
  const { data: orgStatsData, isLoading: isOrgStatsLoading } =
    api.organization.getDashboardStats.useQuery(undefined, {
      staleTime: Infinity,
      enabled:
        status === "authenticated" && session.user.memberRole === "MANAGER",
    });

  return (
    <>
      <Head>
        <title>Dashboard | TimetablePro</title>
        <meta name="description" content="TimetablePro Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="w-full py-8">
          <h1 className="text-center text-2xl font-bold">
            Welcome Back,{" "}
            <span className="font-medium italic">
              {session?.user.name} {session?.user.surname}
            </span>
          </h1>
          <h2 className="mb-8 mt-6 text-center text-xl font-bold">
            {orgStatsData?.orgName && orgStatsData.orgName}
          </h2>
          {session?.user.memberRole === "MANAGER" && orgStatsData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title={"Teacher Count"}
                  content={orgStatsData.teacherCount || 0}
                />
                <StatCard
                  title={"Classroom Count"}
                  content={orgStatsData.classroomCount || 0}
                />
                <StatCard
                  title={"User Account Count"}
                  content={orgStatsData.userAccountCount || 0}
                />
                <StatCard
                  title={"Teachers That Have Class Today"}
                  content={orgStatsData.teachersWithClassesTodayCount || 0}
                />
              </div>
            </>
          )}
          {session?.user.memberRole === "TEACHER" && orgStatsData && (
            <>
              <div className="grid grid-cols-1 justify-items-center md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title="Your Department"
                  content={orgStatsData?.departmentName || ""}
                />
                <StatCard
                  title="Your Classes for Today"
                  content={orgStatsData?.classesTodayCount || ""}
                />
                <div className="col-start-1 mx-4 w-full rounded-lg border lg:col-end-4 lg:w-4/5">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hour</TableHead>
                        <TableHead>Lesson</TableHead>
                        <TableHead>Classroom</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orgStatsData?.classesToday?.map((classToday, index) => (
                        <TableRow key={index}>
                          <td>{classToday.classHour}</td>
                          <td>{classToday.lessonName}</td>
                          <td>{classToday.classroomName}</td>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
          {status === "loading" ||
            (isOrgStatsLoading && (
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

export default DashboardHome;
