import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import createTimetableSchema from "~/schemas/create-timetable";
import axios from "axios";
import { env } from "~/env.mjs";
import createTimetableRequest, {
  type TimetableRequest,
} from "~/utils/create-timetable-request";

export const timetableRouter = createTRPCRouter({
  createTimetable: protectedProcedure
    .input(createTimetableSchema)
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.session.user.orgId;

      if (!orgId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const { timetable } = input;

      if (!timetable) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Must provide timetable",
        });
      }

      const request = await createTimetableRequest(input);

      try {
        const res = await axios
          .post<TimetableRequest>(
            env.SERVERLESS_FUNCTION_URL,
            {
              request,
            },
            {
              headers: {
                ContentType: "application/json",
              },
            }
          )
          .then((response) => {
            return response.data;
          });

        return {
          response: res,
        };
      } catch (error) {
        console.log("err", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),

  getTimetable: protectedProcedure
    .input(
      z.object({
        classroomId: z.string().optional(),
        teacherId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { orgId } = ctx.session.user;

      if (!orgId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const { classroomId, teacherId } = input;

      if (!classroomId && !teacherId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Must provide either classroomId or teacherId",
        });
      }

      if (classroomId && !teacherId) {
        const classes = await ctx.prisma.class.findMany({
          where: {
            classroomId,
            organizationId: orgId,
          },
          include: {
            Classroom: true,
          },
        });

        if (!classes) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Class not found",
          });
        }

        return {
          classes,
        };
      }

      if (!classroomId && teacherId) {
        const classes = await ctx.prisma.class.findMany({
          where: {
            teacherId,
            organizationId: orgId,
          },
          include: {
            Teacher: true,
          },
        });

        if (!classes) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Class not found",
          });
        }

        return {
          classes,
        };
      }

      return {
        classes: [],
      };
    }),

  getTeacherTimetable: protectedProcedure.query(async ({ ctx }) => {
    const { orgId, id } = ctx.session.user;

    if (!orgId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    const foundTeacher = await ctx.prisma.teacher.findUnique({
      where: {
        userId: id,
      },
    });

    if (!foundTeacher) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Teacher not found",
      });
    }

    const classes = await ctx.prisma.class.findMany({
      where: {
        teacherId: foundTeacher.id,
        organizationId: orgId,
      },
      include: {
        Teacher: true,
      },
    });

    if (!classes) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Class not found",
      });
    }

    return {
      classes,
    };
  }),
});
