import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  ChevronsUpDown,
  PanelTop,
  Users2,
  GraduationCap,
  CalendarClock,
  School,
  ScrollText,
  Group,
} from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useRouter } from "next/router";
import { cn } from "~/utils/cn";

export default function Sidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <nav className="relative h-[calc(100vh-56px)] w-full max-w-[10%] lg:max-w-[20%]">
      {session?.user.role === "SUPERADMIN" ? (
        <div className="flex h-[66%] flex-col items-start justify-center space-y-8 font-medium">
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg py-2 hover:bg-accent lg:px-4",
              router.pathname === "/admin" && "bg-accent"
            )}
          >
            <Link
              className="lg:flex lg:items-center lg:gap-1 xl:gap-4"
              href="/admin"
            >
              <PanelTop className="mx-auto lg:m-0" size={24} />
              <span className="hidden lg:block">Dashboard</span>
            </Link>
          </div>
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg py-2 hover:bg-accent lg:px-4",
              router.pathname === "/admin/lessons" && "bg-accent"
            )}
          >
            <Link
              className="lg:flex lg:items-center lg:gap-1 xl:gap-4"
              href="/admin/lessons"
            >
              <ScrollText size={24} className="mx-auto lg:m-0" />
              <span className="hidden lg:block">Lessons</span>
            </Link>
          </div>
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg py-2 hover:bg-accent lg:px-4",
              router.pathname === "/admin/departments" && "bg-accent"
            )}
          >
            <Link
              className="lg:flex lg:items-center lg:gap-1 xl:gap-4"
              href="/admin/departments"
            >
              <Group size={24} className="mx-auto lg:m-0" />
              <span className="hidden lg:block">Departments</span>
            </Link>
          </div>
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg px-4 py-2 hover:bg-accent",
              router.pathname === "/admin/organizations" && "bg-accent"
            )}
          >
            <Link
              className="lg:flex lg:items-center lg:gap-1 xl:gap-4"
              href="/admin/organizations"
            >
              <School size={24} className="mx-auto lg:m-0" />
              <span className="hidden lg:block">Organizations</span>
            </Link>
          </div>
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg px-4 py-2 hover:bg-accent",
              router.pathname === "/admin/users" && "bg-accent"
            )}
          >
            <Link
              className="lg:flex lg:items-center lg:gap-1 xl:gap-4"
              href="/admin/users"
            >
              <Users2 className="mx-auto lg:m-0" size={24} />
              <span className="hidden lg:block">Users</span>
            </Link>
          </div>
        </div>
      ) : session?.user.memberRole === "MANAGER" ? (
        <div className="flex h-[66%] flex-col items-start justify-center font-medium md:space-y-8">
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg py-2 hover:bg-accent lg:px-4",
              router.pathname === "/dashboard" && "bg-accent"
            )}
          >
            <Link
              className="lg:flex lg:items-center lg:gap-1 xl:gap-4"
              href="/dashboard"
            >
              <PanelTop className="mx-auto lg:m-0" size={24} />
              <span className="hidden lg:block">Dashboard</span>
            </Link>
          </div>
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg py-2 hover:bg-accent lg:px-4",
              router.pathname === "/dashboard/teachers" && "bg-accent"
            )}
          >
            <Link
              className="lg:flex lg:items-center lg:gap-1 xl:gap-4"
              href="/dashboard/teachers"
            >
              <Users2 className="mx-auto lg:m-0" size={24} />
              <span className="hidden lg:block">Teachers</span>
            </Link>
          </div>
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg py-2 hover:bg-accent lg:px-4",
              router.pathname === "/dashboard/classrooms" && "bg-accent"
            )}
          >
            <Link
              className="lg:flex lg:items-center lg:gap-1 xl:gap-4"
              href="/dashboard/classrooms"
            >
              <GraduationCap className="mx-auto lg:m-0" size={24} />
              <span className="hidden lg:block">Classrooms</span>
            </Link>
          </div>
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-3/4">
            <div className="hidden items-center justify-start rounded-lg px-4 py-2 lg:flex">
              <h4 className="flex items-center gap-1 xl:gap-4">
                <CalendarClock className="h-6 w-6" />
                <span>Timetables</span>
              </h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <ChevronsUpDown className="h-4 w-4" />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="flex flex-col items-center justify-center">
              <div
                className={cn(
                  "cursor-pointer rounded-lg py-2 text-base font-normal hover:bg-accent lg:px-4",
                  router.pathname === "dashboard/timetables/create" &&
                    "bg-accent"
                )}
              >
                <Link href={"/dashboard/timetables/create"}>
                  <CalendarClock
                    size={24}
                    className="mx-auto lg:m-0 lg:hidden"
                  />
                  <span className="hidden lg:block">Create Timetable</span>
                </Link>
              </div>

              <div
                className={cn(
                  "cursor-pointer rounded-lg py-2 text-base font-normal hover:bg-accent lg:px-4",
                  router.pathname === "/dashboard/timetables" && "bg-accent"
                )}
              >
                <Link href={"/dashboard/timetables"}>
                  <CalendarClock
                    size={24}
                    className="mx-auto lg:m-0 lg:hidden"
                  />
                  <span className="hidden lg:block">View Timetables</span>
                </Link>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg py-2 hover:bg-accent lg:px-4",
              router.pathname === "/dashboard/organization" && "bg-accent"
            )}
          >
            <Link
              className="lg:flex lg:items-center lg:gap-1 xl:gap-4"
              href="/dashboard/organization"
            >
              <School size={24} className="mx-auto lg:m-0" />
              <span className="hidden lg:block">Organization</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex h-[66%] flex-col items-start justify-center space-y-8 font-medium">
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg py-2 hover:bg-accent lg:px-4",
              router.pathname === "/dashboard" && "bg-accent"
            )}
          >
            <Link
              className="lg:flex lg:items-center lg:gap-1 xl:gap-4"
              href="/dashboard"
            >
              <PanelTop size={24} className="mx-auto lg:m-0" />
              <span className="hidden lg:block">Dashboard</span>
            </Link>
          </div>
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg px-4 py-2 hover:bg-accent",
              router.pathname === "/dashboard/timetables" && "bg-accent"
            )}
          >
            <Link
              className="lg:flex lg:items-center lg:gap-1 xl:gap-4"
              href="/dashboard/timetables"
            >
              <CalendarClock size={24} className="mx-auto lg:m-0" />
              <span className="hidden lg:block">View Timetable</span>
            </Link>
          </div>
        </div>
      )}
      <Separator className="absolute right-0 top-0" orientation="vertical" />
    </nav>
  );
}
