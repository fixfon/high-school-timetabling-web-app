import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { ClassLevel } from "@prisma/client";

export const dashboardRouter = createTRPCRouter({
  getTerms: publicProcedure.query(async ({ ctx }) => {
    const terms = await ctx.prisma.teacher.findMany({
      where: {
        Class: {
          some: {
            Lesson: {
              name: "Math",
            },
          },
        },
      },
    });

    return {
      terms,
    };
  }),
  createTerm: publicProcedure
    .input(
      z.object({
        termName: z.string(),
        termDescription: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { termName, termDescription, startDate, endDate } = input;

      await ctx.prisma.term.create({
        data: {
          organizationId: "1",
          name: termName,
          description: termDescription,
          start: new Date(startDate),
          end: new Date(endDate),
        },
      });

      return {
        success: true,
      };
    }),

  getSubjects: publicProcedure.query(async ({ ctx }) => {
    const subjects = await ctx.prisma.subject.findMany({
      where: {
        organizationId: "1",
      },
    });

    return {
      subjects,
    };
  }),

  createSubject: publicProcedure
    .input(
      z.object({
        code: z.string(),
        name: z.string(),
        description: z.string(),
        termId: z.string(),
        organizationId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { code, name, description, termId, organizationId } = input;

      await ctx.prisma.subject.create({
        data: {
          code,
          name,
          description,
          termId,
          organizationId,
        },
      });

      return {
        success: true,
      };
    }),

  getClassrooms: publicProcedure.query(async ({ ctx }) => {
    const classrooms = await ctx.prisma.classRoom.findMany({
      where: {
        organizationId: "1",
      },
    });

    return {
      classrooms,
    };
  }),

  createClassroom: publicProcedure
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
    .mutation(async ({ input, ctx }) => {
      const { name, classLevel, organizationId } = input;

      await ctx.prisma.classRoom.create({
        data: {
          name,
          classLevel,
          organizationId,
        },
      });

      return {
        success: true,
      };
    }),

  getTeachers: publicProcedure.query(async ({ ctx }) => {
    const teachers = await ctx.prisma.teacher.findMany({
      where: {
        organizationId: "1",
      },
    });

    return {
      teachers,
    };
  }),

  createTeacher: publicProcedure
    .input(
      z.object({
        fullName: z.string(),
        description: z.string(),
        department: z.string(),
        organizationId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { fullName, description, department, organizationId } = input;

      await ctx.prisma.teacher.create({
        data: {
          fullName,
          description,
          department,
          organizationId,
        },
      });

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
