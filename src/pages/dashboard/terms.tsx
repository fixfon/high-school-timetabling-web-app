import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";

const Terms: NextPage = (props) => {
  const { mutateAsync: createTerm, isLoading: termCreating } =
    api.dashboard.createTerm.useMutation();
  const { data: termList, isLoading: termListLoading } =
    api.dashboard.getTerms.useQuery();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // store all the data in the form
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // create a new object to store the data
    const newTerm = {
      termName: data.get("termName") as string,
      termDescription: data.get("description") as string,
      startDate: data.get("startDate") as string,
      endDate: data.get("endDate") as string,
    };

    createTerm(newTerm);
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
              This is for term creation (only org admins can access this).
            </h3>
            <div className="flex items-center justify-center gap-8">
              <div>
                <h3>Term List for organization</h3>
                {!termListLoading && termList?.terms && (
                  <ul>
                    {termList.terms.map((term) => (
                      <li key={term.id}>{term.name}</li>
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
                    Term Name
                  </label>
                  <input
                    type="text"
                    name="termName"
                    id="termName"
                    placeholder="Term Name"
                  />
                  <input
                    type="text"
                    name="description"
                    id="description"
                    placeholder="Description"
                  />
                  <input
                    type="text"
                    name="startDate"
                    id="startDate"
                    placeholder="Start Date"
                  />
                  <input
                    type="text"
                    name="endDate"
                    id="endDate"
                    placeholder="End Date"
                  />
                  <button type="submit" className="text-white">
                    Create Term
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

export default Terms;
