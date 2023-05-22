import { Branch, ClassLevel } from "@prisma/client";
import { z } from "zod";

const lessonSchema = z.object({
  lessonId: z.string(),
  lessonName: z.string(),
  weeklyHour: z.number(),
});

const classroomSchema = z
  .object({
    // select A-Z
    code: z
      .string()
      .min(1)
      .max(1)
      .regex(/^[A-Z]$/),
    classLevel: z.nativeEnum(ClassLevel),
    branch: z.nativeEnum(Object.assign(Branch, { none: "none" })).nullish(),
    advisorTeacherId: z.string().nullish(),
    lessons: z
      .array(lessonSchema)
      .refine((data) => {
        // check the total weeklyHour of the lesson array do not allow to exceed 40
        const totalWeeklyHour = data.reduce(
          (acc, curr) => acc + curr.weeklyHour,
          0
        );
        return totalWeeklyHour <= 40;
      })
      .refine((data) => {
        // check the array of lessons has at least one lesson
        return data.length > 0;
      }),
  })
  .refine((data) => {
    if (
      data.classLevel == ClassLevel.L11 ||
      data.classLevel == ClassLevel.L12
    ) {
      return data.branch !== undefined;
    }
    return true;
  });
export type ClassroomInput = z.infer<typeof classroomSchema>;

export default classroomSchema;
