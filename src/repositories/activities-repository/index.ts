import { prisma } from "@/config";
import dayjs from "dayjs";

async function getActivitiesDates() {
  const activitiesDates = await prisma.activity.groupBy({
    by: ["StartTime"]
  });
  const dates = activitiesDates.map(activity => dayjs(activity.StartTime).format("YYYY-MM-DD"));
  const uniqueDates = [...new Set(dates)];
  const datesObj = uniqueDates.map(date => {return (
    {
      name: dayjs(date).format("dddd"),
      date
    }
  );});
  return datesObj;
}

async function getActivitiesByDateAndLocal(date: string, localId: number) {
  const dateFilter = dayjs(date).toDate();
  const activities = await prisma.activity.findMany({
    where: {
      StartTime: {
        gte: dayjs(dateFilter.setUTCHours(0, 0, 0)).toDate(),
        lte: dayjs(dateFilter.setUTCHours(23, 59, 59)).toDate()
      },
      localId
    },
    include: {
      _count: true
    }
  });

  return activities;
}

const activitiesRepository = {
  getActivitiesDates,
  getActivitiesByDateAndLocal
};

export default activitiesRepository;
