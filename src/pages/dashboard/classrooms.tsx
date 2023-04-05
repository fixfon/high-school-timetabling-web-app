import { ClassLevel } from "@prisma/client";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";

const Classrooms: NextPage = () => {
  const { mutateAsync: createClassroom, isLoading: classroomCreating } =
    api.dashboard.createClassroom.useMutation();
  const { data: classroomList, isLoading: classroomListLoading } =
    api.dashboard.getClassrooms.useQuery();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // store all the data in the form
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // create a new object to store the data
    const newClassroom = {
      name: data.get("name") as string,
      classLevel: data.get("classlevels") as ClassLevel,
      organizationId: "1",
    };

    createClassroom(newClassroom);
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
              This is for classroom creation (only org admins can access this).
            </h3>
            <div className="flex items-center justify-center gap-8">
              <div>
                <h3>Classroom List for organization</h3>
                {!classroomListLoading && classroomList?.classrooms && (
                  <ul>
                    {classroomList.classrooms.map((classroom) => (
                      <>
                        <li>Name: {classroom.name}</li>
                        <li>Class Level: {classroom.classLevel}</li>
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
                  <label htmlFor="termName" className="text-white">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Classroom Name"
                  />
                  <select name="classlevels" id="classlevels">
                    <option value="L9">9</option>
                    <option value="L10">10</option>
                    <option value="L11">11</option>
                    <option value="L12">12</option>
                  </select>
                  <button type="submit" className="text-white">
                    Create Classroom
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

export default Classrooms;
