import { zodResolver } from "@hookform/resolvers/zod";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
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
  TableFooter,
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
    // cell: ({ row }) => {
    //   const classroomId = row.getValue("id");
    //   return <EditClassroom classroomId={(classroomId as string) ?? ""} />;
    // },
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
    <div className="w-full pt-12 lg:w-3/5">
      <DataTable columns={classroomColumns} data={[]} />
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
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [isLessonDialogOpen, setLessonDialogOpen] = useState(false);
  const isInitialRender = useRef(true);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    reset,
    clearErrors,
    trigger,
    formState: { isSubmitting, errors, isSubmitSuccessful },
  } = useForm<ClassroomInput>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      advisorTeacherId: null,
      branch: undefined,
      classLevel: undefined,
      code: undefined,
    },
  });
  const classLevelValue = useWatch({ control, name: "classLevel" });
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
      weeklyHour: 0,
    });

    if (errors.lessons) clearErrors("lessons");
  };

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
  const { data: teachers, isLoading: isTeachersLoading } =
    api.teacher.getTeachers.useQuery();
  const { data: lessons, isLoading: isLessonsLoading } =
    api.lesson.getLessons.useQuery();

  const onSubmit = (data: ClassroomInput) => {
    try {
      console.log(data);
      // await mutateAsync(data);
    } catch (err) {}
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      console.log("reset");
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  useEffect(() => {
    if (!fields.length && !isInitialRender.current) {
      void trigger("lessons");
    }

    if (isInitialRender.current) {
      isInitialRender.current = false;
    }
  }, [fields, setValue, trigger]);

  useEffect(() => {
    console.log(lessonValue);
  }, [lessonValue]);

  useEffect(() => {
    console.log(errors.lessons);
  }, [errors.lessons]);

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
                  <Select
                    onValueChange={onChange}
                    value={value ?? ""}
                    required={
                      classLevelValue === "L11" || classLevelValue === "L12"
                    }
                  >
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
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Semester Lessons
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[680px]">
            <DialogHeader>
              <DialogTitle>Set Semester Lessons</DialogTitle>
              <DialogDescription>
                Set the semester lessons for this classroom.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Lesson Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Weekly Hour</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell></TableCell>
                  </TableRow>
                  {fields.map((lesson, lessonIndex) => (
                    <TableRow key={lesson.id}>
                      <TableCell>
                        <Button
                          variant="link"
                          onClick={() => remove(lessonIndex)}
                        >
                          <Trash />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={control}
                          name={`lessons.${lessonIndex}.lessonId`}
                          render={({ field }) => <Input {...field} />}
                        ></Controller>
                      </TableCell>
                      <TableCell>
                        <span>Type</span>
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
                          type="number"
                          {...register(`lessons.${lessonIndex}.weeklyHour`, {
                            valueAsNumber: true,
                          })}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell>
                      <Button onClick={appendLesson}>Add Lesson</Button>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
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

// type EditClassroomProps = {
//   classroomId: string;
// };
// const EditClassroom = ({ classroomId }: EditClassroomProps) => {
//   const [windowSize, setWindowSize] = useState([1440, 1070]);
//   const [openSheet, setOpenSheet] = useState(false);
//   const {
//     data: classroom,
//     isLoading,
//     refetch,
//   } = api.classroom.getClassroom.useQuery({
//     classroomId,
//   });

//   const { toast } = useToast();
//   const [isPrefDialogOpen, setIsPrefDialogOpen] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     getValues,
//     setValue,
//     reset,
//     formState: { isSubmitting, isSubmitSuccessful },
//   } = useForm<ClassroomInput>({
//     resolver: zodResolver(classroomSchema),
//   });

//   const trpcContext = api.useContext();
//   const { mutateAsync, isLoading: isEditing } =
//     api.classroom.updateClassroom.useMutation({
//       onSuccess: () => {
//         toast({
//           title: "Classroom edited successfully",
//         });

//         // invalidate teacher table
//         void trpcContext.classroom.getClassrooms.invalidate();
//         void refetch();

//         // close the sheet
//         void wait(1000).then(() => setOpenSheet(false));
//       },
//       onError: (err) => {
//         toast({
//           variant: "destructive",
//           title: "Error editing classroom",
//           description: err.message,
//         });
//       },
//     });

//   const onSubmit = async (data: ClassroomInput) => {
//     try {
//       await mutateAsync(data);
//     } catch (err) {}
//   };

//   useEffect(() => {
//     if (isSubmitSuccessful) {
//       reset();
//     }
//   }, [isSubmitSuccessful, reset]);

//   // useEffect(() => {
//   //   if (!isLoading) {
//   //     const timePref = teacher?.foundTeacher?.TeacherWorkPreferance.map(
//   //       (pref: TeacherWorkPreferance) => {
//   //         return {
//   //           day: pref.workingDay,
//   //           classHour: pref.workingHour,
//   //         };
//   //       }
//   //     );

//   //     if (timePref) {
//   //       setValue("timePreferences", timePref);
//   //       setTimePreferences(() => {
//   //         return {
//   //           ...timePref,
//   //         };
//   //       });
//   //     }
//   //   }
//   // }, [isLoading, teacher, setValue]);

//   useEffect(() => {
//     const handleWindowResize = () => {
//       setWindowSize([window.innerWidth, window.innerHeight]);
//     };

//     window.addEventListener("resize", handleWindowResize);

//     return () => {
//       window.removeEventListener("resize", handleWindowResize);
//     };
//   }, []);

//   useEffect(() => {
//     setWindowSize([window.innerWidth, window.innerHeight]);
//   }, []);

//   return (
//     <Sheet open={openSheet} onOpenChange={setOpenSheet}>
//       <SheetTrigger asChild>
//         <Button variant="default">Edit</Button>
//       </SheetTrigger>

//       <SheetContent size={windowSize.at(0)! <= 1024 ? "full" : "default"}>
//         {isLoading ? (
//           <SheetHeader className="items-center justify-center">
//             <Oval
//               height={60}
//               width={60}
//               strokeWidth={4}
//               color="#0F1729"
//               secondaryColor="#0F1729"
//             />
//           </SheetHeader>
//         ) : (
//           <>
//             <SheetHeader>
//               <SheetTitle>
//                 Edit Teacher {teacher?.foundTeacher?.name}
//               </SheetTitle>
//             </SheetHeader>
//             <div className="flex flex-col items-center justify-start pt-6">
//               <form
//                 className="mt-8 flex w-full flex-col space-y-3 px-8"
//                 noValidate
//                 onSubmit={handleSubmit(onSubmit)}
//               >
//                 <div>
//                   <Label htmlFor="name">Name</Label>
//                   <Input
//                     defaultValue={teacher?.foundTeacher?.name}
//                     disabled={isLoading || isSubmitting || isEditing}
//                     type="text"
//                     id="name"
//                     {...register("name")}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="surname">Surname</Label>
//                   <Input
//                     defaultValue={teacher?.foundTeacher?.surname}
//                     disabled={isLoading || isSubmitting || isEditing}
//                     type="text"
//                     id="surname"
//                     {...register("surname")}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="department">Department</Label>
//                   <Input
//                     defaultValue={teacher?.foundTeacher?.department ?? ""}
//                     disabled={isLoading || isSubmitting || isEditing}
//                     type="text"
//                     id="department"
//                     {...register("department")}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="description">Description</Label>
//                   <Textarea
//                     defaultValue={teacher?.foundTeacher?.description ?? ""}
//                     disabled={isLoading || isSubmitting || isEditing}
//                     id="description"
//                     {...register("description")}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     defaultValue={teacher?.foundTeacher?.User?.email ?? ""}
//                     disabled={isLoading || isSubmitting || isEditing}
//                     type="email"
//                     id="email"
//                     {...register("email", { required: false })}
//                   />
//                 </div>
//                 <div className="pb-8">
//                   <Label htmlFor="password">Password</Label>
//                   <Input
//                     disabled={isLoading || isSubmitting || isEditing}
//                     type="password"
//                     id="password"
//                     {...register("password", { required: false })}
//                   />
//                 </div>

//                 <Dialog
//                   open={isPrefDialogOpen}
//                   onOpenChange={setIsPrefDialogOpen}
//                 >
//                   <DialogTrigger asChild>
//                     <Button
//                       disabled={isLoading || isSubmitting || isEditing}
//                       variant="outline"
//                       className="flex items-center justify-center gap-2"
//                     >
//                       <ExternalLink className="h-4 w-4" />
//                       Time Preferences
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="sm:max-w-[680px]">
//                     <DialogHeader>
//                       <DialogTitle>Edit Time Preferences</DialogTitle>
//                       <DialogDescription>
//                         Set the days and class hours the teacher is available.
//                       </DialogDescription>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead>Hour / Day</TableHead>
//                             <TableHead>Hour 1</TableHead>
//                             <TableHead>Hour 2</TableHead>
//                             <TableHead>Hour 3</TableHead>
//                             <TableHead>Hour 4</TableHead>
//                             <TableHead>Hour 5</TableHead>
//                             <TableHead>Hour 6</TableHead>
//                             <TableHead>Hour 7</TableHead>
//                             <TableHead>Hour 8</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {[
//                             "Monday",
//                             "Tuesday",
//                             "Wednesday",
//                             "Thursday",
//                             "Friday",
//                           ].map((day, dayIndex) => (
//                             <TableRow key={dayIndex}>
//                               <TableCell>{day}</TableCell>
//                               {Array.from(
//                                 [
//                                   ClassHour.C1,
//                                   ClassHour.C2,
//                                   ClassHour.C3,
//                                   ClassHour.C4,
//                                   ClassHour.C5,
//                                   ClassHour.C6,
//                                   ClassHour.C7,
//                                   ClassHour.C8,
//                                 ],
//                                 (elem, i) => (
//                                   <TableCell key={i}>
//                                     <Input
//                                       disabled={
//                                         isLoading || isSubmitting || isEditing
//                                       }
//                                       type="checkbox"
//                                       checked={timePreferences[
//                                         dayIndex
//                                       ]?.classHour.includes(elem)}
//                                       value={elem}
//                                       className="h-4 w-4 ring-offset-background checked:accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
//                                       id={`${dayIndex}-${elem}`}
//                                       onChange={(e) => {
//                                         const prev = getValues(
//                                           `timePreferences.${dayIndex}.classHour`
//                                         );

//                                         if (e.target.checked) {
//                                           setValue(
//                                             `timePreferences.${dayIndex}.classHour`,
//                                             [...prev, elem]
//                                           );

//                                           const latest =
//                                             getValues(`timePreferences`);

//                                           if (latest)
//                                             setTimePreferences(() => {
//                                               return {
//                                                 ...latest,
//                                               };
//                                             });
//                                         } else {
//                                           setValue(
//                                             `timePreferences.${dayIndex}.classHour`,
//                                             [...prev.filter((p) => p !== elem)]
//                                           );

//                                           const latest =
//                                             getValues(`timePreferences`);

//                                           if (latest)
//                                             setTimePreferences(() => {
//                                               return {
//                                                 ...latest,
//                                               };
//                                             });
//                                         }

//                                         return;
//                                       }}
//                                     />
//                                   </TableCell>
//                                 )
//                               )}
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </div>
//                     <DialogFooter>
//                       <Button
//                         variant="default"
//                         type="submit"
//                         onClick={() => setIsPrefDialogOpen(false)}
//                       >
//                         Save
//                       </Button>
//                     </DialogFooter>
//                   </DialogContent>
//                 </Dialog>

//                 <Button
//                   disabled={isLoading || isSubmitting || isEditing}
//                   type="submit"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <Oval
//                         height={20}
//                         width={20}
//                         strokeWidth={4}
//                         strokeWidthSecondary={3}
//                         color="#5090FF"
//                         secondaryColor="#FFFFFF"
//                       />
//                       <span>Edit Classroom</span>
//                     </>
//                   ) : (
//                     "Edit Classroom"
//                   )}
//                 </Button>
//               </form>
//             </div>
//           </>
//         )}
//       </SheetContent>
//     </Sheet>
//   );
// };

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
