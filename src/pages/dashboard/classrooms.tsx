import { zodResolver } from "@hookform/resolvers/zod";
import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useReducer, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import Layout from "~/components/dashboard/Layout";
import { api } from "~/utils/api";
import {
  type Lesson,
  type Classroom,
  type Teacher,
  type ClassroomLesson,
  type LessonType,
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

const LessonTypeMap: Record<LessonType | "None", string> = {
  COMPULSORY: "Compulsory",
  DEPARTMENTAL_COMPULSORY: "Departmental Compulsory",
  ELECTIVE: "Elective",
  None: "None",
};

type ClassroomFormProps = {
  defaultValue?: ClassroomInput;
  onSubmit: (data: ClassroomInput) => Promise<void>;
  isMutating?: boolean;
};

const ClassroomForm = ({
  defaultValue,
  onSubmit,
  isMutating,
}: ClassroomFormProps) => {
  const [isLessonSet, setIsLessonSet] = useState(false);
  const [isTeacherPopoverOpen, setIsTeacherPopoverOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isLessonPopoversOpen, setIsLessonPopoversOpen] = useState<boolean[]>(
    []
  );
  const [selectedLessons, setSelectedLessons] = useState<Lesson[]>([]);
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);

  const form = useForm<ClassroomInput>({
    resolver: zodResolver(classroomSchema),
    mode: "onChange",
    defaultValues: {
      id: defaultValue?.id ?? undefined,
      classLevel: defaultValue?.classLevel ?? undefined,
      code: defaultValue?.code ?? undefined,
      branch: defaultValue?.branch ?? undefined,
      advisorTeacherId: defaultValue?.advisorTeacherId ?? undefined,
      lessons: defaultValue?.lessons ?? undefined,
    },
  });

  const totalWeeklyHour = form.watch("lessons", []).reduce((acc, curr) => {
    return acc + curr.weeklyHour;
  }, 0);

  const {
    fields: lessonFields,
    append: appendLesson,
    remove: removeLesson,
  } = useFieldArray({
    name: "lessons",
    control: form.control,
  });

  const appendLessonFunc = () => {
    appendLesson({
      lessonId: "",
      lessonName: "",
      weeklyHour: 0,
    });
    setIsLessonPopoversOpen((prev) => [...prev, false]);

    if (form.formState.errors.lessons) form.clearErrors("lessons");
  };

  const { data: teacher, isLoading: isTeacherLoading } =
    api.teacher.getTeachers.useQuery();

  const {
    data: lesson,
    isFetched: isLessonFetched,
    refetch: refetchLesson,
  } = api.lesson.getLessons.useQuery();

  const formSubmit = async (data: ClassroomInput) => {
    await onSubmit(data);
    setSelectedLessons([]);
    await refetchLesson();
    form.reset();
    setIsLessonSet(false);
  };

  useEffect(() => {
    if (isLessonFetched && !isLessonSet) {
      if (defaultValue?.lessons && defaultValue.lessons.length > 0) {
        const selected = lesson?.lessons.filter((lesson) =>
          defaultValue.lessons.some((l) => l.lessonId === lesson.id)
        );

        setSelectedLessons(selected ?? []);
        setAvailableLessons(
          lesson?.lessons.filter(
            (lesson) =>
              !defaultValue.lessons.some((l) => l.lessonId === lesson.id)
          ) ?? []
        );
      } else {
        setAvailableLessons(lesson?.lessons ?? []);
      }
      setIsLessonSet(true);
    }
  }, [defaultValue, isLessonFetched, isLessonSet, lesson?.lessons]);

  return (
    <Form {...form}>
      <form
        className="mt-8 flex w-full flex-col space-y-3 px-8"
        onSubmit={form.handleSubmit(formSubmit)}
      >
        <FormField
          control={form.control}
          name="classLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Level</FormLabel>
              <FormDescription>Select the classroom grade</FormDescription>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger
                    disabled={form.formState.isSubmitting || !!isMutating}
                  >
                    <SelectValue aria-label={field.value}>
                      {ClassLevelMap[field.value] ?? "Select a class level"}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Code</FormLabel>
              <FormDescription>Select the classroom code</FormDescription>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger
                    className="w-full"
                    disabled={form.formState.isSubmitting || !!isMutating}
                  >
                    <SelectValue aria-label={field.value}>
                      {field.value ?? "Select a class code"}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch</FormLabel>
              <FormDescription>Select the classroom branch</FormDescription>
              <div className="flex items-center justify-center">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? "none"}
                >
                  <FormControl>
                    <SelectTrigger
                      className="w-full"
                      disabled={form.formState.isSubmitting || !!isMutating}
                    >
                      <SelectValue
                        placeholder="Select a branch"
                        aria-label={field.value ?? "none"}
                      >
                        {field.value === "none" || !field.value
                          ? "Select a branch"
                          : field.value}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
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
                <Button
                  type="button"
                  disabled={form.formState.isSubmitting || !!isMutating}
                  onClick={() => {
                    form.setValue("branch", "none");
                  }}
                  variant="link"
                >
                  Clear
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="advisorTeacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Advisor Teacher</FormLabel>
              <FormDescription>
                Select the advisor teacher for the classroom
              </FormDescription>
              <div className="flex items-center justify-center">
                <Popover
                  open={isTeacherPopoverOpen}
                  onOpenChange={setIsTeacherPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        disabled={form.formState.isSubmitting || !!isMutating}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? (() => {
                              const foundTeacher = teacher?.teachers?.find(
                                (t) => t.id === field.value
                              );
                              return foundTeacher
                                ? `${foundTeacher.name} ${foundTeacher.surname}`
                                : "Teacher not found";
                            })()
                          : "Select a teacher"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command className="w-80">
                      <CommandInput placeholder="Search teacher..." />
                      <CommandEmpty>No teacher found.</CommandEmpty>
                      <CommandGroup>
                        {isTeacherLoading ? (
                          <Oval
                            height={20}
                            width={20}
                            strokeWidth={4}
                            strokeWidthSecondary={3}
                            color="#5090FF"
                            secondaryColor="#FFFFFF"
                          />
                        ) : (
                          teacher?.teachers.map((teacher) => (
                            <CommandItem
                              key={teacher.id}
                              onSelect={() => {
                                field.onChange(
                                  field.value === teacher.id ? null : teacher.id
                                );
                                setIsTeacherPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === teacher.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {teacher.name} {teacher.surname}
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  disabled={form.formState.isSubmitting || !!isMutating}
                  onClick={() => {
                    form.setValue("advisorTeacherId", null);
                  }}
                  variant="link"
                >
                  Clear
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lessons"
          render={() => (
            <FormItem>
              <FormLabel>Semester Lessons</FormLabel>
              <FormDescription>
                Select the lessons for the classroom
              </FormDescription>
              <Dialog
                open={isLessonDialogOpen}
                onOpenChange={setIsLessonDialogOpen}
              >
                <DialogTrigger className="w-full" asChild>
                  <Button
                    type="button"
                    disabled={form.formState.isSubmitting || !!isMutating}
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Select Lessons
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
                      {lessonFields.map((lessonItem, lessonIndex) => (
                        <FormField
                          key={lessonItem.id}
                          control={form.control}
                          name={`lessons.${lessonIndex}`}
                          render={({ field: masterField }) => (
                            <TableRow key={lessonItem.id}>
                              <TableCell>
                                <Button
                                  type="button"
                                  disabled={
                                    form.formState.isSubmitting || !!isMutating
                                  }
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    // add removed lesson from selected lessons
                                    // add removed lesson to available lessons

                                    const removedLesson = selectedLessons.find(
                                      (l) => l.id === masterField.value.lessonId
                                    );

                                    if (removedLesson) {
                                      setSelectedLessons((prev) => {
                                        return prev.filter(
                                          (l) => l.id !== removedLesson.id
                                        );
                                      });

                                      setAvailableLessons((prev) => {
                                        return [...prev, removedLesson];
                                      });
                                    }

                                    removeLesson(lessonIndex);
                                  }}
                                >
                                  <Trash />
                                </Button>
                              </TableCell>
                              <TableCell className="w-2/5">
                                <FormField
                                  control={form.control}
                                  name={`lessons.${lessonIndex}.lessonName`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <Popover
                                        open={isLessonPopoversOpen[lessonIndex]}
                                        onOpenChange={(isOpen) =>
                                          setIsLessonPopoversOpen((prev) => {
                                            const newPopovers = [...prev];
                                            newPopovers[lessonIndex] = isOpen;
                                            return newPopovers;
                                          })
                                        }
                                      >
                                        <PopoverTrigger asChild>
                                          <FormControl>
                                            <Button
                                              type="button"
                                              disabled={
                                                form.formState.isSubmitting ||
                                                !!isMutating
                                              }
                                              variant="outline"
                                              role="combobox"
                                              aria-expanded={
                                                isLessonPopoversOpen[
                                                  lessonIndex
                                                ]
                                              }
                                              className={cn(
                                                "w-full justify-between",
                                                !field.value &&
                                                  "text-muted-foreground"
                                              )}
                                            >
                                              {field.value
                                                ? field.value
                                                : "Select a lesson"}
                                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                          </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          className="w-full p-0"
                                          align="start"
                                        >
                                          <Command className="w-80">
                                            <CommandInput placeholder="Search lesson..." />
                                            <CommandEmpty>
                                              No lesson found.
                                            </CommandEmpty>
                                            <CommandGroup>
                                              {isLessonSet &&
                                                availableLessons.map(
                                                  (lesson) => (
                                                    <CommandItem
                                                      key={lesson.id}
                                                      onSelect={() => {
                                                        field.onChange(
                                                          lesson.name
                                                        );
                                                        if (
                                                          masterField.value
                                                            .lessonId
                                                        ) {
                                                          // add previous lesson to availableLessons
                                                          // deduct this selected from availableLessons
                                                          // add selected lesson to selectedLessons
                                                          const previousLesson =
                                                            selectedLessons.find(
                                                              (l) =>
                                                                l.id ===
                                                                masterField
                                                                  .value
                                                                  .lessonId
                                                            );

                                                          const selectedLesson =
                                                            availableLessons.find(
                                                              (l) =>
                                                                l.id ===
                                                                lesson.id
                                                            );

                                                          if (
                                                            previousLesson &&
                                                            selectedLesson
                                                          ) {
                                                            setSelectedLessons(
                                                              (prev) => {
                                                                const filtered =
                                                                  prev.filter(
                                                                    (l) =>
                                                                      l.id !==
                                                                      previousLesson.id
                                                                  );

                                                                return [
                                                                  ...filtered,
                                                                  selectedLesson,
                                                                ];
                                                              }
                                                            );

                                                            setAvailableLessons(
                                                              (prev) => {
                                                                const filtered =
                                                                  prev.filter(
                                                                    (l) =>
                                                                      l.id !==
                                                                      selectedLesson.id
                                                                  );

                                                                return [
                                                                  ...filtered,
                                                                  previousLesson,
                                                                ];
                                                              }
                                                            );
                                                          }
                                                        } else {
                                                          // first select add this lesson to selectedLesson
                                                          // deduct from availableLessons
                                                          setSelectedLessons(
                                                            (prev) => [
                                                              ...prev,
                                                              lesson,
                                                            ]
                                                          );
                                                          setAvailableLessons(
                                                            (prev) =>
                                                              prev.filter(
                                                                (l) =>
                                                                  l.id !==
                                                                  lesson.id
                                                              )
                                                          );
                                                        }

                                                        form.setValue(
                                                          `lessons.${lessonIndex}.lessonId`,
                                                          lesson.id
                                                        );

                                                        setIsLessonPopoversOpen(
                                                          (prev) => {
                                                            const newPopovers =
                                                              [...prev];
                                                            newPopovers[
                                                              lessonIndex
                                                            ] = false;
                                                            return newPopovers;
                                                          }
                                                        );
                                                      }}
                                                    >
                                                      {lesson.name}
                                                    </CommandItem>
                                                  )
                                                )}
                                            </CommandGroup>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell className="w-1/3 text-xs">
                                <span>
                                  {
                                    LessonTypeMap[
                                      lesson?.lessons.find(
                                        (l) =>
                                          l.id === masterField.value.lessonId
                                      )?.type ?? "None"
                                    ]
                                  }
                                </span>
                              </TableCell>
                              <FormField
                                control={form.control}
                                name={`lessons.${lessonIndex}.weeklyHour`}
                                render={({ field }) => (
                                  <TableCell>
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          disabled={
                                            form.formState.isSubmitting ||
                                            !!isMutating
                                          }
                                          className="w-20"
                                          type="number"
                                          max={10}
                                          min={1}
                                          inputMode="numeric"
                                          {...field}
                                          onChange={(e) => {
                                            field.onChange(
                                              Number(e.target.value)
                                            );
                                          }}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  </TableCell>
                                )}
                              />
                            </TableRow>
                          )}
                        />
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      disabled={form.formState.isSubmitting || !!isMutating}
                      className="w-1/4"
                      onClick={appendLessonFunc}
                    >
                      Add Lesson
                    </Button>
                    <span className="font-semibold">
                      Total Lessons: {selectedLessons?.length}
                    </span>
                    <span className="pr-12 font-semibold">
                      Total Hours: {totalWeeklyHour}
                    </span>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      variant="default"
                      onClick={() => setIsLessonDialogOpen(false)}
                    >
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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

const CreateClassroom = () => {
  const { toast } = useToast();

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading } = api.classroom.createClassroom.useMutation({
    onSuccess: () => {
      toast({
        title: "Create",
        description: "Classroom created successfully",
      });
      // invalidate classroom table
      void trpcContext.classroom.getClassrooms.invalidate();
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error creating classroom",
        description: err.message,
      });
    },
  });

  const onSubmit = async (data: ClassroomInput) => {
    toast({
      title: "Create",
      description: "Creating the classroom...",
    });
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  return (
    <div className="flex w-3/4 flex-col items-center justify-start pt-12 lg:w-2/5">
      <h1 className="text-2xl font-bold">Create Classroom</h1>
      <ClassroomForm onSubmit={onSubmit} isMutating={isLoading} />
    </div>
  );
};

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
    accessorKey: "",
    header: "Total Lessons",
    cell: ({ row }) => {
      const lessons = row.original.ClassroomLesson;

      return lessons.length;
    },
  },
  {
    accessorKey: "",
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
      return <DeleteClassroomButton id={id} />;
    },
  },
];

const DeleteClassroomButton = ({ id }: { id: string }) => {
  const { toast } = useToast();
  const trpcContext = api.useContext();

  const { mutateAsync, isLoading } = api.classroom.deleteClassroom.useMutation({
    onSuccess: async () => {
      toast({
        title: "Delete",
        description: "Classroom deleted successfully",
      });

      // validate data
      await trpcContext.classroom.getClassrooms.invalidate();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Delete",
        description: "Error deleting classroom",
      });
    },
  });

  const handleDelete = async () => {
    toast({
      title: "Delete",
      description: "Deleting classroom...",
    });
    await mutateAsync({ classroomId: id });
  };

  return (
    <Button disabled={isLoading} variant="destructive" onClick={handleDelete}>
      <Trash2 className="h-5 w-5" />
    </Button>
  );
};

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
  const { toast } = useToast();
  const rerender = useReducer(() => ({}), {})[1];
  const [windowSize, setWindowSize] = useState([1440, 1070]);
  const [openSheet, setOpenSheet] = useState(false);
  const [defaultValue, setDefaultValue] = useState<ClassroomInput>();

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading: isEditing } =
    api.classroom.updateClassroom.useMutation({
      onSuccess: async () => {
        toast({
          title: "Edit",
          description: "Classroom edited successfully",
        });

        // invalidate teacher table
        await trpcContext.classroom.getClassrooms.invalidate();
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

  const onSubmit = async (data: ClassroomInput) => {
    toast({
      title: "Edit",
      description: "Editing classroom...",
    });
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  const setDefaultValues = useCallback(() => {
    const { id, classLevel, code, branch, advisorTeacherId, ClassroomLesson } =
      row.original;

    const selectedLessonObj = ClassroomLesson.map((cl) => {
      return {
        lessonId: cl.lessonId,
        lessonName: cl.Lesson.name,
        weeklyHour: cl.weeklyHour,
      };
    });
    setDefaultValue({
      id,
      classLevel,
      code,
      branch: branch ?? undefined,
      advisorTeacherId: advisorTeacherId ?? undefined,
      lessons: selectedLessonObj,
    });
  }, [row.original]);

  useEffect(() => {
    if (openSheet) {
      setDefaultValues();
    }
  }, [openSheet, setDefaultValues]);

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

      <SheetContent
        className="overflow-y-auto"
        size={windowSize.at(0)! <= 1024 ? "full" : "default"}
      >
        <SheetHeader>
          <SheetTitle>
            Edit Classroom{" "}
            {ClassLevelMap[row.original.classLevel] + " " + row.original.code}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-start pt-6">
          {defaultValue ? (
            <ClassroomForm
              onSubmit={onSubmit}
              isMutating={isEditing}
              defaultValue={defaultValue}
            />
          ) : (
            <Oval
              height={80}
              width={80}
              strokeWidth={4}
              strokeWidthSecondary={3}
              color="#5090FF"
              secondaryColor="#FFFFFF"
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Classrooms: NextPage = () => {
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
