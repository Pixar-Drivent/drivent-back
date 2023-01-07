import { prisma } from "@/config";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { start } from "repl";

async function getActivitiesDates() {
  const activitiesDates = await prisma.activity.groupBy({
    by: ["date"],
  });
  const datesObj = activitiesDates.map((obj) => {
    return {
      ...obj,
      date: dayjs(obj.date).format("DD/MM"),
      name: dayjs(obj.date).locale("pt-br").format("dddd").split("-")[0],
    };
  });
  return datesObj;
}

function timeToMinutes(time: string) {
  const hour = +time.split(":")[0];
  const minutes = +time.split(":")[1];
  return hour * 60 + minutes;
}

async function getActivitiesByDateAndLocal(date: string, localId: number) {
  const activities = await prisma.activity.findMany({
    where: {
      date,
      localId,
    },
    include: {
      _count: true,
    },
  });

  const newActivities = activities.map((activity) => {
    const duration = timeToMinutes(activity.EndTime) - timeToMinutes(activity.StartTime);
    return {
      id: activity.id,
      title: activity.title,
      time: activity.StartTime + " - " + activity.EndTime,
      duration: duration / 60,
      vacancy: activity.capacity - activity._count.User_Activity,
    };
  });

  return newActivities;
}

async function findActivityById(activityId: number) {
  const activity = await prisma.activity.findFirst({
    where: {
      id: activityId,
    },
  });
  return activity;
}

async function findUserSubscription(userId: number, activityId: number) {
  const search = await prisma.user_Activity.findFirst({
    where: {
      AND: [
        {
          userId: userId,
        },
        {
          activityId: activityId,
        },
      ],
    },
  });
  return search;
}

async function findUserActivitesSameDayActivityId(userId: number, activityId: number) {
  const activities = await prisma.user_Activity.findMany({
    where: { userId: userId },
  });

  const desiredActivity = await prisma.activity.findFirst({
    where: { id: activityId },
  });

  const activitiesDetails = [];
  for (let i = 0; i < activities.length; i++) {
    const activityDetail = await prisma.activity.findFirst({
      where: {
        id: activities[i].activityId,
      },
    });
    if (activityDetail.date === desiredActivity.date) {
      activitiesDetails.push(activityDetail);
    }
  }

  //User desired activity:
  const activityStart = timeToMinutes(desiredActivity.StartTime);
  const activityEnd = timeToMinutes(desiredActivity.EndTime);

  for (let i = 0; i < activitiesDetails.length; i++) {
    //User activity already enrolled:
    const startTime = timeToMinutes(activitiesDetails[i].StartTime);
    const endTime = timeToMinutes(activitiesDetails[i].EndTime);

    if (!verifyInterval(activityStart, activityEnd, startTime, endTime)) {
      return false;
    }
  }
  return true;
}

function verifyInterval(a: number, b: number, c: number, d: number) {
  if (a <= c && b <= c) {
    console.log("New before old"); //trivial allow case
    return true;
  }

  if (a >= d && b >= d) {
    console.log("New after old"); //trivial allow case
    return true;
  }

  if (a === c) {
    console.log("Same start time"); //trivial conflict check
    return false;
  }
  if (b === d) {
    console.log("Same end time"); //trivial conflict check
    return false;
  }
  if (a >= c && b >= d && a <= d) {
    console.log("(new start) after (old start) and (new end) before (old end)"); //right intersection
    return false;
  }
  if (a <= c && b <= d && b >= c) {
    console.log("(old start) before (old start) and (new end) after (old end)"); //left intersection
    return false;
  }
  if (b >= d && a <= c) {
    console.log("(new) inside (old)"); //full intersection
    return false;
  }
  if (b >= d && a <= d) {
    console.log("(old) inside (new)"); //full intersection
    return false;
  }

  return true; //didn't find intersection
}

async function insertUserIntoActivity(userId: number, activityId: number) {
  const insertion = await prisma.user_Activity.create({
    data: {
      userId: userId,
      activityId: activityId,
    },
  });
  return insertion;
}

async function deleteUserFromActivity(userId: number, activityId: number) {
  const deleteOperation = await prisma.user_Activity.deleteMany({
    where: { userId: userId, activityId: activityId },
  });
  return deleteOperation;
}

const activitiesRepository = {
  getActivitiesDates,
  getActivitiesByDateAndLocal,
  findActivityById,
  findUserSubscription,
  insertUserIntoActivity,
  deleteUserFromActivity,
  findUserActivitesSameDayActivityId,
};

export default activitiesRepository;
