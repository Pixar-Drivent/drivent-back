import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import activitiesRepository from "@/repositories/activities-repository";
import { notFoundError, requestError } from "@/errors";
import { Activity } from "@prisma/client";

async function listActivities(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (ticket.status === "RESERVED") {
    throw requestError(402, "PaymentRequired");
  } 

  const activities = await activitiesRepository.getActivities();

  return activities;
}

const activitiesService = {
  listActivities
};
  
export default activitiesService;
