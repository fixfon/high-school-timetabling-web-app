// TODO : Add required errors to fields

import { zodResolver } from "@hookform/resolvers/zod";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useReducer, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import Layout from "~/components/dashboard/Layout";
import { api } from "~/utils/api";
import teacherSchema, { type TeacherInput } from "~/schemas/teacher";
import {
  ClassHour,
  type Teacher,
  type Day,
  type TeacherWorkPreferance,
  type Lesson,
  type Department,
  type User,
  type TeacherLesson,
} from "@prisma/client";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/components/ui/use-toast";
import { ChevronsUpDown, ExternalLink, Trash2, X } from "lucide-react";
import { Oval } from "react-loader-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { type Row, type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/ui/data-table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface TimePreference {
  day: Day;
  classHour: ClassHour[];
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const teacherColumns: ColumnDef<
  Teacher & {
    Department: Department;
    User: User | null;
    TeacherLesson: (TeacherLesson & {
      Lesson: Lesson;
    })[];
    TeacherWorkPreferance: TeacherWorkPreferance[];
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
    accessorKey: "surname",
    header: "Surname",
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => {
      const { Department } = row.original;
      return <span>{Department.name}</span>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "edit",
    header: "",
    cell: ({ row }) => {
      const { id } = row.original;
      return <EditTeacher row={row} />;
    },
  },
  {
    accessorKey: "delete",
    header: "",
    cell: ({ row }) => {
      const { id } = row.original;
      const trpcContext = api.useContext();

      const { mutateAsync, isLoading } = api.teacher.deleteTeacher.useMutation({
        onSuccess: async () => {
          // validate data
          await trpcContext.teacher.getTeachers.invalidate();
        },
      });

      const handleDelete = async () => {
        await mutateAsync({ teacherId: id });
      };

      return (
        <Button
          disabled={isLoading}
          variant="destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      );
    },
  },
];

const TeacherTableView = () => {
  const { data: teachers } = api.teacher.getTeachers.useQuery();
  return (
    <div className="w-full pt-12 lg:w-3/5">
      <DataTable columns={teacherColumns} data={teachers?.teachers ?? []} />
    </div>
  );
};

const baseTimePref: TimePreference[] = [
  {
    day: "Monday",
    classHour: [
      ClassHour.C1,
      ClassHour.C2,
      ClassHour.C3,
      ClassHour.C4,
      ClassHour.C5,
      ClassHour.C6,
      ClassHour.C7,
      ClassHour.C8,
    ],
  },
  {
    day: "Tuesday",
    classHour: [
      ClassHour.C1,
      ClassHour.C2,
      ClassHour.C3,
      ClassHour.C4,
      ClassHour.C5,
      ClassHour.C6,
      ClassHour.C7,
      ClassHour.C8,
    ],
  },
  {
    day: "Wednesday",
    classHour: [
      ClassHour.C1,
      ClassHour.C2,
      ClassHour.C3,
      ClassHour.C4,
      ClassHour.C5,
      ClassHour.C6,
      ClassHour.C7,
      ClassHour.C8,
    ],
  },
  {
    day: "Thursday",
    classHour: [
      ClassHour.C1,
      ClassHour.C2,
      ClassHour.C3,
      ClassHour.C4,
      ClassHour.C5,
      ClassHour.C6,
      ClassHour.C7,
      ClassHour.C8,
    ],
  },
  {
    day: "Friday",
    classHour: [
      ClassHour.C1,
      ClassHour.C2,
      ClassHour.C3,
      ClassHour.C4,
      ClassHour.C5,
      ClassHour.C6,
      ClassHour.C7,
      ClassHour.C8,
    ],
  },
];

const CreateTeacher = () => {
  const { toast } = useToast();
  const [isPrefDialogOpen, setIsPrefDialogOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLessonListSet, setIsLessonListSet] = useState(false);
  // timePref state
  const [timePreferences, setTimePreferences] = useState<TimePreference[]>([
    ...baseTimePref,
  ]);
  const [selectedLessons, setSelectedLessons] = useState<Lesson[]>([]);
  const [lessonList, setLessonList] = useState<Lesson[]>([]);

  const {
    register,
    unregister,
    handleSubmit,
    getValues,
    setValue,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<TeacherInput>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      departmentId: undefined,
      timePreferences: baseTimePref,
      lessonIds: selectedLessons.map((lesson) => lesson.id),
      createUser: false,
    },
  });
  const createUserAccountChecked = useWatch({ control, name: "createUser" });

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading } = api.teacher.createTeacher.useMutation({
    onSuccess: async () => {
      toast({
        title: "Teacher created successfully",
      });
      // reset form
      setTimePreferences([...baseTimePref]);
      setSelectedLessons([]);
      setIsLessonListSet(false);
      await refetchLesson();
      reset();
      // invalidate teacher table
      void trpcContext.teacher.getTeachers.invalidate();
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error creating teacher",
        description: err.message,
      });
    },
  });
  const {
    data: lessonData,
    isFetched: isLessonFetched,
    refetch: refetchLesson,
  } = api.lesson.getLessons.useQuery();
  const { data: department, isFetched: isDepartmentFetched } =
    api.department.getDepartments.useQuery();

  const onSubmit = async (data: TeacherInput) => {
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  useEffect(() => {
    if (!createUserAccountChecked) {
      unregister("email");
      unregister("password");
    }
  }, [unregister, createUserAccountChecked]);

  useEffect(() => {
    if (isLessonFetched && lessonData?.lessons && !isLessonListSet) {
      setLessonList(lessonData.lessons);
      setIsLessonListSet(true);
    }
  }, [isLessonFetched, lessonData, isLessonListSet]);

  return (
    <div className="flex w-3/4 flex-col items-center justify-start pt-12 lg:w-2/5">
      <h1 className="text-2xl font-bold">Create Teacher</h1>
      <form
        className="mt-8 flex w-full flex-col space-y-3 px-8"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            disabled={isLoading || isSubmitting}
            type="text"
            id="name"
            {...register("name")}
          />
        </div>
        <div>
          <Label htmlFor="surname">Surname</Label>
          <Input
            disabled={isLoading || isSubmitting}
            type="text"
            id="surname"
            {...register("surname")}
          />
        </div>
        <div>
          <Label>Department</Label>
          <Controller
            name="departmentId"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <Select onValueChange={onChange} value={value}>
                  <SelectTrigger
                    disabled={isSubmitting || isLoading}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Departments</SelectLabel>
                      {isDepartmentFetched &&
                        department?.departments.map((department) => (
                          <SelectItem
                            key={department.id}
                            value={department.id}
                            onSelect={() => {
                              setValue("departmentId", department.id);
                            }}
                          >
                            {department.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              );
            }}
          ></Controller>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            disabled={isLoading || isSubmitting}
            id="description"
            {...register("description")}
          />
        </div>
        <div className="flex items-center gap-4 py-4">
          <Input
            disabled={isLoading || isSubmitting}
            id="createUser"
            type="checkbox"
            className="h-4 w-4 ring-offset-background checked:accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register("createUser")}
          />
          <Label htmlFor="createUser">Create User Account</Label>
        </div>
        {createUserAccountChecked && (
          <>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                disabled={isLoading || isSubmitting}
                type="email"
                id="email"
                {...register("email", { required: false })}
              />
            </div>
            <div className="pb-8">
              <Label htmlFor="password">Password</Label>
              <Input
                disabled={isLoading || isSubmitting}
                type="password"
                id="password"
                {...register("password", { required: false })}
              />
            </div>
          </>
        )}

        <Dialog open={isPrefDialogOpen} onOpenChange={setIsPrefDialogOpen}>
          <DialogTrigger disabled={isSubmitting || isLoading} asChild>
            <Button
              disabled={isLoading || isSubmitting}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Time Preferences
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[680px]">
            <DialogHeader>
              <DialogTitle>Edit Time Preferences</DialogTitle>
              <DialogDescription>
                Set the days and class hours the teacher is available.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hour / Day</TableHead>
                    <TableHead>Hour 1</TableHead>
                    <TableHead>Hour 2</TableHead>
                    <TableHead>Hour 3</TableHead>
                    <TableHead>Hour 4</TableHead>
                    <TableHead>Hour 5</TableHead>
                    <TableHead>Hour 6</TableHead>
                    <TableHead>Hour 7</TableHead>
                    <TableHead>Hour 8</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                    (day, dayIndex) => (
                      <TableRow key={dayIndex}>
                        <TableCell>{day}</TableCell>
                        {Array.from(
                          [
                            ClassHour.C1,
                            ClassHour.C2,
                            ClassHour.C3,
                            ClassHour.C4,
                            ClassHour.C5,
                            ClassHour.C6,
                            ClassHour.C7,
                            ClassHour.C8,
                          ],
                          (elem, i) => (
                            <TableCell key={i}>
                              <Input
                                disabled={isLoading || isSubmitting}
                                type="checkbox"
                                checked={timePreferences[
                                  dayIndex
                                ]?.classHour.includes(elem)}
                                value={elem}
                                className="h-4 w-4 ring-offset-background checked:accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                id={`${dayIndex}-${elem}`}
                                onChange={(e) => {
                                  const prev = getValues(
                                    `timePreferences.${dayIndex}.classHour`
                                  );

                                  if (e.target.checked) {
                                    setValue(
                                      `timePreferences.${dayIndex}.classHour`,
                                      [...prev, elem]
                                    );

                                    const latest = getValues(`timePreferences`);

                                    if (latest)
                                      setTimePreferences(() => {
                                        return {
                                          ...latest,
                                        };
                                      });
                                  } else {
                                    setValue(
                                      `timePreferences.${dayIndex}.classHour`,
                                      [...prev.filter((p) => p !== elem)]
                                    );

                                    const latest = getValues(`timePreferences`);

                                    if (latest)
                                      setTimePreferences(() => {
                                        return {
                                          ...latest,
                                        };
                                      });
                                  }

                                  return;
                                }}
                              />
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button
                variant="default"
                type="submit"
                onClick={() => setIsPrefDialogOpen(false)}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {selectedLessons.length > 0 && (
          <div className="flex max-w-full flex-row flex-wrap rounded-md border px-2 py-2">
            {selectedLessons.map((lesson) => (
              <div
                key={lesson.id}
                className=" mr-2 flex h-min max-w-[120px] items-center justify-center rounded-md border px-2 py-1 transition-colors hover:cursor-pointer hover:bg-accent"
                onClick={() => {
                  setSelectedLessons(() =>
                    selectedLessons.filter((l) => l !== lesson)
                  );
                  setLessonList((prev) => [...prev, lesson]);

                  const prevLessonIds = getValues("lessonIds");
                  if (prevLessonIds) {
                    setValue(
                      "lessonIds",
                      prevLessonIds.filter((l) => l !== lesson.id)
                    );
                  }
                }}
              >
                <span className="shrink-[2] pr-2 text-xs">{lesson.name}</span>
                <Button size="sm" variant="destructive" className="h-5 w-5 p-0">
                  <X size={18} className="h-full w-full" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger disabled={isSubmitting || isLoading} asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isPopoverOpen}
              className="w-full justify-between"
            >
              Select lessons
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command className="w-80">
              <CommandInput placeholder="Search lesson..." />
              <CommandEmpty>No lesson found.</CommandEmpty>
              <CommandGroup>
                {lessonList.map((lesson) => (
                  <CommandItem
                    key={lesson.id}
                    onSelect={() => {
                      setSelectedLessons((prev) => [lesson, ...prev]);
                      setLessonList(() =>
                        lessonList.filter((l) => l !== lesson)
                      );

                      const prevLessonIds = getValues("lessonIds");

                      setValue(
                        "lessonIds",
                        prevLessonIds
                          ? [...prevLessonIds, lesson.id]
                          : [lesson.id]
                      );
                    }}
                  >
                    {lesson.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <Button disabled={isLoading || isSubmitting} type="submit">
          {isSubmitting || isLoading ? (
            <>
              <Oval
                height={20}
                width={20}
                strokeWidth={4}
                strokeWidthSecondary={3}
                color="#5090FF"
                secondaryColor="#FFFFFF"
              />
              <span>Create Teacher</span>
            </>
          ) : (
            "Create Teacher"
          )}
        </Button>
      </form>
    </div>
  );
};

type EditTeacherProps = {
  row: Row<
    Teacher & {
      Department: Department;
      User: User | null;
      TeacherLesson: (TeacherLesson & {
        Lesson: Lesson;
      })[];
      TeacherWorkPreferance: TeacherWorkPreferance[];
    }
  >;
};
const EditTeacher = ({ row }: EditTeacherProps) => {
  const rerender = useReducer(() => ({}), {})[1];
  const [windowSize, setWindowSize] = useState([1440, 1070]);
  const [openSheet, setOpenSheet] = useState(false);

  const { toast } = useToast();
  const [isPrefDialogOpen, setIsPrefDialogOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [timePreferences, setTimePreferences] = useState<TimePreference[]>([
    ...baseTimePref,
  ]);
  const [selectedLessons, setSelectedLessons] = useState<Lesson[]>([]);
  const [lessonList, setLessonList] = useState<Lesson[]>([]);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<TeacherInput>({
    resolver: zodResolver(teacherSchema),
  });

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading: isEditing } =
    api.teacher.updateTeacher.useMutation({
      onSuccess: () => {
        toast({
          title: "Teacher edited successfully",
        });

        // invalidate teacher table
        void trpcContext.teacher.getTeachers.invalidate();
        reset();
        rerender();
        // close the sheet
        void wait(1000).then(() => setOpenSheet(false));
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error editing teacher",
          description: err.message,
        });
      },
    });
  const { data: lessonData, isFetched: isLessonFetched } =
    api.lesson.getLessons.useQuery();
  const { data: department, isFetched: isDepartmentFetched } =
    api.department.getDepartments.useQuery();

  const onSubmit = async (data: TeacherInput) => {
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  useEffect(() => {
    // for popover component
    if (
      selectedLessons.length !== 0 &&
      isLessonFetched &&
      lessonData?.lessons
    ) {
      const filteredLessons = lessonData.lessons.filter(
        (lesson) =>
          !selectedLessons.find((selected) => selected.id === lesson.id)
      );

      setLessonList(() => [...filteredLessons]);
      // setIsLessonListSet(true);
    } else {
    }
  }, [selectedLessons, isLessonFetched, lessonData]);

  useEffect(() => {
    setValue("id", row.original.id);
    setValue("name", row.original.name);
    setValue("surname", row.original.surname);
    setValue("email", row.original.User?.email ?? "");
    setValue("departmentId", row.original.departmentId);
    setValue("description", row.original.description ?? "");

    const timePref = row.original.TeacherWorkPreferance.map(
      (pref: TeacherWorkPreferance) => {
        return {
          day: pref.workingDay,
          classHour: pref.workingHour,
        };
      }
    );

    if (timePref) {
      setValue("timePreferences", timePref);
      setTimePreferences(() => {
        return {
          ...timePref,
        };
      });
    }

    const teacherLessons = row.original.TeacherLesson.map(
      (teacherLesson) => teacherLesson.Lesson
    );

    if (teacherLessons.length > 0) {
      // for selected component
      setValue(
        "lessonIds",
        teacherLessons.map((lesson) => lesson.id)
      );
      setSelectedLessons(() => [...teacherLessons]);
    }
  }, [row, setValue]);

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

      <SheetContent size={windowSize.at(0)! <= 1024 ? "full" : "default"}>
        <SheetHeader>
          <SheetTitle>Edit Teacher {row.original.name}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-start pt-6">
          <form
            className="mt-8 flex w-full flex-col space-y-3 px-8"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                disabled={isSubmitting || isEditing}
                type="text"
                id="name"
                {...register("name")}
              />
            </div>
            <div>
              <Label htmlFor="surname">Surname</Label>
              <Input
                disabled={isSubmitting || isEditing}
                type="text"
                id="surname"
                {...register("surname")}
              />
            </div>
            <div>
              <Label>Department</Label>
              <Controller
                name="departmentId"
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <Select onValueChange={onChange} value={value}>
                      <SelectTrigger
                        disabled={isSubmitting || isEditing}
                        className="w-full"
                      >
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Departments</SelectLabel>
                          {isDepartmentFetched &&
                            department?.departments.map((department) => (
                              <SelectItem
                                key={department.id}
                                value={department.id}
                                onSelect={() => {
                                  setValue("departmentId", department.id);
                                }}
                              >
                                {department.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  );
                }}
              ></Controller>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                disabled={isSubmitting || isEditing}
                id="description"
                {...register("description")}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                disabled={isSubmitting || isEditing}
                type="email"
                id="email"
                {...register("email", { required: false })}
              />
            </div>
            <div className="pb-8">
              <Label htmlFor="password">Password</Label>
              <Input
                disabled={isSubmitting || isEditing}
                type="password"
                id="password"
                {...register("password", { required: false })}
              />
            </div>

            <Dialog open={isPrefDialogOpen} onOpenChange={setIsPrefDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={isSubmitting || isEditing}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Time Preferences
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[680px]">
                <DialogHeader>
                  <DialogTitle>Edit Time Preferences</DialogTitle>
                  <DialogDescription>
                    Set the days and class hours the teacher is available.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hour / Day</TableHead>
                        <TableHead>Hour 1</TableHead>
                        <TableHead>Hour 2</TableHead>
                        <TableHead>Hour 3</TableHead>
                        <TableHead>Hour 4</TableHead>
                        <TableHead>Hour 5</TableHead>
                        <TableHead>Hour 6</TableHead>
                        <TableHead>Hour 7</TableHead>
                        <TableHead>Hour 8</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                      ].map((day, dayIndex) => (
                        <TableRow key={dayIndex}>
                          <TableCell>{day}</TableCell>
                          {Array.from(
                            [
                              ClassHour.C1,
                              ClassHour.C2,
                              ClassHour.C3,
                              ClassHour.C4,
                              ClassHour.C5,
                              ClassHour.C6,
                              ClassHour.C7,
                              ClassHour.C8,
                            ],
                            (elem, i) => (
                              <TableCell key={i}>
                                <Input
                                  disabled={isSubmitting || isEditing}
                                  type="checkbox"
                                  checked={timePreferences[
                                    dayIndex
                                  ]?.classHour.includes(elem)}
                                  value={elem}
                                  className="h-4 w-4 ring-offset-background checked:accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  id={`${dayIndex}-${elem}`}
                                  onChange={(e) => {
                                    const prev = getValues(
                                      `timePreferences.${dayIndex}.classHour`
                                    );

                                    if (e.target.checked) {
                                      setValue(
                                        `timePreferences.${dayIndex}.classHour`,
                                        [...prev, elem]
                                      );

                                      const latest =
                                        getValues(`timePreferences`);

                                      if (latest)
                                        setTimePreferences(() => {
                                          return {
                                            ...latest,
                                          };
                                        });
                                    } else {
                                      setValue(
                                        `timePreferences.${dayIndex}.classHour`,
                                        [...prev.filter((p) => p !== elem)]
                                      );

                                      const latest =
                                        getValues(`timePreferences`);

                                      if (latest)
                                        setTimePreferences(() => {
                                          return {
                                            ...latest,
                                          };
                                        });
                                    }

                                    return;
                                  }}
                                />
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <DialogFooter>
                  <Button
                    variant="default"
                    type="submit"
                    onClick={() => setIsPrefDialogOpen(false)}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {selectedLessons.length > 0 && (
              <div className="flex max-w-full flex-row flex-wrap rounded-md border px-2 py-2">
                {selectedLessons.map((lesson) => (
                  <div
                    aria-disabled={isSubmitting || isEditing}
                    key={lesson.id}
                    className=" mr-2 flex h-min max-w-[120px] items-center justify-center rounded-md border px-2 py-1 transition-colors hover:cursor-pointer hover:bg-accent"
                    onClick={() => {
                      setSelectedLessons(() =>
                        selectedLessons.filter((l) => l !== lesson)
                      );
                      setLessonList((prev) => [...prev, lesson]);

                      const prevLessonIds = getValues("lessonIds");
                      if (prevLessonIds) {
                        setValue(
                          "lessonIds",
                          prevLessonIds.filter((l) => l !== lesson.id)
                        );
                      }
                    }}
                  >
                    <span className="shrink-[2] pr-2 text-xs">
                      {lesson.name}
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-5 w-5 p-0"
                    >
                      <X size={18} className="h-full w-full" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger disabled={isSubmitting || isEditing} asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isPopoverOpen}
                  className="w-full justify-between"
                >
                  Select lessons
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command className="w-80">
                  <CommandInput placeholder="Search lesson..." />
                  <CommandEmpty>No lesson found.</CommandEmpty>
                  <CommandGroup>
                    {lessonList.map((lesson) => (
                      <CommandItem
                        key={lesson.id}
                        onSelect={() => {
                          setSelectedLessons((prev) => [lesson, ...prev]);
                          setLessonList(() =>
                            lessonList.filter((l) => l !== lesson)
                          );

                          const prevLessonIds = getValues("lessonIds");

                          setValue(
                            "lessonIds",
                            prevLessonIds
                              ? [...prevLessonIds, lesson.id]
                              : [lesson.id]
                          );
                        }}
                      >
                        {lesson.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <Button disabled={isSubmitting || isEditing} type="submit">
              {isSubmitting || isEditing ? (
                <>
                  <Oval
                    height={20}
                    width={20}
                    strokeWidth={4}
                    strokeWidthSecondary={3}
                    color="#5090FF"
                    secondaryColor="#FFFFFF"
                  />
                  <span>Edit Teacher</span>
                </>
              ) : (
                "Edit Teacher"
              )}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Teachers: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Teachers | TimetablePro</title>
        <meta name="description" content="TimetablePro Teachers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex w-full flex-col md:flex-row">
          <CreateTeacher />
          <TeacherTableView />
        </div>
      </Layout>
    </>
  );
};

export default Teachers;
