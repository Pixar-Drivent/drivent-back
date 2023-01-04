import { prisma } from "@/config";
import dayjs from "dayjs";

async function getActivitiesDates() {
  const activitiesDates = await prisma.activity.groupBy({
    by: ["StartTime"]
  });
  const dates = activitiesDates.map(activity => dayjs(activity.StartTime).format("DD/MM"));
  const uniqueDates = [...new Set(dates)];
  const datesObj = uniqueDates.map(date => {return (
    {
      name: dayjs(date).format("dddd"),
      date
    }
  );});
  return datesObj;
}

const activitiesRepository = {
  getActivitiesDates,
};

export default activitiesRepository;
