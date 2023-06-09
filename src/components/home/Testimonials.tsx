import Image from "next/image";

export default function Testimonials() {
  return (
    <div className="mx-auto flex w-full flex-col">
      <div className="flex flex-col items-center justify-center bg-foreground py-10 text-center">
        <h2 className="pb-4 text-5xl font-extrabold text-secondary">
          A Lot of Happy
        </h2>
        <h3 className="inline-block bg-gradient-to-r from-primary via-secondary to-complementary bg-clip-text text-2xl text-transparent">
          Teachers, Students
        </h3>
        <h3 className="inline-block bg-gradient-to-r from-primary via-secondary to-complementary bg-clip-text text-2xl text-transparent">
          Managers
        </h3>
      </div>
      <div className="container mx-auto flex w-full flex-col justify-center px-12 py-12 text-secondary lg:px-0">
        <div className="mb-8 h-min rounded-3xl bg-foreground px-6 py-4 shadow-2xl drop-shadow-2xl lg:ml-32 lg:w-[550px]">
          <p className="italic opacity-90">
            &quot;Our school has been using this application for several
            semesters now, and it has greatly simplified our timetable
            scheduling process. The interface is easy to use, and the
            optimization algorithm saves us hours of work each week. I highly
            recommend it to any school looking to streamline their
            scheduling.&quot;
          </p>
          <div className="flex items-center justify-start gap-6 pt-8">
            <Image
              className="rounded-full"
              src="/manager.jpg"
              alt="Placeholder 3"
              width={75}
              height={75}
            />
            <div>
              <h3 className="text-2xl">A***** T*****</h3>
              <h4 className="text-end text-base italic opacity-90">
                School Manager
              </h4>
            </div>
          </div>
        </div>

        <div className="mb-8 h-min self-end rounded-3xl bg-foreground px-6 py-4 shadow-2xl drop-shadow-2xl lg:mr-32 lg:w-[550px]">
          <p className="italic opacity-90">
            &quot;As a teacher, I appreciate how this application allows me to
            specify my work preferences and availability. It is great to have
            control over my schedule and know when I will be teaching each
            class. The ability to view the timetable online is also a huge bonus
            - I can quickly check which classroom I will be in and what lesson I
            will be teaching.&quot;
          </p>
          <div className="flex items-center justify-start gap-6 pt-8">
            <Image
              className="rounded-full"
              src="/teacher.jpg"
              alt="Placeholder 3"
              width={75}
              height={75}
            />
            <div>
              <h3 className="text-2xl">C**** S******</h3>
              <h4 className="text-end text-base italic opacity-90">Teacher</h4>
            </div>
          </div>
        </div>

        <div className="h-min rounded-3xl bg-foreground px-6 py-4 shadow-2xl drop-shadow-2xl lg:ml-32 lg:w-[550px]">
          <p className="italic opacity-90">
            &quot;Since our school started using this application, my schedule
            has been much more organized and easier to follow. I always know
            which class I will be in and which teacher will be leading the
            lesson. Overall, this application has been a game-changer for
            me.&quot;
          </p>
          <div className="flex items-center justify-start gap-6 pt-8">
            <Image
              className="rounded-full"
              src="/student.jpg"
              alt="Placeholder 3"
              width={75}
              height={75}
            />
            <div>
              <h3 className="text-2xl">V**** Y******</h3>
              <h4 className="text-end text-base italic opacity-90">Student</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
