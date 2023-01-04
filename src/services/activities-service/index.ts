import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import activitiesRepository from "@/repositories/activities-repository";
import { notFoundError, requestError } from "@/errors";
import { Activity } from "@prisma/client";
import localsRepository from "@/repositories/locals-repository";

async function listActivities(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (ticket.status === "RESERVED") {
    throw requestError(402, "PaymentRequired");
  } 

  try {
    const activitiesDates = await activitiesRepository.getActivitiesDates();
    const locals = await localsRepository.getLocals();

    const activitiesObj = activitiesDates.map(activity => {return(
      { ...activity, locals }
    );});

    return activitiesObj;
  } catch (error) {
    throw requestError(400, "BadRequest");
  }
}

const activitiesService = {
  listActivities
};
  
export default activitiesService;
