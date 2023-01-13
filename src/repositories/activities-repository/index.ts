import { prisma } from "@/config";
import { createClient } from "redis";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

const redisClient = createClient();

async function getActivitiesDates(): Promise<{date: string, name: string}[]> {
  await redisClient.connect();

  const activitiesData = await redisClient.get("driventActivitiesDates");

  if (!activitiesData) {
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
    await redisClient.setEx("driventActivitiesDates", 24*60*60, JSON.stringify(datesObj));
    await redisClient.disconnect();
    return datesObj;
  }

  await redisClient.disconnect();
  return JSON.parse(activitiesData);
}

function timeToMinutes(time: string) {
  const hour = +time.split(":")[0];
  const minutes = +time.split(":")[1];
  return hour * 60 + minutes;
}

async function getActivitiesByDateAndLocal(date: string, localId: number) {
  //BUG: Date is arriving as "day/month" but on prisma it is saved as "YYYY-MM-DD"
  //(Henrique) converted the string for this function to work
  const dateOnPrisma = "2023-"+date.split("/")[1]+"-"+date.split("/")[0]; //THIS IS ONLY GOING TO WORK FOR ACTIVITIES IN 2023

  const activities = await prisma.activity.findMany({
    where: {
      date: dateOnPrisma,
      localId,
    },
    include: {
      _count: true,
    },
    orderBy: {
      StartTime: "asc"
    }
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
    //trivial allow case: New before old
    return true;
  }

  if (a >= d && b >= d) {
    //trivial allow case: New after old
    return true;
  }

  return false; //intersection
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

async function findUserActivities(userId: number) {
  const activities = await prisma.user_Activity.findMany({
    where: {
      userId
    }
  });
  return activities;
}

const activitiesRepository = {
  getActivitiesDates,
  getActivitiesByDateAndLocal,
  findActivityById,
  findUserSubscription,
  insertUserIntoActivity,
  deleteUserFromActivity,
  findUserActivitesSameDayActivityId,
  findUserActivities
};

export default activitiesRepository;
