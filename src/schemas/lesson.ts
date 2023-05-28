import { LessonType } from "@prisma/client";
import { z } from "zod";

const lessonSchema = z.object({
  code: z.string().max(10).optional(),
  name: z.string().min(1).max(100),
  departmentId: z.string(),
  type: z.nativeEnum(LessonType),
  description: z.string().max(1000).optional(),
});

export type LessonInput = z.infer<typeof lessonSchema>;

export default lessonSchema;
