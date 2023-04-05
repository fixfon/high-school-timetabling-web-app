import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";

const Subjects: NextPage = (props) => {
  const { mutateAsync: createSubject, isLoading: subjectCreating } =
    api.dashboard.createSubject.useMutation();
  const { data: subjectList, isLoading: subjectListLoading } =
    api.dashboard.getSubjects.useQuery();

  const { data: termList, isLoading: termListLoading } =
    api.dashboard.getTerms.useQuery();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // store all the data in the form
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // create a new object to store the data
    const newSubject = {
      name: data.get("subjectName") as string,
      code: data.get("code") as string,
      description: data.get("description") as string,
      termId: data.get("termId") as string,
      organizationId: "1",
    };

    createSubject(newSubject);
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
              This is for subject creation (only org admins can access this).
            </h3>
            <div className="flex items-center justify-center gap-8">
              <div>
                <h3>Subject List for organization</h3>
                {!subjectListLoading && subjectList?.subjects && (
                  <ul>
                    {subjectList.subjects.map((subject) => (
                      <>
                        <li>Name: {subject.name}</li>
                        <li>Code: {subject.code}</li>
                        <li>Description: {subject.description}</li>
                        <li>Term Id: {subject.termId}</li>
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
                    name="subjectName"
                    id="subjectName"
                    placeholder="Subject Name"
                  />
                  <input type="text" name="code" id="code" placeholder="Code" />
                  <input
                    type="text"
                    name="description"
                    id="description"
                    placeholder="Description"
                  />
                  <select name="termId" id="termId">
                    {!termListLoading &&
                      termList?.terms &&
                      termList.terms.map((term) => (
                        <option value={term.id}>{term.name}</option>
                      ))}
                  </select>
                  <button type="submit" className="text-white">
                    Create Subject
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

export default Subjects;
