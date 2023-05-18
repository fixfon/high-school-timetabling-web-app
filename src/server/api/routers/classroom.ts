import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ClassLevel } from "@prisma/client";
import classroomSchema from "~/schemas/classroom";

export const classroomRouter = createTRPCRouter({
  getClassrooms: protectedProcedure.query(({ ctx }) => {
    // const classrooms = await ctx.prisma.classRoom.findMany({
    //   where: {
    //     organizationId: "1",
    //   },
    // });

    return {
      success: true,
    };
  }),

  getClassroom: protectedProcedure
    .input(
      z.object({
        classroomId: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      // const classrooms = await ctx.prisma.classRoom.findMany({
      //   where: {
      //     organizationId: "1",
      //   },
      // });

      return {
        success: true,
      };
    }),

  createClassroom: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        classLevel: z.enum([
          ClassLevel.L9,
          ClassLevel.L10,
          ClassLevel.L11,
          ClassLevel.L12,
        ]),
        organizationId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { name, classLevel, organizationId } = input;

      // await ctx.prisma.classRoom.create({
      //   data: {
      //     name,
      //     classLevel,
      //     organizationId,
      //   },
      // });

      return {
        success: true,
      };
    }),

  updateClassroom: protectedProcedure
    .input(classroomSchema)
    .mutation(({ input, ctx }) => {
      // const { name, classLevel } = input;

      // await ctx.prisma.classRoom.create({
      //   data: {
      //     name,
      //     classLevel,
      //     organizationId,
      //   },
      // });

      return {
        success: true,
      };
    }),

  deleteClassroom: protectedProcedure
    .input(
      z.object({
        classroomId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return {
        success: true,
      };
    }),

  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
