import Image from "next/image";

export default function Features() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center py-16">
      <div className="flex flex-col items-center justify-center">
        <h1 className="pb-8 text-4xl font-black text-primary">
          Create Most Optimized Timetable
        </h1>
        <p className="pb-16 text-xl">
          With our powerful optimization technology, you can create a semester
          timetable that maximizes efficiency and ensures that every student
          gets the education they deserve. Prepare your calendar that satisfies
          your lesson priorities, teachers and students.
        </p>
        <Image
          src="/placeholder1.png"
          alt="Placeholder 1"
          width={1440}
          height={646}
        />
      </div>
      <div className="flex flex-col items-center justify-center pt-20" id="features">
        <div className="flex px-8 pb-10">
          <div className="flex w-1/2 flex-shrink flex-col items-center justify-evenly py-16">
            <h2 className="bg-gradient-to-r from-background-dark via-primary to-complementary bg-clip-text text-4xl font-extrabold text-transparent">
              Manage Teachers
            </h2>
            <p>
              Add your teachers to your timetables with the easiness of our
              dashboard. Include their personal information and specify their
              weekly work preferences. Option to provide them user accounts to
              view their weekly schedules.
            </p>
          </div>
          <div className="flex w-1/2 items-center justify-center">
            <Image
              src="/placeholder2.png"
              alt="Placeholder 2"
              width={600}
              height={289}
            />
          </div>
        </div>

        <div className="flex flex-row-reverse px-8 pb-10">
          <div className="flex w-1/2 flex-shrink flex-col items-center justify-evenly py-16">
            <h2 className="bg-gradient-to-r from-background-dark via-primary to-complementary bg-clip-text text-4xl font-extrabold text-transparent">
              Manage Classrooms
            </h2>
            <p>
              Create individual classrooms for every class level. Specify lesson
              list for the semester for every classroom with our up to date
              official syllabus.
            </p>
          </div>
          <div className="flex w-1/2 items-center justify-center">
            <Image
              src="/placeholder2.png"
              alt="Placeholder 2"
              width={600}
              height={289}
            />
          </div>
        </div>

        <div className="flex px-8 pb-10">
          <div className="flex w-1/2 flex-shrink flex-col items-center justify-evenly py-16">
            <h2 className="bg-gradient-to-r from-background-dark via-primary to-complementary bg-clip-text text-4xl font-extrabold text-transparent">
              Optimized Timetable Creation
            </h2>
            <p>
              With the provided variables our algorithm always provides you an
              optimized timetable schedule for your organization.
            </p>
          </div>
          <div className="flex w-1/2 items-center justify-center">
            <Image
              src="/placeholder2.png"
              alt="Placeholder 2"
              width={600}
              height={289}
            />
          </div>
        </div>

        <div className="flex flex-row-reverse px-8 pb-10">
          <div className="flex w-1/2 flex-shrink flex-col items-center justify-evenly py-16">
            <h2 className="bg-gradient-to-r from-background-dark via-primary to-complementary bg-clip-text text-4xl font-extrabold text-transparent">
              Priority Weights
            </h2>
            <p>
              Set priority for every lesson to get involved in timetable
              creation process. The algorithm will consider your personalized
              weights while creating most-optimized timetable.
            </p>
          </div>
          <div className="flex w-1/2 items-center justify-center">
            <Image
              src="/placeholder2.png"
              alt="Placeholder 2"
              width={600}
              height={289}
            />
          </div>
        </div>

        <div className="flex px-8 pb-10">
          <div className="flex w-1/2 flex-shrink flex-col items-center justify-evenly py-16">
            <h2 className="bg-gradient-to-r from-background-dark via-primary to-complementary bg-clip-text text-4xl font-extrabold text-transparent">
              Modern Interface
            </h2>
            <p>
              We know the needs of the people who spends weeks of timetabling
              process on each semester. Providing a modern and easy to use
              dashboard for both desktop and mobile access reflects the power of
              our algorithm.
            </p>
          </div>
          <div className="flex w-1/2 items-center justify-center">
            <Image
              src="/placeholder2.png"
              alt="Placeholder 2"
              width={600}
              height={289}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
