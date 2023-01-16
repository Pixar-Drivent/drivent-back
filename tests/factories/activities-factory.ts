import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createActivities() {
  const local = await prisma.local.create({
    data: { name: faker.lorem.words() }
  });

  await prisma.activity.createMany({
    data: [
      {
        title: faker.lorem.words(),
        localId: local.id,
        date: "2023-01-09",
        StartTime: "09:00",
        EndTime: "11:00",
        capacity: 10
      },
      {
        title: faker.lorem.words(),
        localId: local.id,
        date: "2023-01-10",
        StartTime: "09:00",
        EndTime: "10:00",
        capacity: 10
      },
      {
        title: faker.lorem.words(),
        localId: local.id,
        date: "2023-01-10",
        StartTime: "10:00",
        EndTime: "11:00",
        capacity: 10
      }
    ]
  });
}
