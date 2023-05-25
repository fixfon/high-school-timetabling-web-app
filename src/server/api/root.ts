import { createTRPCRouter } from "~/server/api/trpc";
import { registerRouter } from "./routers/register";
import { teacherRouter } from "./routers/teacher";
import { classroomRouter } from "./routers/classroom";
import { lessonRouter } from "./routers/lesson";
import { departmentRouter } from "./routers/department";

export const appRouter = createTRPCRouter({
  teacher: teacherRouter,
  classroom: classroomRouter,
  lesson: lessonRouter,
  department: departmentRouter,
  register: registerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
