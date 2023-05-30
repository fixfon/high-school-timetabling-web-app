import { ClassHour, ClassLevel, Day, LessonType } from "@prisma/client";
import { type CreateTimetableInput } from "~/schemas/create-timetable";
import { prisma } from "~/server/db";

const createTimetableRequest = async (input: CreateTimetableInput) => {
  // filter classroom id list and teacher id list with unique values.
  // Also do not include classroomIds that do not have any teacherIds
  const classRoomIdList = input.timetable
    .filter((item) => item.teacherIdList.length > 0)
    .map((item) => item.classroomId);
  const teacherIdLists = input.timetable.map((item) => item.teacherIdList);
  const teacherIdList = new Set(
    teacherIdLists.reduce((acc, val) => acc.concat(val), [])
  );

  if (classRoomIdList.length <= 0 || teacherIdList.size <= 0) {
    throw new Error("No classroomIds or teacherIds provided");
  }

  // get classroom, classroomLesson, lesson, teacherLesson and teacher data
  const classRoomList = await prisma.classroom.findMany({
    where: {
      id: {
        in: classRoomIdList,
      },
    },
    include: {
      ClassroomLesson: {
        include: {
          Lesson: {
            include: {
              TeacherLesson: {
                include: {
                  Teacher: {
                    include: {
                      TeacherWorkPreference: true,
                      TeacherLesson: {
                        include: {
                          Lesson: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // if no classroom data is found, throw an error
  if (classRoomList.length <= 0) {
    throw new Error("No classroom data found");
  }

  // get all the lessons for the classrooms and create a unique lesson list with id, lessonName, lessonType
  const lessonList = classRoomList
    .map((classRoom) => classRoom.ClassroomLesson)
    .reduce((acc, val) => acc.concat(val), [])
    .map((classRoomLesson) => classRoomLesson.Lesson);

  // unique lesson list and create object array with id, lessonName, lessonType reduce giving me error
  const uniqueLessonList = lessonList.filter(
    (lesson, index, self) => index === self.findIndex((t) => t.id === lesson.id)
  );
  const lessonObjectList = uniqueLessonList.map((lesson) => {
    return {
      id: lesson.id,
      lessonName: lesson.name,
      lessonType: lesson.type,
    };
  });

  if (lessonObjectList.length <= 0) {
    throw new Error("No lesson data found");
  }

  // create classroom object list with id, classLevel, code, classroomLessonList(id, lessonName, lessonType, weeklyHour)
  const classRoomObjectList = classRoomList.map((classRoom) => {
    return {
      id: classRoom.id,
      classLevel: classRoom.classLevel,
      code: classRoom.code,
      classroomLessonList: classRoom.ClassroomLesson.map((classRoomLesson) => {
        return {
          id: classRoomLesson.Lesson.id,
          lessonName: classRoomLesson.Lesson.name,
          lessonType: classRoomLesson.Lesson.type,
          weeklyHour: classRoomLesson.weeklyHour,
        };
      }),
    };
  });

  // get teachers from database object this returns which teachers are able to teach the lessons in the classroom list
  const teacherLessonListRaw = lessonList
    .map((lesson) => lesson.TeacherLesson)
    .reduce((acc, val) => acc.concat(val), []);

  // filter unique teachers (.teacherId) from teacherLessonListRaw
  const uniqueTeacherLessonList = teacherLessonListRaw.filter(
    (teacherLesson, index, self) =>
      index === self.findIndex((t) => t.teacherId === teacherLesson.teacherId)
  );

  // remove teachers that are not in the teacherIdList
  const teacherLessonList = uniqueTeacherLessonList.filter((teacherLesson) =>
    teacherIdList.has(teacherLesson.teacherId)
  );

  // create teacher object list with id, name, teacherLessonList(id, lessonName, lessonType)
  // and timePreferences object list with day, classHours

  const teacherObjectList = teacherLessonList.map((teacherLesson) => {
    return {
      id: teacherLesson.teacherId,
      name: `${teacherLesson.Teacher.name} ${teacherLesson.Teacher.surname}`,
      teacherLessonList: teacherLesson.Teacher.TeacherLesson.map(
        (teacherLesson) => {
          return {
            id: teacherLesson.Lesson.id,
            lessonName: teacherLesson.Lesson.name,
            lessonType: teacherLesson.Lesson.type,
          };
        }
      ),
      timePreferences: teacherLesson.Teacher.TeacherWorkPreference.map(
        (TeacherWorkPreference) => {
          return {
            day: TeacherWorkPreference.workingDay,
            classHours: TeacherWorkPreference.workingHour,
          };
        }
      ),
    };
  });

  // add classroomObjectList a new property called prefferedTeacherList
  // This property will be an array of teacherObjectList
  // This array indicates which teachers are able to teach the that lessons of the classroom
  // But before adding this teacher to the array we will check if the teacher is selected in the input for that classroom

  const classRoomObjectListWithPreferredTeacherList = classRoomObjectList.map(
    (classRoom) => {
      const teacherList = teacherObjectList.filter((teacher) =>
        classRoom.classroomLessonList.some((classroomLesson) =>
          teacher.teacherLessonList.some(
            (teacherLesson) =>
              teacherLesson.id === classroomLesson.id &&
              input.timetable.some(
                (timetable) =>
                  timetable.classroomId === classRoom.id &&
                  timetable.teacherIdList.includes(teacher.id)
              )
          )
        )
      );

      return {
        ...classRoom,
        preferredTeacherList: teacherList,
      };
    }
  );

  return {
    lessons: [...lessonObjectList],
    classrooms: [...classRoomObjectListWithPreferredTeacherList],
    teachers: [...teacherObjectList],
  };
};

export default createTimetableRequest;

// create type from the function for the return type (not promised type)
export type TimetableRequest = {
  lessons: {
    id: string;
    lessonName: string;
    lessonType: LessonType;
  }[];
  classrooms: {
    preferredTeacherList: {
      id: string;
      name: string;
      teacherLessonList: {
        id: string;
        lessonName: string;
        lessonType: LessonType;
      }[];
      timePreferences: {
        day: Day;
        classHours: ClassHour[];
      }[];
    }[];
    id: string;
    classLevel: ClassLevel;
    code: string;
    classroomLessonList: {
      id: string;
      lessonName: string;
      lessonType: LessonType;
      weeklyHour: number;
    }[];
  }[];
  teachers: {
    id: string;
    name: string;
    teacherLessonList: {
      id: string;
      lessonName: string;
      lessonType: LessonType;
    }[];
    timePreferences: {
      day: Day;
      classHours: ClassHour[];
    }[];
  }[];
};
