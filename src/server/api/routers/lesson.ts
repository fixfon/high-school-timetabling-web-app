import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const lessonRouter = createTRPCRouter({
  getLessons: protectedProcedure.query(async ({ ctx }) => {
    const lessonRes = await ctx.prisma.lesson.findMany();

    if (!lessonRes) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not find lessons",
      });
    }

    return {
      lessons: lessonRes,
    };
  }),
});
