import { prisma } from "@/config";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

async function getActivitiesDates() {
  const activitiesDates = await prisma.activity.groupBy({
    by: ["date"]
  });
  const datesObj = activitiesDates.map(obj => {return (
    { ...obj,
      date: dayjs(obj.date).format("DD/MM"),
      name: dayjs(obj.date).locale("pt-br").format("dddd").split("-")[0],
    }
  );});
  return datesObj;
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

  function timeToMinutes(time: string) {
    const hour = +time.split(":")[0];
    const minutes = +time.split(":")[1];
    return (hour*60)+minutes;
  }

  const newActivities = activities.map(activity => {
    const duration = timeToMinutes(activity.EndTime) - timeToMinutes(activity.StartTime);
    return ({
      id: activity.id,
      title: activity.title,
      time: activity.StartTime + " - " + activity.EndTime,
      duration: duration/60,
      vacancy: activity.capacity - activity._count.User_Activity
    });
  });

  return newActivities;
}

const activitiesRepository = {
  getActivitiesDates,
  getActivitiesByDateAndLocal
};

export default activitiesRepository;
