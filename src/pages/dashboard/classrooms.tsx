// TODO : Add lesson select to classroom creation form
// TODO : Add branch select if the class level higher than 10

import { zodResolver } from "@hookform/resolvers/zod";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import Layout from "~/components/dashboard/Layout";
import { api } from "~/utils/api";
import { ClassHour, type Classroom } from "@prisma/client";
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import classroomSchema, { type ClassroomInput } from "~/schemas/classroom";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const classroomColumns: ColumnDef<Classroom>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "classLevel",
    header: "Class Level",
  },
  {
    accessorKey: "branch",
    header: "Branch",
  },
  {
    accessorKey: "advisorTeacherId",
    header: "Advisor Teacher",
    cell: ({ row }) => {
      //handle see teacher name from id
    },
  },
  {
    accessorKey: "edit",
    header: "",
    cell: ({ row }) => {
      const classroomId = row.getValue("id");
      return <EditClassroom classroomId={(classroomId as string) ?? ""} />;
    },
  },
  {
    accessorKey: "delete",
    header: "",
    cell: ({ row }) => {
      const { mutateAsync, isLoading } =
        api.classroom.deleteClassroom.useMutation();

      const handleDelete = async () => {
        await mutateAsync({ classroomId: row.getValue("id") });
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
    <div className="pt-12">
      <DataTable columns={classroomColumns} data={classrooms ?? []} />
    </div>
  );
};

const CreateClassroom = () => {
  const { toast } = useToast();
  const [isPrefDialogOpen, setIsPrefDialogOpen] = useState(false);

  const {
    register,
    unregister,
    handleSubmit,
    getValues,
    setValue,
    control,
    reset,
    formState: { isSubmitting, isSubmitSuccessful },
  } = useForm<ClassroomInput>({
    resolver: zodResolver(classroomSchema),
  });
  // const createUserAccountChecked = useWatch({ control, name: "createUser" });

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading } = api.classroom.createClassroom.useMutation({
    onSuccess: () => {
      toast({
        title: "Classroom created successfully",
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
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  // useEffect(() => {
  //   if (!createUserAccountChecked) {
  //     unregister("email");
  //     unregister("password");
  //   }
  // }, [unregister, createUserAccountChecked]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <div className="flex w-full flex-col items-center justify-start pt-12 lg:min-w-[50%]">
      <h1 className="text-2xl font-bold">Create Classroom</h1>
      <form
        className="mt-8 flex w-full flex-col space-y-3 px-8"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Label htmlFor="name">Class Level</Label>
          <Input
            disabled={isLoading || isSubmitting}
            type="text"
            id="name"
            {...register("classLevel")}
          />
        </div>
        <div>
          <Label htmlFor="surname">Class Code</Label>
          <Input
            disabled={isLoading || isSubmitting}
            type="text"
            id="surname"
            {...register("code")}
          />
        </div>
        <div>
          <Label htmlFor="department">Branch</Label>
          <Input
            disabled={isLoading || isSubmitting}
            type="text"
            id="department"
            {...register("branch")}
          />
        </div>
        <div>
          <Label htmlFor="description">Semester Lessons</Label>
          <Textarea
            disabled={isLoading || isSubmitting}
            id="description"
            {...register("lessonIds")}
          />
        </div>

        <div>
          <Label htmlFor="email">Advisor Teacher</Label>
          <Input
            disabled={isLoading || isSubmitting}
            type="email"
            id="email"
            {...register("advisorTeacherId", { required: false })}
          />
        </div>

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
  classroomId: string;
};
const EditClassroom = ({ classroomId }: EditClassroomProps) => {
  const [windowSize, setWindowSize] = useState([1440, 1070]);
  const [openSheet, setOpenSheet] = useState(false);
  const {
    data: classroom,
    isLoading,
    refetch,
  } = api.classroom.getClassroom.useQuery({
    classroomId,
  });

  const { toast } = useToast();
  const [isPrefDialogOpen, setIsPrefDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { isSubmitting, isSubmitSuccessful },
  } = useForm<ClassroomInput>({
    resolver: zodResolver(classroomSchema),
  });

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading: isEditing } =
    api.classroom.updateClassroom.useMutation({
      onSuccess: () => {
        toast({
          title: "Classroom edited successfully",
        });

        // invalidate teacher table
        void trpcContext.classroom.getClassrooms.invalidate();
        void refetch();

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
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  // useEffect(() => {
  //   if (!isLoading) {
  //     const timePref = teacher?.foundTeacher?.TeacherWorkPreferance.map(
  //       (pref: TeacherWorkPreferance) => {
  //         return {
  //           day: pref.workingDay,
  //           classHour: pref.workingHour,
  //         };
  //       }
  //     );

  //     if (timePref) {
  //       setValue("timePreferences", timePref);
  //       setTimePreferences(() => {
  //         return {
  //           ...timePref,
  //         };
  //       });
  //     }
  //   }
  // }, [isLoading, teacher, setValue]);

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
                      <span>Edit Classroom</span>
                    </>
                  ) : (
                    "Edit Classroom"
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

const Classrooms: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Classrooms | TimetablePro</title>
        <meta name="description" content="TimetablePro Classrooms" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex flex-col md:flex-row">
          <CreateClassroom />
          <ClassroomTableView />
        </div>
      </Layout>
    </>
  );
};

export default Classrooms;
