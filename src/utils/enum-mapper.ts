import type { ClassLevel, LessonType } from "@prisma/client";

const LessonTypeMap: Record<LessonType | "None", string> = {
  COMPULSORY: "Compulsory",
  DEPARTMENTAL_COMPULSORY: "Departmental Compulsory",
  ELECTIVE: "Elective",
  None: "None",
};

const ClassLevelMap: Record<ClassLevel, string> = {
  L9: "9. Grade",
  L10: "10. Grade",
  L11: "11. Grade",
  L12: "12. Grade",
};

export { LessonTypeMap, ClassLevelMap };
