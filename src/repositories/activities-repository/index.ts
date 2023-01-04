import { prisma } from "@/config";

async function getActivities() {
  return prisma.activity.findMany();
}

const activitiesRepository = {
  getActivities,
};

export default activitiesRepository;
