import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createLocal() {
  return await prisma.local.create({
    data: {
      name: faker.name.firstName(),
    },
  });
}

export async function createActivity(
  localId: number,
  StartTime: string,
  EndTime: string,
  capacity: number,
  date: string,
) {
  return await prisma.activity.create({
    data: {
      title: faker.name.firstName(),
      localId: localId,
      StartTime: StartTime,
      EndTime: EndTime,
      capacity: capacity,
      date: date,
    },
  });
}

export async function createUserActivity(activityId: number, userId: number) {
  return prisma.user_Activity.create({
    data: {
      userId: userId,
      activityId: activityId,
    },
  });
}
