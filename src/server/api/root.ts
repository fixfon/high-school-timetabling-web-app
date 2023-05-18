import { createTRPCRouter } from "~/server/api/trpc";
import { registerRouter } from "./routers/register";
import { teacherRouter } from "./routers/teacher";
import { classroomRouter } from "./routers/classroom";

export const appRouter = createTRPCRouter({
  teacher: teacherRouter,
  classroom: classroomRouter,
  register: registerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
