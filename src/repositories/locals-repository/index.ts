import { prisma } from "@/config";
import { createClient } from "redis";
import { Local } from "@prisma/client";

const redisClient = createClient();

async function getLocals(): Promise<Local[]> {
  await redisClient.connect();

  const localsData = await redisClient.get("locals");

  if (!localsData) {
    const locals = await prisma.local.findMany();
    await redisClient.set("locals", JSON.stringify(locals));
    await redisClient.disconnect();
    return locals;
  }
  
  await redisClient.disconnect();
  return JSON.parse(localsData);
}
  
const localsRepository = {
  getLocals
};

export default localsRepository;
