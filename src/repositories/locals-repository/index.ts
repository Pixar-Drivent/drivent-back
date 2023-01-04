import { prisma } from "@/config";

async function getLocals() {
  return prisma.local.findMany();
}
  
const localsRepository = {
  getLocals
};

export default localsRepository;
