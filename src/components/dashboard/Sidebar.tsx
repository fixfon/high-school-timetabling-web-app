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
    <nav className="relative h-[calc(100vh-56px)] w-full max-w-[20%]">
      {session?.user.memberRole === "MANAGER" ? (
        <div className="flex h-[66%] flex-col items-start justify-center space-y-8 font-medium">
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg px-4 py-2 hover:bg-accent",
              router.pathname === "/dashboard" && "bg-accent"
            )}
          >
            <Link className="flex items-center gap-4" href="/dashboard">
              <PanelTop />
              <span>Dashboard</span>
            </Link>
          </div>
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg px-4 py-2 hover:bg-accent",
              router.pathname === "/dashboard/teachers" && "bg-accent"
            )}
          >
            <Link
              className="flex items-center gap-4"
              href="/dashboard/teachers"
            >
              <Users2 />
              <span>Teachers</span>
            </Link>
          </div>
          <div
            className={cn(
              "w-3/4 cursor-pointer rounded-lg px-4 py-2 hover:bg-accent",
              router.pathname === "/dashboard/classrooms" && "bg-accent"
            )}
          >
            <Link
              className="flex items-center gap-4"
              href="/dashboard/classrooms"
            >
              <GraduationCap />
              <span>Classrooms</span>
            </Link>
          </div>
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-3/4">
            <div className="flex items-center justify-start rounded-lg px-4 py-2">
              <h4 className="flex items-center gap-4">
                <CalendarClock />
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
                  "cursor-pointer rounded-lg px-4 py-2 text-base font-normal hover:bg-accent",
                  router.pathname === "dashboard/timetables/create" &&
                    "bg-accent"
                )}
              >
                <Link href={"/dashboard/timetables/create"}>
                  Create Timetable
                </Link>
              </div>

              <div
                className={cn(
                  "cursor-pointer rounded-lg px-4 py-2 text-base font-normal hover:bg-accent",
                  router.pathname === "/dashboard/timetables/view" &&
                    "bg-accent"
                )}
              >
                <Link href={"/dashboard/timetables/view"}>View Timetables</Link>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <div className="w-3/4 cursor-pointer rounded-lg px-4 py-2 hover:bg-accent">
            <Link
              className="flex items-center gap-4"
              href="/dashboard/organization"
            >
              <School />
              <span>Organization</span>
            </Link>
          </div>
        </div>
      ) : (
        <ul></ul>
      )}
      <Separator className="absolute right-0 top-0" orientation="vertical" />
    </nav>
  );
}
