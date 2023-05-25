import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const departmentRouter = createTRPCRouter({
  getDepartments: protectedProcedure.query(async ({ ctx }) => {
    const departmentRes = await ctx.prisma.department.findMany();

    if (!departmentRes) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not find lessons",
      });
    }

    return {
      departments: departmentRes,
    };
  }),
});
