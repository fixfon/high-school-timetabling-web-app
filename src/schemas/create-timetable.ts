import { z } from "zod";

const createTimetableSchema = z
  .object({
    classroomIdList: z.array(z.string()),
    teacherIdList: z.array(z.string()),
  })
  .refine((data) => {
    return data.classroomIdList.length > 0 && data.teacherIdList.length > 0;
  }, "At least one classroom and one teacher must be selected");

export type CreateTimetableInput = z.infer<typeof createTimetableSchema>;

export default createTimetableSchema;
