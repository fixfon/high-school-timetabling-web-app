import { zodResolver } from "@hookform/resolvers/zod";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useReducer, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import Layout from "~/components/dashboard/Layout";
import { api } from "~/utils/api";
import {
  type Lesson,
  type Classroom,
  type Teacher,
  type ClassroomLesson,
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
import { useToast } from "~/components/ui/use-toast";
import {
  Check,
  ChevronsUpDown,
  ExternalLink,
  Trash,
  Trash2,
} from "lucide-react";
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
import classroomSchema, { type ClassroomInput } from "~/schemas/classroom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ScrollArea } from "~/components/ui/scroll-area";
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
import { cn } from "~/utils/cn";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const classroomColumns: ColumnDef<
  Classroom & {
    ClassroomLesson: (ClassroomLesson & {
      Lesson: Lesson;
    })[];
    Teacher: Teacher | null;
  }
>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "classLevel",
    header: "Class Level",
    cell: ({ row }) => {
      const classLevel = row.original.classLevel;

      return ClassLevelMap[classLevel];
    },
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "branch",
    header: "Branch",
  },
  {
    accessorKey: "advisorTeacherId",
    header: "Advisor Teacher",
    cell: ({ row }) => {
      const teacher = row.original.Teacher;

      return teacher ? `${teacher.name} ${teacher.surname}` : "-";
    },
  },
  {
    accessorKey: "ClassroomLesson",
    header: "Total Lessons",
    cell: ({ row }) => {
      const lessons = row.original.ClassroomLesson;

      return lessons.length;
    },
  },
  {
    accessorKey: "ClassroomLesson",
    header: "Total Hours",
    cell: ({ row }) => {
      const lessons = row.original.ClassroomLesson;

      const totalHours = lessons.reduce((acc, lesson) => {
        return acc + lesson.weeklyHour;
      }, 0);

      return totalHours;
    },
  },
  {
    accessorKey: "edit",
    header: "",
    cell: ({ row }) => {
      return <EditClassroom row={row} />;
    },
  },
  {
    accessorKey: "delete",
    header: "",
    cell: ({ row }) => {
      const { id } = row.original;
      const trpcContext = api.useContext();

      const { mutateAsync, isLoading } =
        api.classroom.deleteClassroom.useMutation({
          onSuccess: async () => {
            // validate data
            await trpcContext.classroom.getClassrooms.invalidate();
          },
        });

      const handleDelete = async () => {
        await mutateAsync({ classroomId: id });
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

const ClassroomTableView = () => {
  const { data: classrooms } = api.classroom.getClassrooms.useQuery();

  return (
    <div className="w-full pt-12 lg:w-3/5">
      <DataTable
        columns={classroomColumns}
        data={classrooms?.classrooms ?? []}
      />
    </div>
  );
};

const ClassLevelMap = {
  L9: "9. Grade",
  L10: "10. Grade",
  L11: "11. Grade",
  L12: "12. Grade",
};

const CreateClassroom = () => {
  const { toast } = useToast();
  const [isLessonListSet, setLessonListSet] = useState(false);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [isLessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [isLessonPopoversOpen, setLessonPopoversOpen] = useState<boolean[]>([]);
  const isInitialRender = useRef(true);
  const [lessonList, setLessonList] = useState<Lesson[]>([]);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    reset,
    clearErrors,
    trigger,
    formState: { isSubmitting, errors },
  } = useForm<ClassroomInput>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      advisorTeacherId: null,
      branch: undefined,
      classLevel: undefined,
      code: undefined,
    },
  });
  const teacherValue = useWatch({ control, name: "advisorTeacherId" });
  const lessonValue = useWatch({ control, name: "lessons" });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lessons",
    shouldUnregister: true,
  });

  const appendLesson = () => {
    append({
      lessonId: "",
      lessonName: "",
      weeklyHour: 0,
    });
    setLessonPopoversOpen((prev) => [...prev, false]);

    if (errors.lessons) clearErrors("lessons");
  };

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading } = api.classroom.createClassroom.useMutation({
    onSuccess: () => {
      toast({
        title: "Classroom created successfully",
      });

      // reset form
      setLessonListSet(false);
      reset();
      reset({ lessons: [] });

      // invalidate classroom table
      void trpcContext.classroom.getClassrooms.invalidate();
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error creating classroom",
        description: err.message,
      });

      // reset form
      setLessonListSet(false);
      reset();
      reset({ lessons: [] });
    },
  });
  const { data: teachers, isLoading: isTeachersLoading } =
    api.teacher.getTeachers.useQuery();
  const {
    data: lessons,
    isLoading: isLessonsLoading,
    isRefetching: isLessonsRefetching,
  } = api.lesson.getLessons.useQuery();

  const onSubmit = async (data: ClassroomInput) => {
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  useEffect(() => {
    if (!fields.length && !isInitialRender.current) {
      void trigger("lessons");
    }

    if (isInitialRender.current) {
      isInitialRender.current = false;
    }
  }, [fields, trigger]);

  useEffect(() => {
    if (
      !isLessonsLoading &&
      !isLessonsRefetching &&
      lessons &&
      !isLessonListSet
    ) {
      setLessonList(lessons.lessons);
      setLessonListSet(true);
    }
  }, [lessons, isLessonsLoading, isLessonsRefetching, isLessonListSet]);

  return (
    <div className="flex w-3/4 flex-col items-center justify-start pt-12 lg:w-2/5">
      <h1 className="text-2xl font-bold">Create Classroom</h1>
      <form
        className="mt-8 flex w-full flex-col space-y-3 px-8"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Label className={errors.classLevel ? "text-destructive" : ""}>
            Class Level
          </Label>
          <Controller
            name="classLevel"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger
                    disabled={isSubmitting || isLoading}
                    className={
                      errors.classLevel
                        ? "w-full border-destructive focus:outline-destructive"
                        : "w-full"
                    }
                  >
                    <SelectValue aria-label={value}>
                      {ClassLevelMap[value] ?? "Select a class level"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Class Level</SelectLabel>
                      <SelectItem value="L9">{ClassLevelMap.L9}</SelectItem>
                      <SelectItem value="L10">{ClassLevelMap.L10}</SelectItem>
                      <SelectItem value="L11">{ClassLevelMap.L11}</SelectItem>
                      <SelectItem value="L12">{ClassLevelMap.L12}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              );
            }}
          ></Controller>
        </div>
        <div>
          <Label className={errors.code ? "text-destructive" : ""}>
            Class Code
          </Label>
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger
                    disabled={isSubmitting || isLoading}
                    className={
                      errors.code
                        ? "w-full border-destructive focus:outline-destructive"
                        : "w-full"
                    }
                  >
                    <SelectValue aria-label={value}>
                      {value ?? "Select a class code"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-56">
                      <SelectGroup>
                        <SelectLabel>Class Code</SelectLabel>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                        <SelectItem value="H">H</SelectItem>
                        <SelectItem value="I">I</SelectItem>
                        <SelectItem value="J">J</SelectItem>
                        <SelectItem value="K">K</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="N">N</SelectItem>
                        <SelectItem value="O">O</SelectItem>
                        <SelectItem value="P">P</SelectItem>
                        <SelectItem value="Q">Q</SelectItem>
                        <SelectItem value="R">R</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="T">T</SelectItem>
                        <SelectItem value="U">U</SelectItem>
                        <SelectItem value="V">V</SelectItem>
                        <SelectItem value="W">W</SelectItem>
                        <SelectItem value="X">X</SelectItem>
                        <SelectItem value="Y">Y</SelectItem>
                        <SelectItem value="Z">Z</SelectItem>
                      </SelectGroup>
                    </ScrollArea>
                  </SelectContent>
                </Select>
              );
            }}
          ></Controller>
        </div>
        <div>
          <Label>Branch</Label>
          <div className="flex items-center justify-center">
            <Controller
              name="branch"
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <Select onValueChange={onChange} value={value ?? ""}>
                    <SelectTrigger
                      disabled={isSubmitting || isLoading}
                      className="w-full"
                    >
                      <span>
                        {value && value !== "" ? value : "Select a branch"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Branch</SelectLabel>
                        <SelectItem value="MF">MF</SelectItem>
                        <SelectItem value="TM">TM</SelectItem>
                        <SelectItem value="TS">TS</SelectItem>
                        <SelectItem value="DIL">DİL</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                );
              }}
            ></Controller>
            <Button
              onClick={() => {
                setValue("branch", "", { shouldValidate: true });
              }}
              variant="link"
            >
              Clear
            </Button>
          </div>
        </div>

        <div>
          <Label>Advisor Teacher</Label>
          <div className="flex items-center justify-center">
            <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  disabled={isSubmitting || isLoading}
                  variant="outline"
                  role="combobox"
                  aria-expanded={isPopoverOpen}
                  className="w-full justify-between"
                >
                  {teacherValue && teacherValue !== "none"
                    ? (() => {
                        const foundTeacher = teachers?.teachers?.find(
                          (t) => t.id === teacherValue
                        );
                        return foundTeacher
                          ? `${foundTeacher.name} ${foundTeacher.surname}`
                          : "Teacher not found";
                      })()
                    : "Select a teacher"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command className="w-80">
                  <CommandInput placeholder="Find a teacher" />
                  <CommandEmpty>No teacher found.</CommandEmpty>
                  <CommandGroup>
                    {!isTeachersLoading &&
                      teachers?.teachers.map((teacher) => (
                        <CommandItem
                          key={teacher.id}
                          onSelect={() => {
                            const current = getValues("advisorTeacherId");
                            if (current === teacher.id) {
                              setValue("advisorTeacherId", "none", {
                                shouldValidate: true,
                              });
                            } else {
                              setValue("advisorTeacherId", teacher.id, {
                                shouldValidate: true,
                              });
                            }
                            setPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              teacherValue === teacher.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {teacher.name} {teacher.surname}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              onClick={() => {
                setValue("advisorTeacherId", "none", { shouldValidate: true });
              }}
              variant="link"
            >
              Clear
            </Button>
          </div>
        </div>

        <Dialog open={isLessonDialogOpen} onOpenChange={setLessonDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={isSubmitting || isLoading}
              variant="outline"
              className={cn("flex items-center justify-center gap-2", {
                "border-destructive text-destructive": errors.lessons,
              })}
            >
              <ExternalLink className="h-4 w-4" />
              Semester Lessons
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[740px]">
            <DialogHeader>
              <DialogTitle>Set Semester Lessons</DialogTitle>
              <DialogDescription>
                Set the semester lessons for this classroom.
              </DialogDescription>
            </DialogHeader>
            <Table className="h-8 overflow-y-auto py-4">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/12">Remove</TableHead>
                  <TableHead className="w-2/5">Lesson Name</TableHead>
                  <TableHead className="w-1/3">Type</TableHead>
                  <TableHead>Weekly Hour</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((lessonItem, lessonIndex) => (
                  <TableRow key={lessonItem.id}>
                    <TableCell>
                      <Button
                        disabled={isSubmitting}
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          // add removed lesson to lessonList
                          const removedItem = getValues(
                            `lessons.${lessonIndex}`
                          );
                          if (removedItem) {
                            const currentLesson = lessons?.lessons?.find(
                              (l) => l.id === removedItem.lessonId
                            );
                            if (currentLesson) {
                              setLessonList((prev) => [...prev, currentLesson]);
                            }
                          }

                          remove(lessonIndex);
                        }}
                      >
                        <Trash />
                      </Button>
                    </TableCell>
                    <TableCell className="w-2/5">
                      <Controller
                        control={control}
                        name={`lessons.${lessonIndex}.lessonName`}
                        render={({ field: { value, ref, onChange } }) => (
                          <Popover
                            open={isLessonPopoversOpen[lessonIndex]}
                            onOpenChange={(isOpen) =>
                              setLessonPopoversOpen((prev) => {
                                const newPopovers = [...prev];
                                newPopovers[lessonIndex] = isOpen;
                                return newPopovers;
                              })
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                disabled={isSubmitting}
                                variant="outline"
                                role="combobox"
                                aria-expanded={
                                  isLessonPopoversOpen[lessonIndex]
                                }
                                className="w-full justify-between"
                              >
                                {value && value !== ""
                                  ? value
                                  : "Select a lesson"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-full p-0"
                              align="start"
                            >
                              <Command className="w-80">
                                <CommandInput placeholder="Find a lesson" />
                                <CommandEmpty>No lesson found.</CommandEmpty>
                                <CommandGroup>
                                  {!isLessonsLoading &&
                                    lessonList.map((lesson) => (
                                      <CommandItem
                                        key={lesson.id}
                                        ref={ref}
                                        onSelect={() => {
                                          onChange(lesson.name);

                                          // if changing the lesson add previous lesson to lessonList
                                          // and remove the new lesson from lessonList
                                          // else only remove the lesson from lessonList

                                          const currentLessonId = getValues(
                                            `lessons.${lessonIndex}.lessonId`
                                          );

                                          if (currentLessonId !== "") {
                                            const currentLesson =
                                              lessons?.lessons?.find(
                                                (l) => l.id === currentLessonId
                                              );
                                            if (currentLesson) {
                                              setLessonList((prev) => [
                                                ...prev,
                                                currentLesson,
                                              ]);
                                            }
                                          }

                                          setLessonList((prev) =>
                                            prev.filter(
                                              (l) => l.id !== lesson.id
                                            )
                                          );

                                          setValue(
                                            `lessons.${lessonIndex}.lessonId`,
                                            lesson.id
                                          );
                                          setValue(
                                            `lessons.${lessonIndex}.lessonName`,
                                            lesson.name
                                          );

                                          setLessonPopoversOpen((prev) => {
                                            const newPopovers = [...prev];
                                            newPopovers[lessonIndex] = false;
                                            return newPopovers;
                                          });
                                        }}
                                      >
                                        {lesson.name}
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        )}
                      ></Controller>
                    </TableCell>
                    <TableCell className="w-1/3 text-xs">
                      <span>
                        {
                          lessons?.lessons.find(
                            (l) =>
                              l.id ===
                              getValues(`lessons.${lessonIndex}.lessonId`)
                          )?.type
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      {/* <Controller
                          control={control}
                          name={`lessons.${lessonIndex}.weeklyHour`}
                          rules={{ pattern: /^[0-9]*$/ }}
                          render={({ field }) => (
                            <Input type="number" {...field} />
                          )}
                        ></Controller> */}
                      <Input
                        disabled={isSubmitting}
                        className="w-20"
                        type="number"
                        max={10}
                        {...register(`lessons.${lessonIndex}.weeklyHour`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between">
              <Button
                disabled={isSubmitting}
                className="w-1/4"
                onClick={appendLesson}
              >
                Add Lesson
              </Button>
              <span className="font-semibold">
                Total Lessons: {lessonValue?.length}
              </span>
              <span className="pr-12 font-semibold">
                Total Hours:{" "}
                {lessonValue?.reduce((acc, curr) => acc + curr.weeklyHour, 0)}
              </span>
            </div>
            <DialogFooter>
              <Button
                variant="default"
                onClick={() => setLessonDialogOpen(false)}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              <span>Create Classroom</span>
            </>
          ) : (
            "Create Classroom"
          )}
        </Button>
      </form>
    </div>
  );
};

type EditClassroomProps = {
  row: Row<
    Classroom & {
      ClassroomLesson: (ClassroomLesson & {
        Lesson: Lesson;
      })[];
      Teacher: Teacher | null;
    }
  >;
};
const EditClassroom = ({ row }: EditClassroomProps) => {
  const rerender = useReducer(() => ({}), {})[1];
  const [windowSize, setWindowSize] = useState([1440, 1070]);
  const [openSheet, setOpenSheet] = useState(false);
  const { toast } = useToast();
  const [isLessonListSet, setLessonListSet] = useState(false);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [isLessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [isLessonPopoversOpen, setLessonPopoversOpen] = useState<boolean[]>([]);
  const isInitialRender = useRef(true);
  const [lessonList, setLessonList] = useState<Lesson[]>([]);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    reset,
    clearErrors,
    trigger,
    formState: { isSubmitting, errors },
  } = useForm<ClassroomInput>({
    resolver: zodResolver(classroomSchema),
  });
  const teacherValue = useWatch({ control, name: "advisorTeacherId" });
  const lessonValue = useWatch({ control, name: "lessons" });

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "lessons",
    shouldUnregister: true,
  });

  const appendLesson = () => {
    append({
      lessonId: "",
      lessonName: "",
      weeklyHour: 0,
    });
    setLessonPopoversOpen((prev) => [...prev, false]);

    if (errors.lessons) clearErrors("lessons");
  };

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading: isEditing } =
    api.classroom.updateClassroom.useMutation({
      onSuccess: () => {
        toast({
          title: "Classroom edited successfully",
        });

        // invalidate teacher table
        void trpcContext.classroom.getClassrooms.invalidate();
        reset();
        rerender();
        // close the sheet
        void wait(1000).then(() => setOpenSheet(false));
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error editing classroom",
          description: err.message,
        });
      },
    });

  const { data: teachers, isLoading: isTeachersLoading } =
    api.teacher.getTeachers.useQuery();
  const {
    data: lessons,
    isLoading: isLessonsLoading,
    isRefetching: isLessonsRefetching,
  } = api.lesson.getLessons.useQuery();

  const onSubmit = async (data: ClassroomInput) => {
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  useEffect(() => {
    if (!fields.length && !isInitialRender.current) {
      void trigger("lessons");
    }

    if (isInitialRender.current) {
      isInitialRender.current = false;
    }
  }, [fields, trigger]);

  useEffect(() => {
    if (
      !isLessonsLoading &&
      !isLessonsRefetching &&
      lessons &&
      !isLessonListSet
    ) {
      // filter out lessons that are already in the classroom
      const filteredLessons = lessons.lessons.filter(
        (l) => !row.original.ClassroomLesson.find((cl) => cl.lessonId === l.id)
      );

      setLessonList(filteredLessons);
      setLessonListSet(true);
    }
  }, [
    lessons,
    isLessonsLoading,
    isLessonsRefetching,
    isLessonListSet,
    row.original.ClassroomLesson,
  ]);

  useEffect(() => {
    setValue("id", row.original.id);
    setValue("classLevel", row.original.classLevel);
    setValue("code", row.original.code);
    setValue("branch", row.original.branch);
    setValue("advisorTeacherId", row.original.advisorTeacherId);

    const lessonObj = row.original.ClassroomLesson.map((cl) => {
      return {
        lessonId: cl.lessonId,
        lessonName: cl.Lesson.name,
        weeklyHour: cl.weeklyHour,
      };
    });

    if (lessonObj) {
      // setValue("lessons", lessonObj);
      insert(0, lessonObj);
    }
  }, [row, setValue, insert]);

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
          <SheetTitle>
            Edit Classroom{" "}
            {ClassLevelMap[row.original.classLevel] + " " + row.original.code}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-start pt-6">
          <form
            className="mt-8 flex w-full flex-col space-y-3 px-8"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <Label className={errors.code ? "text-destructive" : ""}>
                Class Level
              </Label>
              <Controller
                name="classLevel"
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <Select value={value} onValueChange={onChange}>
                      <SelectTrigger
                        disabled={isSubmitting}
                        className={
                          errors.classLevel
                            ? "w-full border-destructive focus:outline-destructive"
                            : "w-full"
                        }
                      >
                        <SelectValue aria-label={value}>
                          {ClassLevelMap[value] ?? "Select a class level"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Class Level</SelectLabel>
                          <SelectItem value="L9">{ClassLevelMap.L9}</SelectItem>
                          <SelectItem value="L10">
                            {ClassLevelMap.L10}
                          </SelectItem>
                          <SelectItem value="L11">
                            {ClassLevelMap.L11}
                          </SelectItem>
                          <SelectItem value="L12">
                            {ClassLevelMap.L12}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  );
                }}
              ></Controller>
            </div>
            <div>
              <Label className={errors.code ? "text-destructive" : ""}>
                Class Code
              </Label>
              <Controller
                name="code"
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <Select value={value} onValueChange={onChange}>
                      <SelectTrigger
                        disabled={isSubmitting}
                        className={
                          errors.code
                            ? "w-full border-destructive focus:outline-destructive"
                            : "w-full"
                        }
                      >
                        <SelectValue aria-label={value}>
                          {value ?? "Select a class code"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-56">
                          <SelectGroup>
                            <SelectLabel>Class Code</SelectLabel>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                            <SelectItem value="F">F</SelectItem>
                            <SelectItem value="G">G</SelectItem>
                            <SelectItem value="H">H</SelectItem>
                            <SelectItem value="I">I</SelectItem>
                            <SelectItem value="J">J</SelectItem>
                            <SelectItem value="K">K</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="M">M</SelectItem>
                            <SelectItem value="N">N</SelectItem>
                            <SelectItem value="O">O</SelectItem>
                            <SelectItem value="P">P</SelectItem>
                            <SelectItem value="Q">Q</SelectItem>
                            <SelectItem value="R">R</SelectItem>
                            <SelectItem value="S">S</SelectItem>
                            <SelectItem value="T">T</SelectItem>
                            <SelectItem value="U">U</SelectItem>
                            <SelectItem value="V">V</SelectItem>
                            <SelectItem value="W">W</SelectItem>
                            <SelectItem value="X">X</SelectItem>
                            <SelectItem value="Y">Y</SelectItem>
                            <SelectItem value="Z">Z</SelectItem>
                          </SelectGroup>
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  );
                }}
              ></Controller>
            </div>
            <div>
              <Label>Branch</Label>
              <div className="flex items-center justify-center">
                <Controller
                  name="branch"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <Select onValueChange={onChange} value={value ?? ""}>
                        <SelectTrigger
                          disabled={isSubmitting}
                          className="w-full"
                        >
                          <span>
                            {value && value !== "" ? value : "Select a branch"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Branch</SelectLabel>
                            <SelectItem value="MF">MF</SelectItem>
                            <SelectItem value="TM">TM</SelectItem>
                            <SelectItem value="TS">TS</SelectItem>
                            <SelectItem value="DIL">DİL</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    );
                  }}
                ></Controller>
                <Button
                  onClick={() => {
                    setValue("branch", "", { shouldValidate: true });
                  }}
                  variant="link"
                >
                  Clear
                </Button>
              </div>
            </div>

            <div>
              <Label>Advisor Teacher</Label>
              <div className="flex items-center justify-center">
                <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={isSubmitting}
                      variant="outline"
                      role="combobox"
                      aria-expanded={isPopoverOpen}
                      className="w-full justify-between"
                    >
                      {teacherValue && teacherValue !== "none"
                        ? (() => {
                            const foundTeacher = teachers?.teachers?.find(
                              (t) => t.id === teacherValue
                            );
                            return foundTeacher
                              ? `${foundTeacher.name} ${foundTeacher.surname}`
                              : "Teacher not found";
                          })()
                        : "Select a teacher"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command className="w-80">
                      <CommandInput placeholder="Find a teacher" />
                      <CommandEmpty>No teacher found.</CommandEmpty>
                      <CommandGroup>
                        {!isTeachersLoading &&
                          teachers?.teachers.map((teacher) => (
                            <CommandItem
                              key={teacher.id}
                              onSelect={() => {
                                const current = getValues("advisorTeacherId");
                                if (current === teacher.id) {
                                  setValue("advisorTeacherId", "none", {
                                    shouldValidate: true,
                                  });
                                } else {
                                  setValue("advisorTeacherId", teacher.id, {
                                    shouldValidate: true,
                                  });
                                }
                                setPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  teacherValue === teacher.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {teacher.name} {teacher.surname}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button
                  onClick={() => {
                    setValue("advisorTeacherId", "none", {
                      shouldValidate: true,
                    });
                  }}
                  variant="link"
                >
                  Clear
                </Button>
              </div>
            </div>

            <Dialog
              open={isLessonDialogOpen}
              onOpenChange={setLessonDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  disabled={isSubmitting}
                  variant="outline"
                  className={cn("flex items-center justify-center gap-2", {
                    "border-destructive text-destructive": errors.lessons,
                  })}
                >
                  <ExternalLink className="h-4 w-4" />
                  Semester Lessons
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[740px]">
                <DialogHeader>
                  <DialogTitle>Set Semester Lessons</DialogTitle>
                  <DialogDescription>
                    Set the semester lessons for this classroom.
                  </DialogDescription>
                </DialogHeader>
                <Table className="h-8 overflow-y-auto py-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/12">Remove</TableHead>
                      <TableHead className="w-2/5">Lesson Name</TableHead>
                      <TableHead className="w-1/3">Type</TableHead>
                      <TableHead>Weekly Hour</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((lessonItem, lessonIndex) => (
                      <TableRow key={lessonItem.id}>
                        <TableCell>
                          <Button
                            disabled={isSubmitting}
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              // add removed lesson to lessonList
                              const removedItem = getValues(
                                `lessons.${lessonIndex}`
                              );
                              if (removedItem) {
                                const currentLesson = lessons?.lessons?.find(
                                  (l) => l.id === removedItem.lessonId
                                );
                                if (currentLesson) {
                                  setLessonList((prev) => [
                                    ...prev,
                                    currentLesson,
                                  ]);
                                }
                              }

                              remove(lessonIndex);
                            }}
                          >
                            <Trash />
                          </Button>
                        </TableCell>
                        <TableCell className="w-2/5">
                          <Controller
                            control={control}
                            name={`lessons.${lessonIndex}.lessonName`}
                            render={({ field: { value, ref, onChange } }) => (
                              <Popover
                                open={isLessonPopoversOpen[lessonIndex]}
                                onOpenChange={(isOpen) =>
                                  setLessonPopoversOpen((prev) => {
                                    const newPopovers = [...prev];
                                    newPopovers[lessonIndex] = isOpen;
                                    return newPopovers;
                                  })
                                }
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    disabled={isSubmitting}
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={
                                      isLessonPopoversOpen[lessonIndex]
                                    }
                                    className="w-full justify-between"
                                  >
                                    {value && value !== ""
                                      ? value
                                      : "Select a lesson"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-full p-0"
                                  align="start"
                                >
                                  <Command className="w-80">
                                    <CommandInput placeholder="Find a lesson" />
                                    <CommandEmpty>
                                      No lesson found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {!isLessonsLoading &&
                                        lessonList.map((lesson) => (
                                          <CommandItem
                                            key={lesson.id}
                                            ref={ref}
                                            onSelect={() => {
                                              onChange(lesson.name);

                                              // if changing the lesson add previous lesson to lessonList
                                              // and remove the new lesson from lessonList
                                              // else only remove the lesson from lessonList

                                              const currentLessonId = getValues(
                                                `lessons.${lessonIndex}.lessonId`
                                              );

                                              if (currentLessonId !== "") {
                                                const currentLesson =
                                                  lessons?.lessons?.find(
                                                    (l) =>
                                                      l.id === currentLessonId
                                                  );
                                                if (currentLesson) {
                                                  setLessonList((prev) => [
                                                    ...prev,
                                                    currentLesson,
                                                  ]);
                                                }
                                              }

                                              setLessonList((prev) =>
                                                prev.filter(
                                                  (l) => l.id !== lesson.id
                                                )
                                              );

                                              setValue(
                                                `lessons.${lessonIndex}.lessonId`,
                                                lesson.id
                                              );
                                              setValue(
                                                `lessons.${lessonIndex}.lessonName`,
                                                lesson.name
                                              );

                                              setLessonPopoversOpen((prev) => {
                                                const newPopovers = [...prev];
                                                newPopovers[lessonIndex] =
                                                  false;
                                                return newPopovers;
                                              });
                                            }}
                                          >
                                            {lesson.name}
                                          </CommandItem>
                                        ))}
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            )}
                          ></Controller>
                        </TableCell>
                        <TableCell className="w-1/3 text-xs">
                          <span>
                            {
                              lessons?.lessons.find(
                                (l) =>
                                  l.id ===
                                  getValues(`lessons.${lessonIndex}.lessonId`)
                              )?.type
                            }
                          </span>
                        </TableCell>
                        <TableCell>
                          {/* <Controller
                          control={control}
                          name={`lessons.${lessonIndex}.weeklyHour`}
                          rules={{ pattern: /^[0-9]*$/ }}
                          render={({ field }) => (
                            <Input type="number" {...field} />
                          )}
                        ></Controller> */}
                          <Input
                            disabled={isSubmitting}
                            className="w-20"
                            type="number"
                            max={10}
                            {...register(`lessons.${lessonIndex}.weeklyHour`, {
                              valueAsNumber: true,
                            })}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between">
                  <Button
                    disabled={isSubmitting}
                    className="w-1/4"
                    onClick={appendLesson}
                  >
                    Add Lesson
                  </Button>
                  <span className="font-semibold">
                    Total Lessons: {lessonValue?.length}
                  </span>
                  <span className="pr-12 font-semibold">
                    Total Hours:{" "}
                    {lessonValue?.reduce(
                      (acc, curr) => acc + curr.weeklyHour,
                      0
                    )}
                  </span>
                </div>
                <DialogFooter>
                  <Button
                    variant="default"
                    onClick={() => setLessonDialogOpen(false)}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button disabled={isSubmitting || isEditing} type="submit">
              {isSubmitting ? (
                <>
                  <Oval
                    height={20}
                    width={20}
                    strokeWidth={4}
                    strokeWidthSecondary={3}
                    color="#5090FF"
                    secondaryColor="#FFFFFF"
                  />
                  <span>Edit Classroom</span>
                </>
              ) : (
                "Edit Classroom"
              )}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Classrooms: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Classrooms | TimetablePro</title>
        <meta name="description" content="TimetablePro Classrooms" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex w-full flex-col md:flex-row">
          <CreateClassroom />
          <ClassroomTableView />
        </div>
      </Layout>
    </>
  );
};

export default Classrooms;
