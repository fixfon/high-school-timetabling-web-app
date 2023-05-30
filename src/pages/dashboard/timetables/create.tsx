import type { NextPage } from "next";
import Head from "next/head";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  type ControllerRenderProps,
  useFieldArray,
  useForm,
} from "react-hook-form";
import Layout from "~/components/dashboard/Layout";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "~/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import createTimetableSchema, {
  type CreateTimetableInput,
} from "~/schemas/create-timetable";
import { api } from "~/utils/api";
import { cn } from "~/utils/cn";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Oval } from "react-loader-spinner";
import { ClassLevelMap } from "~/utils/enum-mapper";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { useToast } from "~/components/ui/use-toast";
import { ToastAction } from "~/components/ui/toast";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TimetableRequest } from "~/utils/create-timetable-request";

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

const TableLoading = () => {
  return (
    <>
      <TableRow>
        <TableCell className="justify-center">
          <Skeleton className="h-4 w-full" />
        </TableCell>
        <TableCell className="justify-center">
          <Skeleton className="h-4 w-full" />
        </TableCell>
        <TableCell className="justify-center">
          <Skeleton className="h-4 w-full" />
        </TableCell>
        <TableCell className="justify-center">
          <Skeleton className="h-4 w-full" />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="justify-center">
          <Skeleton className="h-4 w-full" />
        </TableCell>
        <TableCell className="justify-center">
          <Skeleton className="h-4 w-full" />
        </TableCell>
        <TableCell className="justify-center">
          <Skeleton className="h-4 w-full" />
        </TableCell>
        <TableCell className="justify-center">
          <Skeleton className="h-4 w-full" />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="justify-center">
          <Skeleton className="h-4 w-full" />
        </TableCell>
        <TableCell className="justify-center">
          <Skeleton className="h-4 w-full" />
        </TableCell>
        <TableCell className="justify-center">
          <Skeleton className="h-4 w-full" />
        </TableCell>
        <TableCell className="justify-center">
          <Skeleton className="h-4 w-full" />
        </TableCell>
      </TableRow>
    </>
  );
};

type AssignTeachersComboboxProps = {
  isSubmitting: boolean;
  isMutating: boolean;
  field: ControllerRenderProps<
    {
      timetable: {
        classroomId: string;
        teacherIdList: string[];
      }[];
    },
    `timetable.${number}.teacherIdList`
  >;
};

const AssignTeachersCombobox = ({
  isSubmitting,
  isMutating,
  field,
}: AssignTeachersComboboxProps) => {
  const { data: teacherData, isLoading: isTeacherDataLoading } =
    api.teacher.getTeachers.useQuery(undefined, { staleTime: Infinity });

  return (
    <FormItem>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              disabled={isSubmitting || !!isMutating}
              type="button"
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between",
                field.value?.length == 0 && "text-muted-foreground"
              )}
            >
              {field.value?.length > 0 ? (
                <span>Select teachers ({field.value?.length})</span>
              ) : (
                "Select teachers"
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-full p-0">
          <Command className="w-64">
            <CommandInput placeholder="Search teacher..." />
            <CommandEmpty>No teacher found.</CommandEmpty>
            {isTeacherDataLoading ? (
              <CommandLoading />
            ) : (
              <ScrollArea className="h-56">
                <CommandGroup>
                  {teacherData?.teachers.map((teacher) => (
                    <CommandItem
                      key={teacher.id}
                      value={teacher.id}
                      onSelect={(value) => {
                        if (field.value?.includes(value)) {
                          field.onChange(
                            field.value?.filter((v) => v !== value)
                          );
                        } else {
                          if (field.value?.length === 0) {
                            field.onChange([value]);
                          } else {
                            field.onChange([...field.value, value]);
                          }
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          field.value?.includes(teacher.id)
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
    </FormItem>
  );
};

const CreateTimetableForm = ({
  isMutating,
  onSubmit,
}: {
  isMutating: boolean;
  onSubmit: (data: CreateTimetableInput) => Promise<void>;
}) => {
  const form = useForm<CreateTimetableInput>({
    resolver: zodResolver(createTimetableSchema),
    mode: "onChange",
    defaultValues: {
      timetable: [],
    },
  });
  const {
    fields: timetableFields,
    append: appendClassroom,
    remove: removeClassroom,
  } = useFieldArray({
    name: "timetable",
    control: form.control,
  });

  const { data: classroomData, isLoading: isClassroomDataLoading } =
    api.classroom.getClassrooms.useQuery(undefined, {
      staleTime: Infinity,
    });

  const formSubmit = async (data: CreateTimetableInput) => {
    removeClassroom();
    form.reset();
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        className="my-8 flex w-full flex-col items-center justify-center gap-12 px-4 lg:px-8"
        onSubmit={form.handleSubmit(formSubmit)}
      >
        <div className="flex w-full flex-col gap-12 md:flex-row">
          <FormField
            control={form.control}
            name="timetable"
            render={() => (
              <FormItem className="mx-auto w-full rounded-md border lg:w-4/5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Class Grade</TableHead>
                      <TableHead className="text-center">Code</TableHead>
                      <TableHead className="text-center">Branch</TableHead>
                      <TableHead className="text-center">
                        Teacher List
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isClassroomDataLoading ? (
                      <TableLoading />
                    ) : (
                      classroomData?.classrooms
                        .sort((a, b) => {
                          const x = Number(a.classLevel.slice(1, 3));
                          const y = Number(b.classLevel.slice(1, 3));
                          return x - y;
                        })
                        .map((classroom) => (
                          <TableRow key={classroom.id}>
                            <TableCell className="text-center">
                              {ClassLevelMap[classroom.classLevel]}
                            </TableCell>
                            <TableCell className="text-center">
                              {classroom.code}
                            </TableCell>
                            <TableCell className="text-center">
                              {classroom.branch}
                            </TableCell>
                            <TableCell className="max-w-[96px] text-center">
                              {timetableFields.find(
                                (tf) => tf.classroomId === classroom.id
                              ) ? (
                                (() => {
                                  const fieldIndex = timetableFields.findIndex(
                                    (tf) => tf.classroomId === classroom.id
                                  );
                                  return (
                                    <FormField
                                      control={form.control}
                                      name={`timetable.${fieldIndex}.teacherIdList`}
                                      render={({ field }) => (
                                        <AssignTeachersCombobox
                                          field={field}
                                          isMutating={isMutating}
                                          isSubmitting={
                                            form.formState.isSubmitting
                                          }
                                        />
                                      )}
                                    />
                                  );
                                })()
                              ) : (
                                <Button
                                  disabled={
                                    form.formState.isSubmitting || !!isMutating
                                  }
                                  type="button"
                                  size="sm"
                                  className={"m-0 justify-between"}
                                  onClick={() => {
                                    appendClassroom({
                                      classroomId: classroom.id,
                                      teacherIdList: [],
                                    });
                                  }}
                                >
                                  Assign Teacher
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
                <FormMessage className="text-center">
                  {form.formState.errors.timetable && (
                    <span>
                      You must assign teachers to classrooms to create a
                      timetable.
                    </span>
                  )}
                </FormMessage>
              </FormItem>
            )}
          />
        </div>

        <Button
          disabled={form.formState.isSubmitting || !!isMutating}
          type="submit"
          className="w-full justify-center md:w-1/3"
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
              <span>Create Timetable</span>
            </>
          ) : (
            "Create Timetable"
          )}
        </Button>
      </form>
    </Form>
  );
};

const Create: NextPage = (props) => {
  const { toast } = useToast();
  const router = useRouter();
  const [response, setResponse] = useState<TimetableRequest>();

  const trpcContext = api.useContext();
  const { mutateAsync: createTimetable, isLoading } =
    api.timetable.createTimetable.useMutation({
      onSuccess: async ({ response }) => {
        toast({
          title: "Create",
          description: "Timetable created successfully",
          action: (
            <ToastAction
              altText="View timetable"
              onClick={() => router.push("/dashboard/timetables")}
            >
              View
            </ToastAction>
          ),
        });

        setResponse(response);

        await trpcContext.classroom.getClassrooms.invalidate();
        await trpcContext.teacher.getTeachers.invalidate();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Create",
          description: "Error creating timetable",
        });
      },
    });

  const onSubmit = async (data: CreateTimetableInput) => {
    toast({
      title: "Create",
      description: "Creating timetable...",
    });
    await createTimetable(data).catch((err) => console.log(err));
  };

  return (
    <>
      <Head>
        <title>Create Timetable | TimetablePro</title>
        <meta name="description" content="TimetablePro Create Timetable" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="w-full">
          <div className="m-4 space-y-2 lg:m-8">
            <h1 className="text-center text-2xl font-bold text-foreground">
              Create Timetable
            </h1>
            <p className="text-base text-muted-foreground">
              Create timetable for your school by selecting existing classrooms
              and teachers. Lessons will be acquired based on your selections
              while creating teachers and classrooms.
            </p>
            <p className="text-base text-muted-foreground">
              You can view your timetable after creating it by clicking
              <Button
                className="m-0 p-0 pl-2 text-base"
                type="button"
                variant="link"
              >
                <Link href="/timetables">here</Link>
              </Button>
            </p>
            <p className="text-base text-muted-foreground">
              Select from teacher list for every classroom to assign.
            </p>
          </div>
          <CreateTimetableForm onSubmit={onSubmit} isMutating={isLoading} />
          {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
        </div>
      </Layout>
    </>
  );
};

export default Create;
