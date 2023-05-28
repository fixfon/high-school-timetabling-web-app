import { zodResolver } from "@hookform/resolvers/zod";
import { LessonType, type Department, type Lesson } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { Oval } from "react-loader-spinner";
import Layout from "~/components/dashboard/Layout";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import { DataTable } from "~/components/ui/data-table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/components/ui/use-toast";
import lessonSchema, { type LessonInput } from "~/schemas/lesson";
import { api } from "~/utils/api";
import { cn } from "~/utils/cn";
import { LessonTypeMap } from "~/utils/enum-mapper";

type LessonFormProps = {
  onSubmit: (data: LessonInput) => Promise<void>;
  isMutating?: boolean;
};

const LessonForm = ({ onSubmit, isMutating }: LessonFormProps) => {
  const form = useForm<LessonInput>({
    resolver: zodResolver(lessonSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      type: undefined,
      description: "",
      departmentId: undefined,
    },
  });

  const { data: departmentData, isLoading: isDepartmentLoading } =
    api.department.getDepartments.useQuery(undefined, {
      staleTime: Infinity,
    });

  const formSubmit = async (data: LessonInput) => {
    await onSubmit(data);
    form.reset();
  };
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
              <FormDescription>Enter the name of the lesson</FormDescription>
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormDescription>
                Enter the code of the lesson (optional)
              </FormDescription>
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormDescription>Select the type of the lesson</FormDescription>
              <Popover>
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
                        ? LessonTypeMap[field.value]
                        : "Select a type"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command className="w-80">
                    <CommandInput placeholder="Search type..." />
                    <CommandEmpty>No type found.</CommandEmpty>
                    <CommandGroup>
                      {isDepartmentLoading ? (
                        <Oval
                          height={20}
                          width={20}
                          strokeWidth={4}
                          strokeWidthSecondary={3}
                          color="#5090FF"
                          secondaryColor="#FFFFFF"
                        />
                      ) : (
                        <>
                          <CommandItem
                            onSelect={() => {
                              field.onChange(
                                field.value === LessonType.COMPULSORY
                                  ? null
                                  : LessonType.COMPULSORY
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === LessonType.COMPULSORY
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {LessonTypeMap["COMPULSORY"]}
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              field.onChange(
                                field.value ===
                                  LessonType.DEPARTMENTAL_COMPULSORY
                                  ? null
                                  : LessonType.DEPARTMENTAL_COMPULSORY
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value ===
                                  LessonType.DEPARTMENTAL_COMPULSORY
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {LessonTypeMap["DEPARTMENTAL_COMPULSORY"]}
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              field.onChange(
                                field.value === LessonType.ELECTIVE
                                  ? null
                                  : LessonType.ELECTIVE
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === LessonType.ELECTIVE
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {LessonTypeMap["ELECTIVE"]}
                          </CommandItem>
                        </>
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormDescription>
                Select the department of the lesson
              </FormDescription>
              <Popover>
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
                        ? departmentData?.departments.find(
                            (department) => department.id === field.value
                          )?.name
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
                      {isDepartmentLoading ? (
                        <Oval
                          height={20}
                          width={20}
                          strokeWidth={4}
                          strokeWidthSecondary={3}
                          color="#5090FF"
                          secondaryColor="#FFFFFF"
                        />
                      ) : (
                        departmentData?.departments.map((department) => (
                          <CommandItem
                            key={department.id}
                            onSelect={() => {
                              field.onChange(
                                field.value === department.id
                                  ? null
                                  : department.id
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === department.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {department.name}
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormDescription>
                Enter the description of the lesson (optional)
              </FormDescription>
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

const CreateLesson = () => {
  const { toast } = useToast();

  const trpcContext = api.useContext();
  const { mutateAsync, isLoading } = api.lesson.createLesson.useMutation({
    onSuccess: () => {
      toast({
        title: "Create",
        description: "Lesson created successfully",
      });
      // invalidate lesson table
      void trpcContext.lesson.getLessons.invalidate();
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error creating lesson",
        description: err.message,
      });
    },
  });

  const onSubmit = async (data: LessonInput) => {
    toast({
      title: "Create",
      description: "Creating lesson...",
    });
    try {
      await mutateAsync(data);
    } catch (err) {}
  };

  return (
    <div className="flex w-3/4 flex-col items-center justify-start pt-12 lg:w-2/5">
      <h1 className="text-2xl font-bold">Create Lesson</h1>
      <LessonForm onSubmit={onSubmit} isMutating={isLoading} />
    </div>
  );
};

const lessonTableColumns: ColumnDef<
  Lesson & {
    department: Department;
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
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => {
      const { code } = row.original;
      return <span className="capitalize">{code}</span>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const { type } = row.original;
      return <span>{LessonTypeMap[type]}</span>;
    },
  },
  {
    accessorKey: "departmentId",
    header: "Department",
    cell: ({ row }) => {
      const { department } = row.original;
      return <span>{department.name}</span>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "delete",
    header: "",
    cell: ({ row }) => {
      const { id } = row.original;
      return <DeleteLessonButton id={id} />;
    },
  },
];

const DeleteLessonButton = ({ id }: { id: string }) => {
  const { toast } = useToast();
  const trpcContext = api.useContext();

  const { mutateAsync, isLoading } = api.lesson.deleteLesson.useMutation({
    onSuccess: async () => {
      toast({
        title: "Delete",
        description: "Lesson deleted successfully",
      });

      // validate data
      await trpcContext.lesson.getLessons.invalidate();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Delete",
        description: "Error deleting lesson",
      });
    },
  });

  const handleDelete = async () => {
    toast({
      title: "Delete",
      description: "Deleting lesson...",
    });
    await mutateAsync({ lessonId: id });
  };

  return (
    <Button disabled={isLoading} variant="destructive" onClick={handleDelete}>
      <Trash2 className="h-5 w-5" />
    </Button>
  );
};

const LessonTableView = () => {
  const { data: lessonData, isLoading } = api.lesson.getLessons.useQuery();

  return (
    <div className="w-full pt-12 lg:w-3/5">
      <DataTable
        columns={lessonTableColumns}
        data={lessonData?.lessons ?? []}
        isLoading={isLoading}
      />
    </div>
  );
};

const Lessons: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Manage Lessons | TimetablePro</title>
        <meta name="description" content="TimetablePro Manage Lessons" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex w-full flex-col md:flex-row">
          <CreateLesson />
          <LessonTableView />
        </div>
      </Layout>
    </>
  );
};

export default Lessons;
