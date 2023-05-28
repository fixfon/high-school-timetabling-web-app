import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import createTimetableSchema from "~/schemas/create-timetable";

export const timetableRouter = createTRPCRouter({
  createTimetable: protectedProcedure
    .input(createTimetableSchema)
    .mutation(({ input, ctx }) => {
      const orgId = ctx.session.user.orgId;

      if (!orgId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      return {
        success: true,
      };
    }),
});
