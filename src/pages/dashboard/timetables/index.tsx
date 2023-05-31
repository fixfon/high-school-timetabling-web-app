import type { NextPage } from "next";
import Head from "next/head";
import Layout from "~/components/dashboard/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/utils/api";
import uuid from "react-uuid";
import { cn } from "~/utils/cn";
import { useSession } from "next-auth/react";
import { type Dispatch, type SetStateAction, useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import { Oval } from "react-loader-spinner";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ClassLevelMap } from "~/utils/enum-mapper";
import type { Class, Classroom, Teacher } from "@prisma/client";

const TimetableSkeleton = ({}: {
  isLoading: boolean;
  timetable:
    | (Class & {
        Classroom: Classroom;
      })[]
    | (Class & {
        Teacher: Teacher;
      })[];
}) => {
  const { data: orgDailyHourData, isLoading: isOrgHourLoading } =
    api.organization.getOrganizationClassHours.useQuery(undefined, {
      staleTime: Infinity,
    });

  return (
    <div className="h-max w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-max">Hour / Day</TableHead>
            <TableHead>Monday</TableHead>
            <TableHead>Tuesday</TableHead>
            <TableHead>Wednesday</TableHead>
            <TableHead>Thursday</TableHead>
            <TableHead>Friday</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isOrgHourLoading &&
            orgDailyHourData?.orgDailyHourMap &&
            orgDailyHourData.orgDailyHourMap.map((hourRange) => (
              <TableRow
                key={uuid()}
                className={cn(
                  !hourRange.name.startsWith("C") &&
                    "bg-input leading-3 lg:leading-[4px]"
                )}
              >
                <TableCell className="w-max">
                  {hourRange.startHour} - {hourRange.endHour}
                </TableCell>
                {!hourRange.name.startsWith("C") &&
                  ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                    (day, index) => (
                      <TableCell className="font-medium" key={uuid()}>
                        {hourRange.name.startsWith("L") ? "LUNCH" : "BREAK"}
                      </TableCell>
                    )
                  )}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

const CommandLoading = () => {
  return (
    <CommandGroup>
      <CommandItem disabled className="justify-center">
        <Oval
          height={32}
          width={32}
          strokeWidth={4}
          strokeWidthSecondary={3}
          color="#F8FAFC"
          secondaryColor="#0F1729"
        />
      </CommandItem>
    </CommandGroup>
  );
};

const TeacherCombobox = ({
  selectedTeacher,
  setSelectedTeacher,
  setSelectedClassroom,
}: {
  selectedTeacher: string | undefined;
  setSelectedTeacher: Dispatch<SetStateAction<string | undefined>>;
  setSelectedClassroom: Dispatch<SetStateAction<string | undefined>>;
}) => {
  const { data: teachers, isLoading: isTeachersLoading } =
    api.teacher.getTeachers.useQuery(undefined, {
      staleTime: Infinity,
    });

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h2 className="text-sm font-medium">Filter by teacher</h2>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-[240px] justify-between"
          >
            {selectedTeacher
              ? (() => {
                  const foundTeacher = teachers?.teachers?.find(
                    (t) => t.id === selectedTeacher
                  );
                  return foundTeacher
                    ? `${foundTeacher.name} ${foundTeacher.surname}`
                    : "Teacher not found";
                })()
              : "Select a teacher"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandInput placeholder="Search teacher..." />
            <CommandEmpty>No teacher found.</CommandEmpty>
            {isTeachersLoading ? (
              <CommandLoading />
            ) : (
              <ScrollArea className="h-56">
                <CommandGroup>
                  {teachers?.teachers.map((teacher) => (
                    <CommandItem
                      key={teacher.id}
                      value={teacher.id}
                      onSelect={(value) => {
                        setSelectedTeacher(value);
                        setSelectedClassroom(undefined);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          teacher.id === selectedTeacher
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {teacher.name} {teacher.surname}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const ClassroomCombobox = ({
  selectedClassroom,
  setSelectedTeacher,
  setSelectedClassroom,
}: {
  selectedClassroom: string | undefined;
  setSelectedTeacher: Dispatch<SetStateAction<string | undefined>>;
  setSelectedClassroom: Dispatch<SetStateAction<string | undefined>>;
}) => {
  const { data: classrooms, isLoading: isClassroomsLoading } =
    api.classroom.getClassrooms.useQuery(undefined, {
      staleTime: Infinity,
    });

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h2 className="text-sm font-medium">Filter by classroom</h2>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-[240px] justify-between"
          >
            {selectedClassroom
              ? (() => {
                  const foundClassroom = classrooms?.classrooms?.find(
                    (t) => t.id === selectedClassroom
                  );
                  return foundClassroom
                    ? `${ClassLevelMap[foundClassroom.classLevel]} ${
                        foundClassroom.code
                      } ${foundClassroom.branch || ""}`
                    : "Classroom not found";
                })()
              : "Select a classroom"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandInput placeholder="Search classroom..." />
            <CommandEmpty>No classroom found.</CommandEmpty>
            {isClassroomsLoading ? (
              <CommandLoading />
            ) : (
              <ScrollArea className="h-56">
                <CommandGroup>
                  {classrooms?.classrooms.map((classroom) => (
                    <CommandItem
                      key={classroom.id}
                      value={classroom.id}
                      onSelect={(value) => {
                        setSelectedClassroom(value);
                        setSelectedTeacher(undefined);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          classroom.id === selectedClassroom
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {ClassLevelMap[classroom.classLevel]} {classroom.code}{" "}
                      {classroom.branch || ""}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const TimetableView: NextPage = (props) => {
  const [selectedClassroom, setSelectedClassroom] = useState<
    string | undefined
  >(undefined);
  const [selectedTeacher, setSelectedTeacher] = useState<string | undefined>(
    undefined
  );
  const { data: session, status: sessionStatus } = useSession();

  const {
    data: timetable,
    isRefetching: isTimetableRefetching,
    refetch: refetchTimetable,
  } = api.timetable.getTimetable.useQuery(
    {
      classroomId: selectedClassroom || undefined,
      teacherId: selectedTeacher || undefined,
    },
    {
      staleTime: Infinity,
      enabled: false,
    }
  );

  const { data: teacherTimetable, isRefetching: isTeacherTimetableRefetching } =
    api.timetable.getTeacherTimetable.useQuery(undefined, {
      staleTime: Infinity,
      enabled:
        sessionStatus === "authenticated" &&
        session.user.memberRole === "TEACHER",
    });

  return (
    <>
      <Head>
        <title>View Timetable | TimetablePro</title>
        <meta name="description" content="TimetablePro View Timetable" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex w-full flex-col items-center space-y-4 px-4 lg:px-6">
          {sessionStatus === "authenticated" &&
          session.user.memberRole === "MANAGER" ? (
            <>
              <h1 className="mt-8 text-2xl font-bold">View Timetables</h1>
              <p className="text-base text-muted-foreground">
                Select a classroom or teacher to view their timetable.
              </p>
              <div className="flex flex-col items-center justify-center gap-8 pt-4 lg:flex-row lg:gap-16">
                <TeacherCombobox
                  selectedTeacher={selectedTeacher}
                  setSelectedTeacher={setSelectedTeacher}
                  setSelectedClassroom={setSelectedClassroom}
                />
                <ClassroomCombobox
                  selectedClassroom={selectedClassroom}
                  setSelectedTeacher={setSelectedTeacher}
                  setSelectedClassroom={setSelectedClassroom}
                />
                <Button
                  type="button"
                  className={"m-0 w-32 lg:self-end"}
                  disabled={
                    (!selectedClassroom && !selectedTeacher) ||
                    isTimetableRefetching
                  }
                  onClick={async () => {
                    await refetchTimetable();
                  }}
                >
                  View
                </Button>
              </div>
              <TimetableSkeleton
                isLoading={isTimetableRefetching}
                timetable={timetable?.classes || []}
              />
            </>
          ) : (
            <>
              <h1 className="mt-8 text-2xl font-bold">View Timetable</h1>
              <p className="text-base text-muted-foreground">
                {session?.user.name} {session?.user.surname}, Your timetable is
                below.
              </p>
              <TimetableSkeleton
                isLoading={isTeacherTimetableRefetching}
                timetable={teacherTimetable?.classes || []}
              />
            </>
          )}
        </div>
      </Layout>
    </>
  );
};

export default TimetableView;
