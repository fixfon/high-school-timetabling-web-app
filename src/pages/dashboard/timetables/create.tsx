import type { NextPage } from "next";
import Head from "next/head";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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

const CreateTimetableForm = ({ isMutating }: { isMutating: boolean }) => {
  const form = useForm<CreateTimetableInput>({
    resolver: zodResolver(createTimetableSchema),
    mode: "onChange",
    defaultValues: {
      classroomIdList: [],
      teacherIdList: [],
    },
  });

  const { data: classroomData, isLoading: isClassroomDataLoading } =
    api.classroom.getClassrooms.useQuery(undefined, {
      staleTime: Infinity,
    });

  const { data: teacherData, isLoading: isTeacherDataLoading } =
    api.teacher.getTeachers.useQuery(undefined, { staleTime: Infinity });

  const formSubmit = (data: CreateTimetableInput) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form
        className="mt-8 flex w-full flex-col items-center justify-center gap-12 px-8"
        onSubmit={form.handleSubmit(formSubmit)}
      >
        <div className="flex w-full flex-col gap-12 md:flex-row">
          <FormField
            control={form.control}
            name="classroomIdList"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/2">
                <FormLabel>Classrooms</FormLabel>
                <FormDescription>
                  Select classrooms that you want to create timetable for.
                </FormDescription>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={form.formState.isSubmitting || !!isMutating}
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          field?.value?.length == 0 && "text-muted-foreground"
                        )}
                      >
                        {field.value?.length > 0 ? (
                          <span>Select classrooms ({field.value?.length})</span>
                        ) : (
                          "Select classrooms"
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-full p-0">
                    <Command className="w-80">
                      <CommandInput placeholder="Search classroom..." />
                      <CommandEmpty>No classroom found.</CommandEmpty>
                      {isClassroomDataLoading ? (
                        <CommandLoading />
                      ) : (
                        <ScrollArea className="h-56">
                          <CommandGroup heading="9. Grade">
                            {classroomData?.classrooms
                              .filter((cl) => cl.classLevel === "L9")
                              .map((classroom) => (
                                <CommandItem
                                  key={classroom.id}
                                  value={classroom.id}
                                  onSelect={(value) => {
                                    if (field.value?.includes(value)) {
                                      field.onChange(
                                        field.value?.filter((v) => v !== value)
                                      );
                                    } else {
                                      field.onChange([...field.value, value]);
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.includes(classroom.id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {ClassLevelMap[classroom.classLevel]}{" "}
                                  {classroom.code} {classroom.branch}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                          <CommandGroup heading="10. Grade">
                            {classroomData?.classrooms
                              .filter((cl) => cl.classLevel === "L10")
                              .map((classroom) => (
                                <CommandItem
                                  key={classroom.id}
                                  value={classroom.id}
                                  onSelect={(value) => {
                                    if (field.value?.includes(value)) {
                                      field.onChange(
                                        field.value?.filter((v) => v !== value)
                                      );
                                    } else {
                                      field.onChange([...field.value, value]);
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.includes(classroom.id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {ClassLevelMap[classroom.classLevel]}{" "}
                                  {classroom.code} {classroom.branch}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                          <CommandGroup heading="11. Grade">
                            {classroomData?.classrooms
                              .filter((cl) => cl.classLevel === "L11")
                              .map((classroom) => (
                                <CommandItem
                                  key={classroom.id}
                                  value={classroom.id}
                                  onSelect={(value) => {
                                    if (field.value?.includes(value)) {
                                      field.onChange(
                                        field.value?.filter((v) => v !== value)
                                      );
                                    } else {
                                      field.onChange([...field.value, value]);
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.includes(classroom.id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {ClassLevelMap[classroom.classLevel]}{" "}
                                  {classroom.code} - {classroom.branch}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                          <CommandGroup heading="12. Grade">
                            {classroomData?.classrooms
                              .filter((cl) => cl.classLevel === "L12")
                              .map((classroom) => (
                                <CommandItem
                                  key={classroom.id}
                                  value={classroom.id}
                                  onSelect={(value) => {
                                    if (field.value?.includes(value)) {
                                      field.onChange(
                                        field.value?.filter((v) => v !== value)
                                      );
                                    } else {
                                      field.onChange([...field.value, value]);
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.includes(classroom.id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {ClassLevelMap[classroom.classLevel]}{" "}
                                  {classroom.code} - {classroom.branch}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </ScrollArea>
                      )}
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teacherIdList"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/2">
                <FormLabel>Teachers</FormLabel>
                <FormDescription>
                  Select teachers that you want to create timetable for.
                </FormDescription>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={form.formState.isSubmitting || !!isMutating}
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          field?.value?.length == 0 && "text-muted-foreground"
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
                    <Command className="w-80">
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
                                    field.onChange([...field.value, value]);
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
                <FormMessage />
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

const Create: NextPage = (props) => {
  const { mutateAsync: createTimetable, isLoading } =
    api.timetable.createTimetable.useMutation({
      onSuccess: () => {
        console.log("success");
      },
      onError: () => {
        console.log("error");
      },
    });

  return (
    <>
      <Head>
        <title>Create Timetable | TimetablePro</title>
        <meta name="description" content="TimetablePro Create Timetable" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="w-full">
          <div className="m-8 space-y-6">
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
          </div>
          <CreateTimetableForm isMutating={isLoading} />
        </div>
      </Layout>
    </>
  );
};

export default Create;
