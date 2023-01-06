import { prisma } from "@/config";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

async function getActivitiesDates() {
  const activitiesDates = await prisma.activity.groupBy({
    by: ["date"]
  });
  const datesObj = activitiesDates.map(obj => {return (
    { ...obj,
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

  return activities;
}

const activitiesRepository = {
  getActivitiesDates,
  getActivitiesByDateAndLocal
};

export default activitiesRepository;
