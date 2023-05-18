// TODO : Add lesson select to teacher creation form
// TODO : Add select option to existing departments from department table
// TODO : Handle responsiveness (sheet component also)

import { zodResolver } from "@hookform/resolvers/zod";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import Layout from "~/components/dashboard/Layout";
import { api } from "~/utils/api";
import teacherSchema, { type TeacherInput } from "~/schemas/teacher";
import {
  ClassHour,
  type Teacher,
  type Day,
  type TeacherWorkPreferance,
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
import { ExternalLink, Trash2 } from "lucide-react";
import { Oval } from "react-loader-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/ui/data-table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

interface TimePreference {
  day: Day;
  classHour: ClassHour[];
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const teacherColumns: ColumnDef<Teacher>[] = [
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
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "edit",
    header: "",
    cell: ({ row }) => {
      const teacherId = row.getValue("id");
      return <EditTeacher teacherId={(teacherId as string) ?? ""} />;
    },
  },
  {
    accessorKey: "delete",
    header: "",
    cell: ({ row }) => {
      const { mutateAsync, isLoading } =
        api.dashboard.deleteTeacher.useMutation();

      const handleDelete = async () => {
        await mutateAsync({ teacherId: row.getValue("id") });
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
  const { data: teachers } = api.dashboard.getTeachers.useQuery();

  return (
    <div className="pt-12">
      <DataTable columns={teacherColumns} data={teachers?.teachers ?? []} />
    </div>
  );
};

const CreateTeacher = () => {
  const { toast } = useToast();
  const [isPrefDialogOpen, setIsPrefDialogOpen] = useState(false);
  // timePref state
  const [timePreferences, setTimePreferences] = useState<TimePreference[]>([
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
  ]);

  const {
    register,
    unregister,
    handleSubmit,
    getValues,
    setValue,
    control,
    reset,
    formState: { isSubmitting, isSubmitSuccessful },
  } = useForm<TeacherInput>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      timePreferences: timePreferences,
    },
  });
  const createUserAccountChecked = useWatch({ control, name: "createUser" });

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading } = api.dashboard.createTeacher.useMutation({
    onSuccess: () => {
      toast({
        title: "Teacher created successfully",
      });

      // invalidate teacher table
      void trpcContext.dashboard.getTeachers.invalidate();
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
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <div className="flex w-full flex-col items-center justify-start pt-12 lg:min-w-[50%]">
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
          <Label htmlFor="department">Department</Label>
          <Input
            disabled={isLoading || isSubmitting}
            type="text"
            id="department"
            {...register("department")}
          />
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
          <DialogTrigger asChild>
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

        <Button disabled={isLoading || isSubmitting} type="submit">
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
  teacherId: string;
};
const EditTeacher = ({ teacherId }: EditTeacherProps) => {
  const [windowSize, setWindowSize] = useState([1440, 1070]);
  const [openSheet, setOpenSheet] = useState(false);
  const {
    data: teacher,
    isLoading,
    refetch,
  } = api.dashboard.getTeacher.useQuery({
    teacherId,
  });

  const { toast } = useToast();
  const [isPrefDialogOpen, setIsPrefDialogOpen] = useState(false);
  // timePref state
  const [timePreferences, setTimePreferences] = useState<TimePreference[]>([
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
  ]);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { isSubmitting, isSubmitSuccessful },
  } = useForm<TeacherInput>({
    resolver: zodResolver(teacherSchema),
  });

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading: isEditing } =
    api.dashboard.updateTeacher.useMutation({
      onSuccess: () => {
        toast({
          title: "Teacher edited successfully",
        });

        // invalidate teacher table
        void trpcContext.dashboard.getTeachers.invalidate();
        void refetch();

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
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  useEffect(() => {
    if (!isLoading) {
      const timePref = teacher?.foundTeacher?.TeacherWorkPreferance.map(
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
    }
  }, [isLoading, teacher, setValue]);

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
        {isLoading ? (
          <SheetHeader className="items-center justify-center">
            <Oval
              height={60}
              width={60}
              strokeWidth={4}
              color="#0F1729"
              secondaryColor="#0F1729"
            />
          </SheetHeader>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>
                Edit Teacher {teacher?.foundTeacher?.name}
              </SheetTitle>
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
                    defaultValue={teacher?.foundTeacher?.name}
                    disabled={isLoading || isSubmitting || isEditing}
                    type="text"
                    id="name"
                    {...register("name")}
                  />
                </div>
                <div>
                  <Label htmlFor="surname">Surname</Label>
                  <Input
                    defaultValue={teacher?.foundTeacher?.surname}
                    disabled={isLoading || isSubmitting || isEditing}
                    type="text"
                    id="surname"
                    {...register("surname")}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    defaultValue={teacher?.foundTeacher?.department ?? ""}
                    disabled={isLoading || isSubmitting || isEditing}
                    type="text"
                    id="department"
                    {...register("department")}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    defaultValue={teacher?.foundTeacher?.description ?? ""}
                    disabled={isLoading || isSubmitting || isEditing}
                    id="description"
                    {...register("description")}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    defaultValue={teacher?.foundTeacher?.User?.email ?? ""}
                    disabled={isLoading || isSubmitting || isEditing}
                    type="email"
                    id="email"
                    {...register("email", { required: false })}
                  />
                </div>
                <div className="pb-8">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    disabled={isLoading || isSubmitting || isEditing}
                    type="password"
                    id="password"
                    {...register("password", { required: false })}
                  />
                </div>

                <Dialog
                  open={isPrefDialogOpen}
                  onOpenChange={setIsPrefDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      disabled={isLoading || isSubmitting || isEditing}
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
                                      disabled={
                                        isLoading || isSubmitting || isEditing
                                      }
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

                <Button
                  disabled={isLoading || isSubmitting || isEditing}
                  type="submit"
                >
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
                      <span>Edit Teacher</span>
                    </>
                  ) : (
                    "Edit Teacher"
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
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
        <div className="flex flex-col md:flex-row">
          <CreateTeacher />
          <TeacherTableView />
        </div>
      </Layout>
    </>
  );
};

export default Teachers;
