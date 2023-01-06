import { prisma } from "@/config";
import dayjs from "dayjs";

async function getActivitiesDates() {
  const activitiesDates = await prisma.activity.groupBy({
    by: ["date"]
  });
  console.log(activitiesDates);
  //const dates = activitiesDates.map(activity => dayjs(activity.StartTime).format("YYYY-MM-DD"));
  //const uniqueDates = [...new Set(dates)];
  /*const datesObj = activitiesDates.map(date => {return (
    {
      name: dayjs(date).format("dddd"),
      date
    }
  );});*/
  return activitiesDates;
}

async function getActivitiesByDateAndLocal(date: string, localId: number) {
  const activities = await prisma.activity.findMany({
    where: {
      date,
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
