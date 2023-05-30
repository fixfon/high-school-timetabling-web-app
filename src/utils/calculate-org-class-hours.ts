// user will provide start hour, break time, lunch time
// we will calculate 8 lesson hours wtih 40 minutes each
// lunch will be between 5th and 6th lesson
// (there will be no break after 5th lesson since there is luch break)
// and return clock hours

import type { ClassHour } from "@prisma/client";

const calculateOrgClassHours = (input: {
  startHour: string;
  breakTime: number;
  lunchTime: number;
}) => {
  const { startHour, breakTime, lunchTime } = input;

  const lessonDuration = 40;
  const lunchBreakAfterLesson = 5;
  const classHours = [];

  const startHourConveredToMinutes =
    parseInt(startHour.split(":")[0]!) * 60 +
    parseInt(startHour.split(":")[1]!);

  const lunchBreakStart =
    startHourConveredToMinutes +
    lessonDuration * lunchBreakAfterLesson +
    breakTime * (lunchBreakAfterLesson - 1);
  const lunchBreakEnd = lunchBreakStart + lunchTime;

  const lunchBreakClassHour = {
    name: "L",
    startHour: `${Math.floor(lunchBreakStart / 60)
      .toString()
      .padStart(2, "0")}:${(lunchBreakStart % 60).toString().padStart(2, "0")}`,
    endHour: `${Math.floor(lunchBreakEnd / 60)
      .toString()
      .padStart(2, "0")}:${(lunchBreakEnd % 60).toString().padStart(2, "0")}`,
  };

  classHours.push(lunchBreakClassHour);

  for (let i = 1; i <= 8; i++) {
    const classHourStart =
      startHourConveredToMinutes +
      lessonDuration * (i - 1) +
      breakTime * (i > lunchBreakAfterLesson ? i - 2 : i - 1) +
      lunchTime * (i > lunchBreakAfterLesson ? 1 : 0);

    const classHourEnd = classHourStart + lessonDuration;

    const classHour = {
      name: `C${i}` as ClassHour,
      startHour: `${Math.floor(classHourStart / 60)
        .toString()
        .padStart(2, "0")}:${(classHourStart % 60)
        .toString()
        .padStart(2, "0")}`,
      endHour: `${Math.floor(classHourEnd / 60)
        .toString()
        .padStart(2, "0")}:${(classHourEnd % 60).toString().padStart(2, "0")}`,
    };

    classHours.push(classHour);

    if (i !== 5 && i !== 8) {
      const breakHourStart = classHourEnd;

      const breakHourEnd = breakHourStart + breakTime;

      const breakHour = {
        name: `B${i}`,
        startHour: `${Math.floor(breakHourStart / 60)
          .toString()
          .padStart(2, "0")}:${(breakHourStart % 60)
          .toString()
          .padStart(2, "0")}`,
        endHour: `${Math.floor(breakHourEnd / 60)
          .toString()
          .padStart(2, "0")}:${(breakHourEnd % 60)
          .toString()
          .padStart(2, "0")}`,
      };

      classHours.push(breakHour);
    }
  }

  return classHours;
};

export default calculateOrgClassHours;
