import { z } from "zod";

// create a schema that validates the input
// input: which teacherIds are in which classroomIds
const createTimetableSchema = z.object({
  timetable: z.array(
    z.object({
      classroomId: z.string(),
      teacherIdList: z.array(z.string()),
    })
  ),
});

export type CreateTimetableInput = z.infer<typeof createTimetableSchema>;

export default createTimetableSchema;
