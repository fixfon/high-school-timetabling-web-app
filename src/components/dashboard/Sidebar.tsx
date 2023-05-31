import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    console.log("isCollapsed", isCollapsed);
  }, [isCollapsed]);

  return (
    <nav
      onClick={(e) => {
        // click outside
        if (
          sidebarRef.current &&
          !sidebarRef.current.contains(e.target as Node)
        ) {
          setIsCollapsed(false);
        }
      }}
      className={cn(
        "lg:relative max-lg:h-full lg:min-h-[calc(100vh-56px)] w-full transition-all lg:max-w-[20%]",
        isCollapsed
          ? "max-lg:absolute max-lg:z-10 max-lg:cursor-pointer max-lg:bg-gray-700 max-lg:bg-opacity-50 max-lg:backdrop-blur"
          : "max-lg:hidden"
      )}
    >
      <div
        ref={sidebarRef}
        className="relative h-full w-full max-lg:w-2/3 max-lg:bg-background"
      >
        {session?.user.role === "SUPERADMIN" ? (
          <div className="flex h-[66%] flex-col items-start justify-center space-y-8 font-medium">
            <div
              className={cn(
                "w-11/12 cursor-pointer rounded-lg py-2 hover:bg-accent lg:w-3/4 lg:px-4",
                router.pathname === "/admin" && "bg-accent"
              )}
            >
              <Link
                className="flex items-center gap-1 max-lg:pl-4 xl:gap-4"
                href="/admin"
              >
                <PanelTop size={24} />
                <span>Dashboard</span>
              </Link>
            </div>
            <div
              className={cn(
                "w-11/12 cursor-pointer rounded-lg py-2 hover:bg-accent lg:w-3/4 lg:px-4",
                router.pathname === "/admin/lessons" && "bg-accent"
              )}
            >
              <Link
                className="flex items-center gap-1 max-lg:pl-4 xl:gap-4"
                href="/admin/lessons"
              >
                <ScrollText size={24} />
                <span>Lessons</span>
              </Link>
            </div>
            <div
              className={cn(
                "w-11/12 cursor-pointer rounded-lg py-2 hover:bg-accent lg:w-3/4 lg:px-4",
                router.pathname === "/admin/departments" && "bg-accent"
              )}
            >
              <Link
                className="flex items-center gap-1 max-lg:pl-4 xl:gap-4"
                href="/admin/departments"
              >
                <Group size={24} />
                <span>Departments</span>
              </Link>
            </div>
            <div
              className={cn(
                "w-11/12 cursor-pointer rounded-lg py-2 hover:bg-accent lg:w-3/4 lg:px-4",
                router.pathname === "/admin/organizations" && "bg-accent"
              )}
            >
              <Link
                className="flex items-center gap-1 max-lg:pl-4 xl:gap-4"
                href="/admin/organizations"
              >
                <School size={24} />
                <span>Organizations</span>
              </Link>
            </div>
            <div
              className={cn(
                "w-11/12 cursor-pointer rounded-lg py-2 hover:bg-accent lg:w-3/4 lg:px-4",
                router.pathname === "/admin/users" && "bg-accent"
              )}
            >
              <Link
                className="flex items-center gap-1 max-lg:pl-4 xl:gap-4"
                href="/admin/users"
              >
                <Users2 size={24} />
                <span>Users</span>
              </Link>
            </div>
          </div>
        ) : session?.user.memberRole === "MANAGER" ? (
          <div className="flex h-[66%] flex-col items-start justify-center space-y-8 font-medium">
            <div
              className={cn(
                "w-11/12 cursor-pointer rounded-lg py-2 hover:bg-accent lg:w-3/4 lg:px-4",
                router.pathname === "/dashboard" && "bg-accent"
              )}
            >
              <Link
                className="flex items-center gap-1 max-lg:pl-4 xl:gap-4"
                href="/dashboard"
              >
                <PanelTop size={24} />
                <span>Dashboard</span>
              </Link>
            </div>
            <div
              className={cn(
                "w-11/12 cursor-pointer rounded-lg py-2 hover:bg-accent lg:w-3/4 lg:px-4",
                router.pathname === "/dashboard/teachers" && "bg-accent"
              )}
            >
              <Link
                className="flex items-center gap-1 max-lg:pl-4 xl:gap-4"
                href="/dashboard/teachers"
              >
                <Users2 size={24} />
                <span>Teachers</span>
              </Link>
            </div>
            <div
              className={cn(
                "w-11/12 cursor-pointer rounded-lg py-2 hover:bg-accent lg:w-3/4 lg:px-4",
                router.pathname === "/dashboard/classrooms" && "bg-accent"
              )}
            >
              <Link
                className="flex items-center gap-1 max-lg:pl-4 xl:gap-4"
                href="/dashboard/classrooms"
              >
                <GraduationCap size={24} />
                <span>Classrooms</span>
              </Link>
            </div>
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="w-3/4"
            >
              <div className="flex items-center justify-start rounded-lg px-4 py-2">
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
                  <Link
                    className="max-lg:px-4"
                    href={"/dashboard/timetables/create"}
                  >
                    <span>Create Timetable</span>
                  </Link>
                </div>

                <div
                  className={cn(
                    "cursor-pointer rounded-lg py-2 text-base font-normal hover:bg-accent lg:px-4",
                    router.pathname === "/dashboard/timetables" && "bg-accent"
                  )}
                >
                  <Link className="max-lg:px-4" href={"/dashboard/timetables"}>
                    <span>View Timetables</span>
                  </Link>
                </div>
              </CollapsibleContent>
            </Collapsible>
            <div
              className={cn(
                "w-11/12 cursor-pointer rounded-lg py-2 hover:bg-accent lg:w-3/4 lg:px-4",
                router.pathname === "/dashboard/organization" && "bg-accent"
              )}
            >
              <Link
                className="flex items-center gap-1 max-lg:pl-4 xl:gap-4"
                href="/dashboard/organization"
              >
                <School size={24} />
                <span>Organization</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex h-[66%] flex-col items-start justify-center space-y-8 font-medium">
            <div
              className={cn(
                "w-11/12 cursor-pointer rounded-lg py-2 hover:bg-accent lg:w-3/4 lg:px-4",
                router.pathname === "/dashboard" && "bg-accent"
              )}
            >
              <Link
                className="flex items-center gap-1 max-lg:pl-4 xl:gap-4"
                href="/dashboard"
              >
                <PanelTop size={24} />
                <span>Dashboard</span>
              </Link>
            </div>
            <div
              className={cn(
                "w-11/12 cursor-pointer rounded-lg py-2 hover:bg-accent lg:w-3/4 lg:px-4",
                router.pathname === "/dashboard/timetables" && "bg-accent"
              )}
            >
              <Link
                className="flex items-center gap-1 max-lg:pl-4 xl:gap-4"
                href="/dashboard/timetables"
              >
                <CalendarClock size={24} />
                <span>View Timetable</span>
              </Link>
            </div>
            <div
              className={cn(
                "w-11/12 cursor-pointer rounded-lg py-2 hover:bg-accent lg:w-3/4 lg:px-4",
                router.pathname === "/dashboard/organization" && "bg-accent"
              )}
            >
              <Link
                className="flex items-center gap-1 max-lg:pl-4 xl:gap-4"
                href="/dashboard/organization"
              >
                <School size={24} />
                <span>Account</span>
              </Link>
            </div>
          </div>
        )}
        <Separator className="absolute right-0 top-0" orientation="vertical" />
      </div>
    </nav>
  );
}
