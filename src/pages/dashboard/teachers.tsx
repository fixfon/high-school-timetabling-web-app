import { zodResolver } from "@hookform/resolvers/zod";
import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useReducer, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "~/components/dashboard/Layout";
import { api } from "~/utils/api";
import teacherSchema, {
  type TeacherTimePreferenceInput,
  type TeacherInput,
} from "~/schemas/teacher";
import {
  ClassHour,
  type Teacher,
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/utils/cn";

const baseTimePref: TeacherTimePreferenceInput[] = [
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

type TeacherFormProps = {
  defaultValue?: TeacherInput;
  onSubmit: (data: TeacherInput) => Promise<void>;
  isMutating?: boolean;
};

const TeacherForm = ({
  defaultValue,
  onSubmit,
  isMutating,
}: TeacherFormProps) => {
  const [isPrefDialogOpen, setIsPrefDialogOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLessonSet, setIsLessonSet] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState<Lesson[]>([]);
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);

  const form = useForm<TeacherInput>({
    resolver: zodResolver(teacherSchema),
    mode: "onChange",
    defaultValues: {
      id: defaultValue?.id ?? undefined,
      name: defaultValue?.name ?? "",
      surname: defaultValue?.surname ?? "",
      description: defaultValue?.description ?? "",
      createUser: defaultValue?.email ? true : false,
      email: defaultValue?.email ?? "",
      password: "",
      departmentId: defaultValue?.departmentId ?? undefined,
      timePreferences: defaultValue?.timePreferences ?? baseTimePref,
      lessonIds: defaultValue?.lessonIds ?? [],
    },
  });

  const createUserChecked = form.watch("createUser");

  const { data: department, isFetched: isDepartmentFetched } =
    api.department.getDepartments.useQuery(undefined, {
      enabled: true,
    });

  const {
    data: lesson,
    isFetched: isLessonFetched,
    refetch: refetchLesson,
  } = api.lesson.getLessons.useQuery();

  const formSubmit = async (values: TeacherInput) => {
    await onSubmit(values);
    form.reset();
    setSelectedLessons([]);
    await refetchLesson();
    setIsLessonSet(false);
  };

  useEffect(() => {
    if (isLessonFetched && !isLessonSet) {
      if (defaultValue?.lessonIds && defaultValue.lessonIds?.length > 0) {
        const selected = lesson?.lessons.filter((lesson) =>
          defaultValue.lessonIds?.includes(lesson.id)
        );
        setSelectedLessons(selected ?? []);
        setAvailableLessons(
          lesson?.lessons.filter(
            (lesson) => !defaultValue.lessonIds?.includes(lesson.id)
          ) ?? []
        );

        form.setValue("lessonIds", [...defaultValue.lessonIds]);
      } else {
        setAvailableLessons(lesson?.lessons ?? []);
      }
      setIsLessonSet(true);
    }
  }, [defaultValue, isLessonFetched, isLessonSet, lesson?.lessons, form]);

  return (
    <Form {...form}>
      <form
        className="mt-8 flex w-full flex-col space-y-3 px-8"
        onSubmit={form.handleSubmit(formSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting || !!isMutating}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="surname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Surname</FormLabel>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting || !!isMutating}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger
                    disabled={form.formState.isSubmitting || !!isMutating}
                  >
                    <SelectValue placeholder="Select a department">
                      {isDepartmentFetched && field.value
                        ? department?.departments.find(
                            (department) => department.id === field.value
                          )?.name
                        : "Select a department"}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Departments</SelectLabel>
                    {isDepartmentFetched &&
                      department?.departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  disabled={form.formState.isSubmitting || !!isMutating}
                  placeholder="Description about the teacher"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="createUser"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  disabled={form.formState.isSubmitting || !!isMutating}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Create User Account</FormLabel>
                <FormDescription>
                  You can select to create a user account to your teacher
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {createUserChecked && (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={form.formState.isSubmitting || !!isMutating}
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      disabled={form.formState.isSubmitting || !!isMutating}
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="timePreferences"
          render={() => (
            <FormItem>
              <FormLabel>Teacher Time Preferences</FormLabel>
              <FormDescription>
                Set the days and class hours the teacher is available.
              </FormDescription>
              <Dialog
                open={isPrefDialogOpen}
                onOpenChange={setIsPrefDialogOpen}
              >
                <DialogTrigger className="w-full" asChild>
                  <Button
                    disabled={form.formState.isSubmitting || !!isMutating}
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
                        {Array.from([
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                        ]).map((day, dayIndex) => (
                          <FormField
                            key={dayIndex}
                            control={form.control}
                            name={`timePreferences.${dayIndex}`}
                            render={() => (
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
                                    <FormField
                                      key={i}
                                      control={form.control}
                                      name={`timePreferences.${dayIndex}.classHour`}
                                      render={({ field }) => (
                                        <TableCell key={i}>
                                          <FormItem>
                                            <FormControl>
                                              <Checkbox
                                                disabled={
                                                  form.formState.isSubmitting ||
                                                  !!isMutating
                                                }
                                                id={`${dayIndex}-${elem}`}
                                                checked={field.value?.includes(
                                                  elem
                                                )}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([
                                                        ...field.value,
                                                        elem,
                                                      ])
                                                    : field.onChange(
                                                        field.value.filter(
                                                          (e) => e !== elem
                                                        )
                                                      );
                                                }}
                                              />
                                            </FormControl>
                                          </FormItem>
                                        </TableCell>
                                      )}
                                    />
                                  )
                                )}
                              </TableRow>
                            )}
                          />
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
            </FormItem>
          )}
        />

        {selectedLessons.length > 0 && (
          <FormField
            control={form.control}
            name="lessonIds"
            render={() => (
              <FormItem>
                <FormLabel>Selected Lessons</FormLabel>
                <FormDescription>
                  View or remove selected lessons
                </FormDescription>
                <div className="flex max-w-full flex-row flex-wrap rounded-md border px-2 py-2">
                  {selectedLessons.map((lesson, index) => (
                    <FormControl key={index}>
                      <div
                        key={index}
                        className="mr-2 flex h-min max-w-[120px] items-center justify-center rounded-md border px-2 py-1 transition-colors hover:cursor-pointer hover:bg-accent"
                        onClick={() => {
                          if (form.formState.isSubmitting || !!isMutating)
                            return;

                          const prevLessonIds = form.getValues("lessonIds");
                          if (prevLessonIds) {
                            form.setValue(
                              "lessonIds",
                              prevLessonIds.filter((l) => l !== lesson.id)
                            );

                            setSelectedLessons((prev) =>
                              prev.filter((l) => l !== lesson)
                            );
                            setAvailableLessons((prev) => [...prev, lesson]);
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
                    </FormControl>
                  ))}
                </div>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="lessonIds"
          render={({ field }) => (
            <FormItem>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      disabled={form.formState.isSubmitting || !!isMutating}
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      Select lesson
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command className="w-80">
                    <CommandInput placeholder="Search lesson..." />
                    <CommandEmpty>No lesson found.</CommandEmpty>
                    <CommandGroup>
                      {availableLessons.map((lesson) => (
                        <CommandItem
                          key={lesson.id}
                          onSelect={() => {
                            // push value to form lessonId array
                            const prevLessonIds = form.getValues("lessonIds");
                            if (prevLessonIds) {
                              form.setValue("lessonIds", [
                                ...prevLessonIds,
                                lesson.id,
                              ]);
                            } else {
                              form.setValue("lessonIds", [lesson.id]);
                            }

                            // add selected lesson to selected lessons
                            setSelectedLessons((prev) => [lesson, ...prev]);

                            // remove selected lesson from available lessons
                            setAvailableLessons((prev) =>
                              prev.filter((l) => l.id !== lesson.id)
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

const CreateTeacher = () => {
  const { toast } = useToast();

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading: isMutating } =
    api.teacher.createTeacher.useMutation({
      onSuccess: async () => {
        toast({
          title: "Create",
          description: "Teacher created successfully",
        });
        // invalidate teacher table
        await trpcContext.teacher.getTeachers.invalidate();
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error creating teacher",
          description: err.message,
        });
      },
    });

  const onSubmit = async (data: TeacherInput) => {
    toast({
      title: "Create",
      description: "Creating teacher...",
    });

    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  return (
    <div className="flex w-3/4 flex-col items-center justify-start pt-12 lg:w-2/5">
      <h1 className="text-2xl font-bold">Create Teacher</h1>
      <TeacherForm onSubmit={onSubmit} isMutating={isMutating} />
    </div>
  );
};

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
      return <EditTeacher row={row} />;
    },
  },
  {
    accessorKey: "delete",
    header: "",
    cell: ({ row }) => {
      const { id } = row.original;
      return <TeacherDeleteButton id={id} />;
    },
  },
];

const TeacherDeleteButton = ({ id }: { id: string }) => {
  const { toast } = useToast();
  const trpcContext = api.useContext();

  const { mutateAsync, isLoading } = api.teacher.deleteTeacher.useMutation({
    onSuccess: async () => {
      toast({
        title: "Delete",
        description: "Teacher deleted successfully",
      });

      // validate data
      await trpcContext.teacher.getTeachers.invalidate();
    },
  });

  const handleDelete = async () => {
    toast({
      title: "Delete",
      description: "Deleting teacher...",
    });

    await mutateAsync({ teacherId: id });
  };

  return (
    <Button disabled={isLoading} variant="destructive" onClick={handleDelete}>
      <Trash2 className="h-5 w-5" />
    </Button>
  );
};

const TeacherTableView = () => {
  const { data: teachers } = api.teacher.getTeachers.useQuery();
  return (
    <div className="w-full pt-12 lg:w-3/5">
      <DataTable columns={teacherColumns} data={teachers?.teachers ?? []} />
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
  const { toast } = useToast();
  const rerender = useReducer(() => ({}), {})[1];
  const [windowSize, setWindowSize] = useState([1440, 1070]);
  const [openSheet, setOpenSheet] = useState(false);
  const [defaultValue, setDefaultValue] = useState<TeacherInput>();

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading: isEditing } =
    api.teacher.updateTeacher.useMutation({
      onSuccess: async () => {
        toast({
          title: "Edit",
          description: "Teacher edited successfully",
        });

        // invalidate teacher table
        await trpcContext.teacher.getTeachers.invalidate();
        // reset();
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

  const onSubmit = async (data: TeacherInput) => {
    toast({
      title: "Edit",
      description: "Editing teacher...",
    });

    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  const setDefaultValues = useCallback(() => {
    const {
      id,
      name,
      surname,
      description,
      departmentId,
      TeacherLesson,
      TeacherWorkPreferance,
      User,
    } = row.original;

    const lessonIds = TeacherLesson.map((tl) => tl.lessonId);
    setDefaultValue({
      id,
      name,
      surname,
      description: description ?? "",
      departmentId: departmentId ?? undefined,
      createUser: true,
      email: User?.email ?? "",
      timePreferences: TeacherWorkPreferance.map((tw) => ({
        day: tw.workingDay,
        classHour: tw.workingHour,
      })),
      lessonIds: [...lessonIds] ?? [],
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
          <SheetTitle>Edit Teacher {row.original.name}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-start pt-6">
          {defaultValue ? (
            <TeacherForm
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

const Teachers: NextPage = () => {
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
