import { ClassLevel } from "@prisma/client";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";

const Teachers: NextPage = () => {
  const { mutateAsync: createTeacher, isLoading: teacherCreating } =
    api.dashboard.createTeacher.useMutation();
  const { data: teacherList, isLoading: teacherListLoading } =
    api.dashboard.getTeachers.useQuery();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // store all the data in the form
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // create a new object to store the data
    const newTeacher = {
      fullName: data.get("fullName") as string,
      description: data.get("description") as string,
      department: data.get("department") as string,
      organizationId: "1",
    };

    createTeacher(newTeacher);
  };
  return (
    <>
      <Head>
        <title>High School Timetabler</title>
        <meta name="description" content="High School Timetabler" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white">
            Dummy App for High School Timetabling
          </h1>
          <div className="flex flex-col items-center justify-center gap-4 font-bold text-white md:gap-8">
            <h3 className="text-xl ">
              This is for creating teachers (only org admins can access this).
            </h3>
            <div className="flex items-center justify-center gap-8">
              <div>
                <h3>Teacher List for organization</h3>
                {!teacherListLoading && teacherList?.teachers && (
                  <ul>
                    {teacherList.teachers.map((teacher) => (
                      <>
                        <li>Name: {teacher.fullName}</li>
                        <li>Department: {teacher.department}</li>
                        <li>Description: {teacher.description}</li>
                      </>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <form
                  className="flex flex-col items-center justify-center gap-4 text-black"
                  onSubmit={handleSubmit}
                >
                  <label className="text-white">Teacher</label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    name="description"
                    id="description"
                    placeholder="Description"
                  />
                  <input
                    type="text"
                    name="department"
                    id="deparment"
                    placeholder="Department"
                  />

                  <button type="submit" className="text-white">
                    Create Teacher
                  </button>
                </form>
              </div>
            </div>
            <div className="font-bold text-white">
              <h3 className="text-xl">Other Pages:</h3>
              <ul className="uppercase">
                <li>
                  <Link href="/dashboard/classrooms">
                    <p>Classrooms</p>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/teachers">
                    <p>Teachers</p>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/subjects">
                    <p>Subjects</p>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/terms">
                    <p>Terms</p>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/timetables">
                    <p>Timetables</p>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Teachers;
